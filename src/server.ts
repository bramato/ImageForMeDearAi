#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';

// Configuration and core systems
import configManager from './config/config.js';
import { initializeCache } from './cache/imageCache.js';
import { providerManager } from './providers/providerManager.js';

// Tools
import { generateImageTool, handleGenerateImage } from './tools/generateImage.js';
import { generateLogoTool, handleGenerateLogo } from './tools/generateLogo.js';
import { describeImageTool, handleDescribeImage } from './tools/describeImage.js';
import { tagImageTool, handleTagImage } from './tools/tagImage.js';

// Types
import type { McpToolResponse } from './types/index.js';

/**
 * Image Generation MCP Server
 * Provides AI-powered image generation, description, and tagging tools
 */
class ImageGenerationServer {
  private server: Server;
  private availableTools: Tool[] = [];

  constructor() {
    this.server = new Server(
      {
        name: 'image-for-me-dear-ai',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.availableTools,
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result: McpToolResponse;

        switch (name) {
          case 'generate_image':
            result = await handleGenerateImage(args as any);
            break;

          case 'generate_logo':
            result = await handleGenerateLogo(args as any);
            break;

          case 'describe_image':
            result = await handleDescribeImage(args as any);
            break;

          case 'tag_image':
            result = await handleTagImage(args as any);
            break;

          default:
            return {
              content: [
                {
                  type: 'text',
                  text: `Unknown tool: ${name}`,
                },
              ],
              isError: true,
            };
        }

        // Format successful response
        if (result.success) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result.data, null, 2),
              },
            ],
          };
        } else {
          // Format error response
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.error}`,
              },
            ],
            isError: true,
          };
        }

      } catch (error: any) {
        console.error(`Tool execution error for ${name}:`, error);
        
        return {
          content: [
            {
              type: 'text',
              text: `Unexpected error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Initialize server with configuration and providers
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing Image Generation MCP Server...');

    try {
      // Load configuration
      const config = await configManager.loadConfig();
      console.log('✅ Configuration loaded');

      // Initialize cache
      if (config.cache.enabled) {
        initializeCache(config.cache);
        console.log('✅ Cache system initialized');
      } else {
        console.log('⚠️  Cache disabled');
      }

      // Wait for providers to initialize
      await this.initializeProviders();

      // Setup available tools based on provider capabilities
      await this.setupAvailableTools();

      console.log(`✅ Server initialized with ${this.availableTools.length} available tools`);
      
    } catch (error) {
      console.error('❌ Failed to initialize server:', error);
      throw error;
    }
  }

  /**
   * Initialize providers and check availability
   */
  private async initializeProviders(): Promise<void> {
    try {
      // Give providers time to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));

      const stats = await providerManager.getProviderStats();
      console.log(`✅ Providers initialized: ${stats.availableProviders}/${stats.totalProviders} available`);

      // Log provider details
      for (const provider of stats.providerInfo) {
        const status = provider.available ? '✅' : '❌';
        console.log(`  ${status} ${provider.name}: ${provider.features.join(', ')}`);
      }

      if (stats.availableProviders === 0) {
        console.warn('⚠️  No providers are available. Please check your configuration.');
        console.warn('   - Ensure API keys are set in environment variables or config file');
        console.warn('   - Verify network connectivity to provider APIs');
      }

    } catch (error) {
      console.error('❌ Failed to initialize providers:', error);
    }
  }

  /**
   * Setup available tools based on provider capabilities
   */
  private async setupAvailableTools(): Promise<void> {
    const capabilities = await providerManager.getCapabilities();
    const allTools = [
      { tool: generateImageTool, required: capabilities.canGenerate },
      { tool: generateLogoTool, required: capabilities.canGenerateLogos },
      { tool: describeImageTool, required: capabilities.canDescribe },
      { tool: tagImageTool, required: capabilities.canTag },
    ];

    // Add tools that have available providers
    this.availableTools = allTools
      .filter(({ required }) => required)
      .map(({ tool }) => tool);

    // Log available tools
    console.log('🔧 Available tools:');
    for (const tool of this.availableTools) {
      console.log(`  ✅ ${tool.name}: ${tool.description?.split('\n')[0] || 'No description'}`);
    }

    if (this.availableTools.length === 0) {
      console.warn('⚠️  No tools available. Server will have limited functionality.');
    }
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    console.log('🌐 Starting MCP server on stdio transport...');
    
    await this.server.connect(transport);
    console.log('✅ MCP server is running and ready to accept requests');
  }

  /**
   * Get server status information
   */
  async getStatus(): Promise<{
    server: { name: string; version: string };
    providers: any;
    tools: string[];
    capabilities: any;
  }> {
    return {
      server: {
        name: 'image-for-me-dear-ai',
        version: '1.0.0',
      },
      providers: await providerManager.getProviderStats(),
      tools: this.availableTools.map(tool => tool.name),
      capabilities: await providerManager.getCapabilities(),
    };
  }
}

/**
 * Main server startup function
 */
async function main(): Promise<void> {
  try {
    const server = new ImageGenerationServer();
    
    // Initialize server
    await server.initialize();
    
    // Start server
    await server.start();
    
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

/**
 * Handle process signals for graceful shutdown
 */
function setupGracefulShutdown(): void {
  const shutdown = (signal: string) => {
    console.log(`\n📝 Received ${signal}, shutting down gracefully...`);
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

// Initialize graceful shutdown
setupGracefulShutdown();

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { ImageGenerationServer };
export default main;