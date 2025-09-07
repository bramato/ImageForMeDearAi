#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import configManager from '../config/config.js';
import type { InstallationOptions, ProviderSetupResult } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Interactive Installation Script for Image Generation MCP Server
 */
class InstallationWizard {
  private options: InstallationOptions = {
    providers: [],
    outputDirectory: './generated-images',
    enableCache: true,
    cacheSize: 100,
  };

  /**
   * Run the complete installation process
   */
  async run(): Promise<void> {
    console.log(chalk.blue.bold('🎨 Image Generation MCP Server - Installation Wizard'));
    console.log(chalk.gray('This wizard will help you configure the server with your preferred AI providers.\n'));

    try {
      // Welcome and overview
      await this.showWelcome();
      
      // Provider selection
      await this.selectProviders();
      
      // Configure each selected provider
      await this.configureProviders();
      
      // General settings
      await this.configureSettings();
      
      // Save configuration
      await this.saveConfiguration();
      
      // Test providers
      await this.testProviders();
      
      // Final setup
      await this.finalSetup();
      
      console.log(chalk.green.bold('\n✅ Installation completed successfully!'));
      console.log(chalk.white('Your Image Generation MCP Server is now ready to use.'));
      
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Installation failed:'), error);
      process.exit(1);
    }
  }

  /**
   * Show welcome message and basic information
   */
  private async showWelcome(): Promise<void> {
    console.log(chalk.yellow('📋 What this server provides:'));
    console.log('  • AI-powered image generation');
    console.log('  • Professional logo creation (transparent PNG)');
    console.log('  • Image description and analysis');
    console.log('  • Automatic image tagging');
    console.log('  • 15+ artistic styles');
    console.log('  • Intelligent caching system\n');

    const { continue: shouldContinue } = await (inquirer.prompt as any)([{
      type: 'confirm',
      name: 'continue',
      message: 'Ready to configure your server?',
      default: true,
    }]);

    if (!shouldContinue) {
      console.log(chalk.gray('Installation cancelled.'));
      process.exit(0);
    }
  }

  /**
   * Provider selection step
   */
  private async selectProviders(): Promise<void> {
    console.log(chalk.blue.bold('\n🔧 Provider Selection'));
    
    const providerInfo = {
      chatgpt: {
        name: 'ChatGPT/DALL-E',
        description: 'OpenAI\'s DALL-E for high-quality image generation and GPT-4 Vision for descriptions',
        features: ['Image Generation', 'Image Description', 'Logo Creation'],
        requirements: 'OpenAI API Key',
      },
      huggingface: {
        name: 'HuggingFace',
        description: 'Stable Diffusion and other open-source models',
        features: ['Image Generation', 'Image Description', 'Image Tagging', 'Logo Creation'],
        requirements: 'HuggingFace API Key',
      },
    };

    // Display provider information
    for (const [key, info] of Object.entries(providerInfo)) {
      console.log(chalk.white.bold(`\n📦 ${info.name}`));
      console.log(chalk.gray(`   ${info.description}`));
      console.log(chalk.green(`   Features: ${info.features.join(', ')}`));
      console.log(chalk.yellow(`   Requirements: ${info.requirements}`));
    }

    const { providers } = await (inquirer.prompt as any)([{
      type: 'checkbox',
      name: 'providers',
      message: 'Which providers would you like to configure?',
      choices: [
        {
          name: `${providerInfo.chatgpt.name} - Premium quality, best for professional use`,
          value: 'chatgpt',
        },
        {
          name: `${providerInfo.huggingface.name} - Open source models, more customizable`,
          value: 'huggingface',
        },
      ],
      validate: (input: any) => {
        if (input.length === 0) {
          return 'Please select at least one provider';
        }
        return true;
      },
    }]);

    this.options.providers = providers;
  }

  /**
   * Configure each selected provider
   */
  private async configureProviders(): Promise<void> {
    console.log(chalk.blue.bold('\n🔑 Provider Configuration'));

    for (const providerName of this.options.providers) {
      await this.configureProvider(providerName as 'chatgpt' | 'huggingface');
    }
  }

  /**
   * Configure individual provider
   */
  private async configureProvider(provider: 'chatgpt' | 'huggingface'): Promise<void> {
    console.log(chalk.white.bold(`\n⚙️  Configuring ${provider.toUpperCase()}`));

    if (provider === 'chatgpt') {
      await this.configureChatGPT();
    } else if (provider === 'huggingface') {
      await this.configureHuggingFace();
    }
  }

  /**
   * Configure ChatGPT/OpenAI provider
   */
  private async configureChatGPT(): Promise<void> {
    console.log(chalk.gray('OpenAI API keys can be obtained from: https://platform.openai.com/api-keys'));
    
    const questions = [
      {
        type: 'password',
        name: 'apiKey',
        message: 'Enter your OpenAI API key:',
        mask: '*',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'API key is required';
          }
          if (!input.startsWith('sk-')) {
            return 'OpenAI API keys should start with "sk-"';
          }
          return true;
        },
      },
      {
        type: 'list',
        name: 'model',
        message: 'Which DALL-E model would you like to use?',
        choices: [
          { name: 'DALL-E 3 (Recommended) - Higher quality, more creative', value: 'dall-e-3' },
          { name: 'DALL-E 2 - Faster, multiple images per request', value: 'dall-e-2' },
        ],
        default: 'dall-e-3',
      },
      {
        type: 'input',
        name: 'organization',
        message: 'OpenAI Organization ID (optional):',
        default: '',
      },
    ];

    const answers = await (inquirer.prompt as any)(questions);
    
    // Store in environment for immediate use
    process.env.OPENAI_API_KEY = answers.apiKey;
    process.env.CHATGPT_MODEL = answers.model;
    if (answers.organization) {
      process.env.OPENAI_ORGANIZATION = answers.organization;
    }
    process.env.CHATGPT_ENABLED = 'true';
  }

  /**
   * Configure HuggingFace provider
   */
  private async configureHuggingFace(): Promise<void> {
    console.log(chalk.gray('HuggingFace tokens can be obtained from: https://huggingface.co/settings/tokens'));
    
    const questions = [
      {
        type: 'password',
        name: 'apiKey',
        message: 'Enter your HuggingFace API token:',
        mask: '*',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'API token is required';
          }
          return true;
        },
      },
      {
        type: 'list',
        name: 'model',
        message: 'Which model would you like to use?',
        choices: [
          { name: 'Stable Diffusion XL (Recommended) - High quality, versatile', value: 'stabilityai/stable-diffusion-xl-base-1.0' },
          { name: 'Stable Diffusion 2.1 - Faster generation', value: 'stabilityai/stable-diffusion-2-1' },
          { name: 'Stable Diffusion 1.5 - Classic model', value: 'runwayml/stable-diffusion-v1-5' },
        ],
        default: 'stabilityai/stable-diffusion-xl-base-1.0',
      },
    ];

    const answers = await (inquirer.prompt as any)(questions);
    
    // Store in environment for immediate use
    process.env.HUGGINGFACE_API_KEY = answers.apiKey;
    process.env.HUGGINGFACE_MODEL = answers.model;
    process.env.HUGGINGFACE_ENABLED = 'true';
  }

  /**
   * Configure general settings
   */
  private async configureSettings(): Promise<void> {
    console.log(chalk.blue.bold('\n⚙️  General Settings'));

    const questions = [
      {
        type: 'input',
        name: 'outputDirectory',
        message: 'Directory for generated images:',
        default: './generated-images',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Output directory is required';
          }
          return true;
        },
      },
      {
        type: 'confirm',
        name: 'enableCache',
        message: 'Enable caching for faster repeated requests?',
        default: true,
      },
    ];

    let answers = await (inquirer.prompt as any)(questions);

    if (answers.enableCache) {
      const cacheQuestions = [
        {
          type: 'number',
          name: 'cacheSize',
          message: 'Maximum number of cached images:',
          default: 100,
          validate: (input: number) => {
            if (input < 1) return 'Cache size must be at least 1';
            if (input > 1000) return 'Cache size cannot exceed 1000';
            return true;
          },
        },
        {
          type: 'list',
          name: 'cacheDuration',
          message: 'How long should images be cached?',
          choices: [
            { name: '1 hour', value: 3600000 },
            { name: '24 hours (Recommended)', value: 86400000 },
            { name: '7 days', value: 604800000 },
            { name: '30 days', value: 2592000000 },
          ],
          default: 86400000,
        },
      ];

      const cacheAnswers = await (inquirer.prompt as any)(cacheQuestions);
      answers = { ...answers, ...cacheAnswers };
    }

    this.options = {
      ...this.options,
      outputDirectory: answers.outputDirectory,
      enableCache: answers.enableCache,
      cacheSize: answers.cacheSize || 100,
    };

    // Set cache environment variables
    process.env.OUTPUT_DIRECTORY = answers.outputDirectory;
    process.env.CACHE_ENABLED = answers.enableCache.toString();
    if (answers.enableCache) {
      process.env.CACHE_MAX_SIZE = answers.cacheSize.toString();
      process.env.CACHE_TTL = answers.cacheDuration.toString();
    }
  }

  /**
   * Save configuration to file
   */
  private async saveConfiguration(): Promise<void> {
    const spinner = ora('Saving configuration...').start();

    try {
      // Generate configuration
      await configManager.generateExampleConfig();
      
      // Load and update configuration
      const config = await configManager.loadConfig();
      await configManager.saveConfig(config);
      
      spinner.succeed('Configuration saved');
      
    } catch (error) {
      spinner.fail('Failed to save configuration');
      throw error;
    }
  }

  /**
   * Test provider connections
   */
  private async testProviders(): Promise<void> {
    console.log(chalk.blue.bold('\n🔍 Testing Provider Connections'));

    const results: ProviderSetupResult[] = [];

    for (const providerName of this.options.providers) {
      const spinner = ora(`Testing ${providerName} connection...`).start();
      
      try {
        // Test provider availability
        const result = await this.testProvider(providerName as 'chatgpt' | 'huggingface');
        results.push(result);
        
        if (result.configured) {
          spinner.succeed(`${providerName} connection successful`);
        } else {
          spinner.fail(`${providerName} connection failed: ${result.error}`);
        }
        
      } catch (error) {
        results.push({
          provider: providerName,
          configured: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        spinner.fail(`${providerName} test failed`);
      }
    }

    // Display results summary
    console.log(chalk.white.bold('\n📊 Provider Test Results:'));
    for (const result of results) {
      const status = result.configured ? chalk.green('✅') : chalk.red('❌');
      const message = result.configured ? 'Ready' : `Error: ${result.error}`;
      console.log(`${status} ${result.provider}: ${message}`);
    }

    const successfulProviders = results.filter(r => r.configured).length;
    if (successfulProviders === 0) {
      console.log(chalk.red.bold('\n⚠️  No providers are working correctly.'));
      const { continue: shouldContinue } = await (inquirer.prompt as any)([{
        type: 'confirm',
        name: 'continue',
        message: 'Continue anyway? (Server will have limited functionality)',
        default: false,
      }]);
      
      if (!shouldContinue) {
        throw new Error('Installation cancelled due to provider configuration issues');
      }
    }
  }

  /**
   * Test individual provider
   */
  private async testProvider(provider: 'chatgpt' | 'huggingface'): Promise<ProviderSetupResult> {
    try {
      if (provider === 'chatgpt') {
        // Test OpenAI API
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return { provider, configured: true };
        
      } else if (provider === 'huggingface') {
        // Test HuggingFace API
        const model = process.env.HUGGINGFACE_MODEL || 'stabilityai/stable-diffusion-xl-base-1.0';
        const response = await fetch(`https://huggingface.co/api/models/${model}`, {
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return { provider, configured: true };
      }
      
      throw new Error('Unknown provider');
      
    } catch (error) {
      return {
        provider,
        configured: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Final setup and instructions
   */
  private async finalSetup(): Promise<void> {
    console.log(chalk.blue.bold('\n🏁 Final Setup'));

    const spinner = ora('Creating directories and files...').start();

    try {
      // Ensure directories exist
      await fs.ensureDir(path.resolve(projectRoot, this.options.outputDirectory));
      await fs.ensureDir(path.resolve(projectRoot, 'cache'));
      
      // Create .env file for future reference
      await this.createEnvFile();
      
      spinner.succeed('Setup completed');
      
    } catch (error) {
      spinner.fail('Setup failed');
      throw error;
    }

    // Display usage instructions
    this.showUsageInstructions();
  }

  /**
   * Create .env file with current configuration
   */
  private async createEnvFile(): Promise<void> {
    const envPath = path.resolve(projectRoot, '.env.example');
    const envContent = [
      '# Image Generation MCP Server Configuration',
      '# Copy this file to .env and fill in your API keys',
      '',
      '# OpenAI/ChatGPT Configuration',
      'OPENAI_API_KEY=your-openai-api-key-here',
      'CHATGPT_ENABLED=true',
      'CHATGPT_MODEL=dall-e-3',
      '# OPENAI_ORGANIZATION=your-org-id',
      '',
      '# HuggingFace Configuration',
      'HUGGINGFACE_API_KEY=your-huggingface-token-here',
      'HUGGINGFACE_ENABLED=true',
      'HUGGINGFACE_MODEL=stabilityai/stable-diffusion-xl-base-1.0',
      '',
      '# General Settings',
      `OUTPUT_DIRECTORY=${this.options.outputDirectory}`,
      `CACHE_ENABLED=${this.options.enableCache}`,
      `CACHE_MAX_SIZE=${this.options.cacheSize}`,
      'CACHE_TTL=86400000',
      '',
      '# Server Settings',
      'SERVER_NAME=image-for-me-dear-ai',
      'SERVER_VERSION=1.0.0',
    ].join('\n');

    await fs.writeFile(envPath, envContent);
  }

  /**
   * Show final usage instructions
   */
  private showUsageInstructions(): void {
    console.log(chalk.green.bold('\n🎉 Installation Complete!'));
    console.log(chalk.white('\n📖 Usage Instructions:'));
    console.log('  1. Start the server:');
    console.log(chalk.cyan('     npm start'));
    console.log('\n  2. Or run in development mode:');
    console.log(chalk.cyan('     npm run dev'));
    console.log('\n  3. Available tools:');
    console.log('     • generate_image - Create images with various styles');
    console.log('     • generate_logo - Create professional logos (PNG transparent)');
    console.log('     • describe_image - Analyze and describe images');
    console.log('     • tag_image - Extract tags and metadata from images');
    
    console.log(chalk.yellow('\n💡 Tips:'));
    console.log('  • Check logs for provider status on startup');
    console.log('  • Use the cache system for faster repeated requests');
    console.log('  • Try different styles for varied artistic results');
    console.log('  • Logo generation always creates transparent PNGs');
    
    console.log(chalk.gray('\n📁 Important Files:'));
    console.log(`  • Configuration: ${path.resolve(projectRoot, 'config.json')}`);
    console.log(`  • Generated images: ${path.resolve(projectRoot, this.options.outputDirectory)}`);
    console.log(`  • Cache: ${path.resolve(projectRoot, 'cache')}`);
    console.log(`  • Environment example: ${path.resolve(projectRoot, '.env.example')}`);
  }
}

/**
 * Main installation function
 */
async function main(): Promise<void> {
  const wizard = new InstallationWizard();
  await wizard.run();
}

// Run installation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(chalk.red.bold('\n❌ Installation failed:'), error);
    process.exit(1);
  });
}

export { InstallationWizard };
export default main;