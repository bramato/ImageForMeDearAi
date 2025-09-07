import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { providerManager } from '../providers/providerManager.js';
import { getCache } from '../cache/imageCache.js';
import type { 
  McpLogoGenerationArgs, 
  McpToolResponse,
  ImageGenerationRequest 
} from '../types/index.js';

// Input validation schema
const GenerateLogoArgsSchema = z.object({
  prompt: z.string()
    .min(1, 'Prompt is required')
    .max(2000, 'Prompt must be less than 2000 characters')
    .describe('Description of the logo to generate'),
  logoType: z.enum(['text', 'icon', 'combination'])
    .describe('Type of logo: text-based, icon/symbol, or combination of both'),
  width: z.number()
    .int()
    .min(128)
    .max(1024)
    .optional()
    .default(512)
    .describe('Logo width in pixels (128-1024, square recommended)'),
  height: z.number()
    .int()
    .min(128)
    .max(1024)
    .optional()
    .default(512)
    .describe('Logo height in pixels (128-1024, square recommended)'),
  style: z.enum(['minimalist', 'modern', 'vintage', 'professional', 'creative', 'elegant'])
    .optional()
    .default('minimalist')
    .describe('Logo design style'),
  primaryColor: z.string()
    .optional()
    .describe('Primary color for the logo (e.g., "blue", "#FF0000", "rgb(255,0,0)")'),
  secondaryColor: z.string()
    .optional()
    .describe('Secondary color for the logo (optional)'),
  backgroundColor: z.string()
    .optional()
    .default('transparent')
    .describe('Background color (default: transparent)'),
  provider: z.enum(['chatgpt', 'huggingface'])
    .optional()
    .describe('Preferred provider for generation'),
  industry: z.string()
    .optional()
    .describe('Industry or business type (e.g., "technology", "healthcare", "finance")'),
  businessName: z.string()
    .optional()
    .describe('Business or brand name to include in text-based or combination logos'),
});

/**
 * MCP Tool for generating logos
 */
export const generateLogoTool: Tool = {
  name: 'generate_logo',
  description: `Generate professional logos with transparent PNG background using AI providers.

Logo Types:
- text: Text-based logos with typography focus
- icon: Symbol/icon-based logos without text
- combination: Logos combining both text and icon elements

Styles:
- minimalist: Clean, simple design with minimal elements
- modern: Contemporary design with current trends
- vintage: Retro/classic design aesthetic
- professional: Business-appropriate, clean design
- creative: Artistic and unique design approach
- elegant: Sophisticated and refined design

Features:
- Always generates transparent PNG format for easy use
- Supports custom colors and color schemes
- Industry-specific design optimization
- Square dimensions optimized for various use cases
- Professional quality suitable for branding

Examples:
- generate_logo({prompt: "Tech startup logo", logoType: "combination", businessName: "TechCorp", primaryColor: "blue"})
- generate_logo({prompt: "Coffee shop icon", logoType: "icon", style: "vintage", primaryColor: "#8B4513"})
- generate_logo({prompt: "Law firm logo", logoType: "text", businessName: "Smith & Associates", style: "professional"})`,
  
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'Description of the logo to generate',
        minLength: 1,
        maxLength: 4000
      },
      logoType: {
        type: 'string',
        enum: ['text', 'icon', 'combination'],
        description: 'Type of logo to generate'
      },
      width: {
        type: 'number',
        description: 'Logo width in pixels',
        minimum: 64,
        maximum: 2048,
        default: 512
      },
      height: {
        type: 'number', 
        description: 'Logo height in pixels',
        minimum: 64,
        maximum: 2048,
        default: 512
      },
      quality: {
        type: 'string',
        enum: ['standard', 'hd'],
        description: 'Generation quality level'
      },
      style: {
        type: 'string',
        enum: ['realistic', 'cartoon', 'anime', 'oil-painting', 'watercolor', 'sketch', 'digital-art', 'cyberpunk', 'steampunk', 'minimalist', 'vintage', 'pop-art', 'surreal', 'photographic', 'abstract'],
        description: 'Style to apply to the logo'
      },
      primaryColor: {
        type: 'string',
        description: 'Primary color for the logo (hex, rgb, or color name)'
      },
      secondaryColor: {
        type: 'string', 
        description: 'Secondary color for the logo'
      },
      backgroundColor: {
        type: 'string',
        description: 'Background color (use "transparent" for transparent background)'
      },
      businessName: {
        type: 'string',
        description: 'Business name to include in the logo',
        maxLength: 50
      }
    },
    required: ['prompt', 'logoType']
  },
};

/**
 * Handle generate logo tool execution
 */
export async function handleGenerateLogo(args: McpLogoGenerationArgs): Promise<McpToolResponse> {
  try {
    // Validate arguments
    const validatedArgs = GenerateLogoArgsSchema.parse(args);
    
    // Check if any providers support logo generation
    const capabilities = await providerManager.getCapabilities();
    if (!capabilities.canGenerateLogos) {
      return {
        success: false,
        error: 'No providers available for logo generation. Transparent PNG support is required.',
      };
    }

    // Build enhanced prompt for logo generation
    const enhancedPrompt = buildLogoPrompt(validatedArgs);
    
    // Prepare generation request
    const request: ImageGenerationRequest = {
      prompt: enhancedPrompt,
      dimensions: { 
        width: validatedArgs.width, 
        height: validatedArgs.height 
      },
      format: 'png', // Always PNG for logos
      transparent: true, // Always transparent for logos
      quality: 'hd', // High quality for professional use
      count: 1, // Single logo
    };

    // Check cache first
    const cache = getCache();
    let result;
    
    if (cache) {
      result = await cache.get(request);
      if (result) {
        console.log('Returning cached logo result');
        return {
          success: true,
          data: {
            ...result,
            cached: true,
            logoSpecs: extractLogoSpecs(validatedArgs),
          },
        };
      }
    }

    // Generate new logo
    console.log(`Generating ${validatedArgs.logoType} logo: "${validatedArgs.prompt}"`);
    
    // Use best provider for logo generation
    const logoProvider = await providerManager.getBestProvider('logo');
    result = await providerManager.generateImage(request, logoProvider?.name);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Logo generation failed',
      };
    }

    // Validate logo output
    const validationResult = validateLogoOutput(result, validatedArgs);
    if (!validationResult.valid) {
      console.warn('Logo validation warning:', validationResult.warnings);
    }

    // Cache successful result
    if (cache && result.success) {
      await cache.set(request, result);
    }

    // Format response with logo-specific metadata
    const responseData = {
      ...result,
      logoSpecs: extractLogoSpecs(validatedArgs),
      validation: validationResult,
      usage: generateUsageGuidelines(validatedArgs),
      images: result.images.map(img => ({
        url: img.url,
        localPath: img.localPath,
        format: img.format,
        dimensions: img.dimensions,
        size: formatFileSize(img.size),
        transparent: true,
        logoType: validatedArgs.logoType,
        metadata: {
          ...img.metadata,
          logoType: validatedArgs.logoType,
          style: validatedArgs.style,
          colors: {
            primary: validatedArgs.primaryColor,
            secondary: validatedArgs.secondaryColor,
            background: validatedArgs.backgroundColor,
          },
          businessName: validatedArgs.businessName,
          industry: validatedArgs.industry,
        },
      })),
    };

    return {
      success: true,
      data: responseData,
    };

  } catch (error: any) {
    console.error('Generate logo tool error:', error);
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return {
        success: false,
        error: `Invalid arguments: ${error.errors.map((e: any) => e.message).join(', ')}`,
      };
    }

    return {
      success: false,
      error: error.message || 'Unexpected error occurred',
    };
  }
}

/**
 * Build enhanced prompt for logo generation
 */
function buildLogoPrompt(args: any): string {
  const parts: string[] = [];
  
  // Base prompt
  parts.push(args.prompt);
  
  // Logo type specific instructions
  switch (args.logoType) {
    case 'text':
      parts.push('text-only logo', 'typography-focused design', 'no icons or symbols');
      if (args.businessName) {
        parts.push(`featuring the text "${args.businessName}"`);
      }
      break;
    case 'icon':
      parts.push('icon-only logo', 'symbol-based design', 'no text elements');
      break;
    case 'combination':
      parts.push('logo with both text and icon elements', 'balanced composition');
      if (args.businessName) {
        parts.push(`incorporating the business name "${args.businessName}"`);
      }
      break;
  }
  
  // Style specifications
  parts.push(`${args.style} style design`);
  
  // Color specifications
  if (args.primaryColor) {
    parts.push(`primary color: ${args.primaryColor}`);
  }
  if (args.secondaryColor) {
    parts.push(`secondary color: ${args.secondaryColor}`);
  }
  
  // Background specification
  if (args.backgroundColor === 'transparent') {
    parts.push('transparent background', 'PNG format', 'no background');
  } else if (args.backgroundColor) {
    parts.push(`background color: ${args.backgroundColor}`);
  }
  
  // Industry context
  if (args.industry) {
    parts.push(`suitable for ${args.industry} industry`);
  }
  
  // Professional quality
  parts.push(
    'professional logo design',
    'high quality',
    'suitable for branding',
    'scalable design',
    'clean and crisp'
  );
  
  // Technical specifications
  parts.push('square aspect ratio', 'centered composition', 'clear and legible');
  
  return parts.join(', ');
}

/**
 * Extract logo specifications for metadata
 */
function extractLogoSpecs(args: any) {
  return {
    type: args.logoType,
    dimensions: {
      width: args.width,
      height: args.height,
      aspectRatio: '1:1',
    },
    style: args.style,
    colors: {
      primary: args.primaryColor || 'not specified',
      secondary: args.secondaryColor || 'not specified',
      background: args.backgroundColor || 'transparent',
    },
    businessName: args.businessName || 'not specified',
    industry: args.industry || 'not specified',
    format: 'PNG',
    transparent: true,
  };
}

/**
 * Validate logo output quality
 */
function validateLogoOutput(result: any, args: any) {
  const warnings: string[] = [];
  
  // Check if format is PNG
  const isPng = result.images.every((img: any) => img.format === 'png');
  if (!isPng) {
    warnings.push('Logo should be in PNG format for transparency support');
  }
  
  // Check dimensions (should be reasonably square for logos)
  result.images.forEach((img: any, index: number) => {
    const { width, height } = img.dimensions;
    const aspectRatio = width / height;
    
    if (aspectRatio < 0.8 || aspectRatio > 1.25) {
      warnings.push(`Image ${index + 1}: Non-square aspect ratio may not be ideal for logo use`);
    }
    
    if (width < 256 || height < 256) {
      warnings.push(`Image ${index + 1}: Low resolution may affect scalability`);
    }
  });
  
  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Generate usage guidelines for the logo
 */
function generateUsageGuidelines(args: any) {
  const guidelines: string[] = [
    'Use on light backgrounds for maximum visibility',
    'Maintain minimum size of 32x32 pixels for readability',
    'Do not alter colors or proportions',
    'Ensure adequate white space around the logo',
  ];
  
  if (args.logoType === 'text' || args.logoType === 'combination') {
    guidelines.push('Test legibility at small sizes');
    guidelines.push('Ensure text remains readable when scaled down');
  }
  
  if (args.primaryColor) {
    guidelines.push(`Primary color: ${args.primaryColor} - use consistently across brand materials`);
  }
  
  if (args.logoType === 'combination') {
    guidelines.push('Maintain relative proportions between text and icon elements');
  }
  
  return guidelines;
}

/**
 * Format file size for human readability
 */
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}