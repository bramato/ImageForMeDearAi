#!/usr/bin/env node

/**
 * Binary entry point for image-for-me-dear-ai
 * This script handles the CLI interface and setup wizard
 */

import { InstallationWizard } from '../scripts/install.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  try {
    switch (command) {
      case 'setup':
      case 'install':
      case 'configure':
      case undefined:
        // Run installation wizard by default
        console.log('🎨 ImageForMeDearAi Setup Wizard');
        console.log('==================================\n');
        
        const wizard = new InstallationWizard();
        await wizard.run();
        break;
        
      case 'server':
      case 'start':
        // Start the MCP server
        console.log('🚀 Starting ImageForMeDearAi MCP Server...\n');
        // Import and start the actual server
        const { startServer } = await import('../server.js');
        await startServer();
        break;
        
      case 'version':
      case '--version':
      case '-v':
        const pkg = await import('../../package.json', { with: { type: 'json' } });
        console.log(`image-for-me-dear-ai v${pkg.default.version}`);
        break;
        
      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;
        
      default:
        console.error(`Unknown command: ${command}`);
        console.log('Run "image-for-me-dear-ai --help" for usage information.');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🎨 ImageForMeDearAi - AI Image Generation MCP Server

Usage:
  image-for-me-dear-ai [command] [options]

Commands:
  setup, configure     Run the interactive setup wizard (default)
  server, start        Start the MCP server
  version, -v          Show version information
  help, -h             Show this help message

Examples:
  image-for-me-dear-ai              # Run setup wizard
  image-for-me-dear-ai setup        # Run setup wizard
  image-for-me-dear-ai server       # Start MCP server
  image-for-me-dear-ai --version    # Show version

Documentation:
  https://github.com/bramato/ImageForMeDearAi

For support and issues:
  https://github.com/bramato/ImageForMeDearAi/issues
`);
}

// Handle uncaught errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled promise rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error.message);
  process.exit(1);
});

// Run the main function
main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});