import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import fs from 'fs-extra';
import { z } from 'zod';
import type { 
  ServerConfig, 
  ChatGPTConfig, 
  HuggingFaceConfig, 
  CacheConfig 
} from '../types/index.js';

// Load environment variables
dotenvConfig();

// Validation schemas
const ChatGPTConfigSchema = z.object({
  enabled: z.boolean().default(false),
  apiKey: z.string().optional(),
  model: z.string().default('dall-e-3'),
  baseUrl: z.string().optional(),
  organization: z.string().optional(),
  timeout: z.number().default(30000),
});

const HuggingFaceConfigSchema = z.object({
  enabled: z.boolean().default(false),
  apiKey: z.string().optional(),
  model: z.string().default('stabilityai/stable-diffusion-xl-base-1.0'),
  endpoint: z.string().optional(),
  timeout: z.number().default(30000),
});

const CacheConfigSchema = z.object({
  enabled: z.boolean().default(true),
  ttl: z.number().default(3600000), // 1 hour in milliseconds
  maxSize: z.number().default(100), // max number of cached items
  directory: z.string().default('./cache'),
});

const ServerConfigSchema = z.object({
  providers: z.object({
    chatgpt: ChatGPTConfigSchema,
    huggingface: HuggingFaceConfigSchema,
  }),
  cache: CacheConfigSchema,
  server: z.object({
    name: z.string().default('image-for-me-dear-ai'),
    version: z.string().default('1.0.0'),
    port: z.number().optional(),
  }),
  output: z.object({
    directory: z.string().default('./generated-images'),
    format: z.string().default('png'),
    naming: z.string().default('{{timestamp}}-{{hash}}'),
  }),
});

class ConfigManager {
  private config: ServerConfig | null = null;
  private configPath: string;

  constructor() {
    this.configPath = path.resolve(process.cwd(), 'config.json');
  }

  /**
   * Load configuration from file or environment variables
   */
  async loadConfig(): Promise<ServerConfig> {
    if (this.config) {
      return this.config as ServerConfig;
    }

    let fileConfig = {};
    
    // Try to load from config file
    if (await fs.pathExists(this.configPath)) {
      try {
        fileConfig = await fs.readJson(this.configPath);
      } catch (error) {
        console.warn('Failed to parse config.json, using defaults:', error);
      }
    }

    // Merge with environment variables
    const envConfig = this.getConfigFromEnv();
    const mergedConfig = this.mergeConfigs(fileConfig, envConfig);

    // Validate configuration
    try {
      this.config = ServerConfigSchema.parse(mergedConfig);
    } catch (error) {
      throw new Error(`Invalid configuration: ${error}`);
    }

    // Ensure directories exist
    await this.ensureDirectories();

    return this.config as ServerConfig;
  }

  /**
   * Save current configuration to file
   */
  async saveConfig(config: ServerConfig): Promise<void> {
    this.config = config;
    await fs.writeJson(this.configPath, config, { spaces: 2 });
  }

  /**
   * Get configuration from environment variables
   */
  private getConfigFromEnv(): Partial<ServerConfig> {
    const envConfig: any = {
      providers: {
        chatgpt: {
          enabled: process.env.CHATGPT_ENABLED === 'true',
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.CHATGPT_MODEL || 'dall-e-3',
          baseUrl: process.env.OPENAI_BASE_URL,
          organization: process.env.OPENAI_ORGANIZATION,
          timeout: process.env.CHATGPT_TIMEOUT ? parseInt(process.env.CHATGPT_TIMEOUT, 10) : undefined,
        },
        huggingface: {
          enabled: process.env.HUGGINGFACE_ENABLED === 'true',
          apiKey: process.env.HUGGINGFACE_API_KEY,
          model: process.env.HUGGINGFACE_MODEL || 'stabilityai/stable-diffusion-xl-base-1.0',
          endpoint: process.env.HUGGINGFACE_ENDPOINT,
          timeout: process.env.HUGGINGFACE_TIMEOUT ? parseInt(process.env.HUGGINGFACE_TIMEOUT, 10) : undefined,
        },
      },
      cache: {
        enabled: process.env.CACHE_ENABLED !== 'false',
        ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL, 10) : undefined,
        maxSize: process.env.CACHE_MAX_SIZE ? parseInt(process.env.CACHE_MAX_SIZE, 10) : undefined,
        directory: process.env.CACHE_DIRECTORY || './cache',
      },
      server: {
        name: process.env.SERVER_NAME || 'image-for-me-dear-ai',
        version: process.env.SERVER_VERSION || '1.0.0',
        port: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : undefined,
      },
      output: {
        directory: process.env.OUTPUT_DIRECTORY || './generated-images',
        format: process.env.OUTPUT_FORMAT || 'png',
        naming: process.env.OUTPUT_NAMING || '{{timestamp}}-{{hash}}',
      },
    };

    // Remove undefined values
    return this.removeUndefined(envConfig);
  }

  /**
   * Deep merge configurations
   */
  private mergeConfigs(fileConfig: any, envConfig: any): any {
    return this.deepMerge(fileConfig, envConfig);
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else if (source[key] !== undefined) {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Remove undefined values from object
   */
  private removeUndefined(obj: any): any {
    const result: any = {};
    
    for (const key in obj) {
      if (obj[key] !== undefined) {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          result[key] = this.removeUndefined(obj[key]);
        } else {
          result[key] = obj[key];
        }
      }
    }
    
    return result;
  }

  /**
   * Ensure required directories exist
   */
  private async ensureDirectories(): Promise<void> {
    if (!this.config) return;

    const directories = [
      this.config.cache.directory,
      this.config.output.directory,
    ];

    for (const dir of directories) {
      await fs.ensureDir(path.resolve(process.cwd(), dir));
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): ServerConfig | null {
    return this.config;
  }

  /**
   * Check if a provider is enabled and configured
   */
  isProviderEnabled(provider: 'chatgpt' | 'huggingface'): boolean {
    if (!this.config) return false;
    
    const providerConfig = this.config.providers[provider];
    return providerConfig.enabled && !!providerConfig.apiKey;
  }

  /**
   * Get enabled providers
   */
  getEnabledProviders(): string[] {
    if (!this.config) return [];
    
    const enabled: string[] = [];
    
    if (this.isProviderEnabled('chatgpt')) {
      enabled.push('chatgpt');
    }
    
    if (this.isProviderEnabled('huggingface')) {
      enabled.push('huggingface');
    }
    
    return enabled;
  }

  /**
   * Update provider configuration
   */
  async updateProviderConfig(
    provider: 'chatgpt' | 'huggingface',
    config: Partial<ChatGPTConfig | HuggingFaceConfig>
  ): Promise<void> {
    if (!this.config) {
      await this.loadConfig();
    }
    
    if (this.config) {
      this.config.providers[provider] = {
        ...this.config.providers[provider],
        ...config,
      } as any;
      
      await this.saveConfig(this.config);
    }
  }

  /**
   * Generate example configuration file
   */
  async generateExampleConfig(): Promise<void> {
    const examplePath = path.resolve(process.cwd(), 'config.example.json');
    
    const exampleConfig = {
      providers: {
        chatgpt: {
          enabled: false,
          apiKey: 'your-openai-api-key',
          model: 'dall-e-3',
          timeout: 30000,
        },
        huggingface: {
          enabled: false,
          apiKey: 'your-huggingface-api-key',
          model: 'stabilityai/stable-diffusion-xl-base-1.0',
          timeout: 30000,
        },
      },
      cache: {
        enabled: true,
        ttl: 3600000,
        maxSize: 100,
        directory: './cache',
      },
      server: {
        name: 'image-for-me-dear-ai',
        version: '1.0.0',
      },
      output: {
        directory: './generated-images',
        format: 'png',
        naming: '{{timestamp}}-{{hash}}',
      },
    };
    
    await fs.writeJson(examplePath, exampleConfig, { spaces: 2 });
  }
}

export const configManager = new ConfigManager();
export default configManager;