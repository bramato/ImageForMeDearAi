import { ChatGPTProvider } from './chatGptProvider.js';
import { HuggingFaceProvider } from './huggingFaceProvider.js';
import configManager from '../config/config.js';
import type { 
  ImageProvider, 
  ImageGenerationRequest, 
  ImageGenerationResult,
  ImageDescriptionResult,
  ImageTaggingResult,
  ServerConfig 
} from '../types/index.js';

/**
 * Manager for all image providers
 */
export class ProviderManager {
  private providers: Map<string, ImageProvider> = new Map();
  private config: ServerConfig | null = null;

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize all providers
   */
  private async initializeProviders(): Promise<void> {
    try {
      this.config = await configManager.loadConfig();
      
      // Initialize ChatGPT provider
      if (this.config.providers.chatgpt.enabled) {
        const chatGptProvider = new ChatGPTProvider(this.config.providers.chatgpt);
        this.providers.set('chatgpt', chatGptProvider);
      }

      // Initialize HuggingFace provider
      if (this.config.providers.huggingface.enabled) {
        const huggingFaceProvider = new HuggingFaceProvider(this.config.providers.huggingface);
        this.providers.set('huggingface', huggingFaceProvider);
      }

      console.log(`Initialized ${this.providers.size} image providers:`, Array.from(this.providers.keys()));
    } catch (error) {
      console.error('Failed to initialize providers:', error);
    }
  }

  /**
   * Get all available providers
   */
  getProviders(): ImageProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get provider by name
   */
  getProvider(name: string): ImageProvider | null {
    return this.providers.get(name) || null;
  }

  /**
   * Get enabled and available providers
   */
  async getAvailableProviders(): Promise<ImageProvider[]> {
    const providers = this.getProviders();
    const availableProviders: ImageProvider[] = [];

    for (const provider of providers) {
      try {
        if (await provider.isAvailable()) {
          availableProviders.push(provider);
        }
      } catch (error) {
        console.warn(`Provider ${provider.name} is not available:`, error);
      }
    }

    return availableProviders;
  }

  /**
   * Get best provider for a specific feature
   */
  async getBestProvider(feature: 'generation' | 'description' | 'tagging' | 'logo' = 'generation'): Promise<ImageProvider | null> {
    const availableProviders = await this.getAvailableProviders();
    
    // Filter providers that support the feature
    const supportingProviders = availableProviders.filter(provider => 
      provider.supportsFeature(feature)
    );

    if (supportingProviders.length === 0) {
      return null;
    }

    // Priority order for different features
    const priorities: Record<string, string[]> = {
      generation: ['chatgpt', 'huggingface'],
      description: ['chatgpt', 'huggingface'],
      tagging: ['huggingface', 'chatgpt'],
      logo: ['chatgpt', 'huggingface'],
    };

    const priorityOrder = priorities[feature] || ['chatgpt', 'huggingface'];

    // Return provider based on priority
    for (const providerName of priorityOrder) {
      const provider = supportingProviders.find(p => p.name === providerName);
      if (provider) {
        return provider;
      }
    }

    // Return first available provider if no priority match
    return supportingProviders[0] || null;
  }

  /**
   * Generate image using the best available provider
   */
  async generateImage(
    request: ImageGenerationRequest,
    preferredProvider?: string
  ): Promise<ImageGenerationResult> {
    let provider: ImageProvider | null = null;

    // Use preferred provider if specified and available
    if (preferredProvider) {
      provider = this.getProvider(preferredProvider);
      if (provider && !(await provider.isAvailable())) {
        console.warn(`Preferred provider ${preferredProvider} is not available, falling back to best available`);
        provider = null;
      }
    }

    // Get best provider for logo generation if needed
    if (!provider) {
      const feature = request.transparent ? 'logo' : 'generation';
      provider = await this.getBestProvider(feature);
    }

    if (!provider) {
      return {
        success: false,
        images: [],
        provider: 'none',
        requestId: '',
        error: 'No available providers for image generation',
      };
    }

    try {
      return await provider.generateImage(request);
    } catch (error: any) {
      console.error(`Image generation failed with provider ${provider.name}:`, error);
      
      // Try fallback provider
      const fallbackProvider = await this.getFallbackProvider(provider.name, 'generation');
      if (fallbackProvider) {
        console.log(`Trying fallback provider: ${fallbackProvider.name}`);
        try {
          return await fallbackProvider.generateImage(request);
        } catch (fallbackError: any) {
          console.error(`Fallback provider ${fallbackProvider.name} also failed:`, fallbackError);
        }
      }

      return {
        success: false,
        images: [],
        provider: provider.name,
        requestId: '',
        error: error.message || 'Image generation failed',
      };
    }
  }

  /**
   * Describe image using the best available provider
   */
  async describeImage(
    imageUrl: string,
    preferredProvider?: string
  ): Promise<ImageDescriptionResult> {
    let provider: ImageProvider | null = null;

    if (preferredProvider) {
      provider = this.getProvider(preferredProvider);
      if (provider && !(await provider.isAvailable())) {
        provider = null;
      }
    }

    if (!provider) {
      provider = await this.getBestProvider('description');
    }

    if (!provider || !provider.describeImage) {
      return {
        success: false,
        description: '',
        provider: 'none',
        error: 'No available providers for image description',
      };
    }

    try {
      return await provider.describeImage(imageUrl);
    } catch (error: any) {
      console.error(`Image description failed with provider ${provider.name}:`, error);
      
      const fallbackProvider = await this.getFallbackProvider(provider.name, 'description');
      if (fallbackProvider && fallbackProvider.describeImage) {
        try {
          return await fallbackProvider.describeImage(imageUrl);
        } catch (fallbackError: any) {
          console.error(`Fallback provider ${fallbackProvider.name} also failed:`, fallbackError);
        }
      }

      return {
        success: false,
        description: '',
        provider: provider.name,
        error: error.message || 'Image description failed',
      };
    }
  }

  /**
   * Tag image using the best available provider
   */
  async tagImage(
    imageUrl: string,
    preferredProvider?: string
  ): Promise<ImageTaggingResult> {
    let provider: ImageProvider | null = null;

    if (preferredProvider) {
      provider = this.getProvider(preferredProvider);
      if (provider && !(await provider.isAvailable())) {
        provider = null;
      }
    }

    if (!provider) {
      provider = await this.getBestProvider('tagging');
    }

    if (!provider || !provider.tagImage) {
      return {
        success: false,
        tags: [],
        provider: 'none',
        error: 'No available providers for image tagging',
      };
    }

    try {
      return await provider.tagImage(imageUrl);
    } catch (error: any) {
      console.error(`Image tagging failed with provider ${provider.name}:`, error);
      
      const fallbackProvider = await this.getFallbackProvider(provider.name, 'tagging');
      if (fallbackProvider && fallbackProvider.tagImage) {
        try {
          return await fallbackProvider.tagImage(imageUrl);
        } catch (fallbackError: any) {
          console.error(`Fallback provider ${fallbackProvider.name} also failed:`, fallbackError);
        }
      }

      return {
        success: false,
        tags: [],
        provider: provider.name,
        error: error.message || 'Image tagging failed',
      };
    }
  }

  /**
   * Get fallback provider (different from the failed one)
   */
  private async getFallbackProvider(
    failedProviderName: string,
    feature: 'generation' | 'description' | 'tagging'
  ): Promise<ImageProvider | null> {
    const availableProviders = await this.getAvailableProviders();
    
    return availableProviders.find(provider => 
      provider.name !== failedProviderName && 
      provider.supportsFeature(feature)
    ) || null;
  }

  /**
   * Get provider statistics
   */
  async getProviderStats(): Promise<{
    totalProviders: number;
    availableProviders: number;
    providerInfo: Array<{
      name: string;
      available: boolean;
      features: string[];
      supportedFormats: string[];
      maxImageCount: number;
    }>;
  }> {
    const allProviders = this.getProviders();
    const availableProviders = await this.getAvailableProviders();
    
    const providerInfo = await Promise.all(
      allProviders.map(async (provider) => {
        const isAvailable = await provider.isAvailable();
        const info = provider.getInfo();
        
        return {
          name: provider.name,
          available: isAvailable,
          features: info.features,
          supportedFormats: info.supportedFormats,
          maxImageCount: info.maxImageCount,
        };
      })
    );

    return {
      totalProviders: allProviders.length,
      availableProviders: availableProviders.length,
      providerInfo,
    };
  }

  /**
   * Reload providers configuration
   */
  async reloadProviders(): Promise<void> {
    // Clear existing providers
    this.providers.clear();
    
    // Reinitialize
    await this.initializeProviders();
  }

  /**
   * Check if any providers are available
   */
  async hasAvailableProviders(): Promise<boolean> {
    const availableProviders = await this.getAvailableProviders();
    return availableProviders.length > 0;
  }

  /**
   * Get provider capabilities summary
   */
  async getCapabilities(): Promise<{
    canGenerate: boolean;
    canDescribe: boolean;
    canTag: boolean;
    canGenerateLogos: boolean;
    supportedFormats: string[];
    maxImageCount: number;
  }> {
    const availableProviders = await this.getAvailableProviders();
    
    if (availableProviders.length === 0) {
      return {
        canGenerate: false,
        canDescribe: false,
        canTag: false,
        canGenerateLogos: false,
        supportedFormats: [],
        maxImageCount: 0,
      };
    }

    const capabilities = {
      canGenerate: availableProviders.some(p => p.supportsFeature('generation')),
      canDescribe: availableProviders.some(p => p.supportsFeature('description')),
      canTag: availableProviders.some(p => p.supportsFeature('tagging')),
      canGenerateLogos: availableProviders.some(p => p.supportsFeature('logo')),
      supportedFormats: [...new Set(availableProviders.flatMap(p => p.getSupportedFormats()))],
      maxImageCount: Math.max(...availableProviders.map(p => p.getMaxImageCount())),
    };

    return capabilities;
  }
}

// Global provider manager instance
export const providerManager = new ProviderManager();
export default providerManager;