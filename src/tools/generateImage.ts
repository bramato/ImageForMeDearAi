import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { providerManager } from '../providers/providerManager.js';
import { getCache } from '../cache/imageCache.js';
import { getImageStyleNames, isValidStyle, applyStyleToPrompt } from '../config/imageStyles.js';
import type { 
  McpImageGenerationArgs, 
  McpToolResponse,
  ImageGenerationRequest,
  ImageStyle 
} from '../types/index.js';

// Input validation schema
const GenerateImageArgsSchema = z.object({
  prompt: z.string()
    .min(1, 'Prompt is required')
    .max(4000, 'Prompt must be less than 4000 characters'),
  style: z.enum(['realistic', 'cartoon', 'anime', 'oil-painting', 'watercolor', 'sketch', 'digital-art', 'cyberpunk', 'steampunk', 'minimalist', 'vintage', 'pop-art', 'surreal', 'photographic', 'abstract'] as const).optional().describe('Image style to apply'),
  width: z.number()
    .int()
    .min(64)
    .max(2048)
    .optional()
    .describe('Image width in pixels (64-2048)'),
  height: z.number()
    .int()
    .min(64)
    .max(2048)
    .optional()
    .describe('Image height in pixels (64-2048)'),
  quality: z.enum(['standard', 'hd'])
    .optional()
    .default('standard')
    .describe('Image quality'),
  count: z.number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .default(1)
    .describe('Number of images to generate (1-10)'),
  provider: z.enum(['chatgpt', 'huggingface'])
    .optional()
    .describe('Preferred provider for generation'),
  format: z.enum(['png', 'jpeg', 'webp'])
    .optional()
    .default('png')
    .describe('Output image format'),
  seed: z.number()
    .int()
    .optional()
    .describe('Random seed for reproducible generation'),
  negativePrompt: z.string()
    .max(1000)
    .optional()
    .describe('Things to avoid in the generated image'),
});

/**
 * MCP Tool for generating images
 */
export const generateImageTool: Tool = {
  name: 'generate_image',
  description: `Generate images using AI providers with various styles and configurations.
  
Available styles: ${getImageStyleNames().join(', ')}

Features:
- Multiple AI providers (ChatGPT/DALL-E, HuggingFace/Stable Diffusion)
- 15+ predefined artistic styles
- Customizable dimensions and quality
- Automatic caching for faster subsequent requests
- Support for multiple image formats (PNG, JPEG, WebP)
- Fallback mechanisms for high availability

Examples:
- generate_image({prompt: "A serene mountain landscape", style: "oil-painting"})
- generate_image({prompt: "Modern logo design", width: 512, height: 512, format: "png"})
- generate_image({prompt: "Cyberpunk city", style: "cyberpunk", quality: "hd"})`,
  
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'Text description of the image to generate',
        minLength: 1,
        maxLength: 4000
      },
      style: {
        type: 'string',
        enum: ['realistic', 'cartoon', 'anime', 'oil-painting', 'watercolor', 'sketch', 'digital-art', 'cyberpunk', 'steampunk', 'minimalist', 'vintage', 'pop-art', 'surreal', 'photographic', 'abstract'],
        description: 'Image style to apply'
      },
      width: {
        type: 'number',
        description: 'Image width in pixels (64-2048)',
        minimum: 64,
        maximum: 2048
      },
      height: {
        type: 'number',
        description: 'Image height in pixels (64-2048)',
        minimum: 64,
        maximum: 2048
      },
      quality: {
        type: 'string',
        enum: ['standard', 'hd'],
        description: 'Generation quality level'
      },
      count: {
        type: 'number',
        description: 'Number of images to generate (1-4)',
        minimum: 1,
        maximum: 4
      },
      format: {
        type: 'string',
        enum: ['png', 'jpeg', 'webp'],
        description: 'Output image format'
      },
      seed: {
        type: 'number',
        description: 'Random seed for reproducible generation'
      },
      negativePrompt: {
        type: 'string',
        description: 'Things to avoid in the generated image',
        maxLength: 1000
      }
    },
    required: ['prompt']
  },
};

/**
 * Handle generate image tool execution
 */
export async function handleGenerateImage(args: McpImageGenerationArgs): Promise<McpToolResponse> {
  try {
    // Validate arguments
    const validatedArgs = GenerateImageArgsSchema.parse(args);
    
    // Check if any providers are available
    if (!(await providerManager.hasAvailableProviders())) {
      return {
        success: false,
        error: 'No image generation providers are currently available. Please check your configuration.',
      };
    }

    // Prepare generation request
    const request: ImageGenerationRequest = {
      prompt: validatedArgs.prompt,
      style: validatedArgs.style as ImageStyle | undefined,
      dimensions: validatedArgs.width && validatedArgs.height ? 
        { width: validatedArgs.width, height: validatedArgs.height } : undefined,
      quality: validatedArgs.quality,
      count: validatedArgs.count,
      format: validatedArgs.format,
      seed: validatedArgs.seed,
      negativePrompt: validatedArgs.negativePrompt,
    };

    // Check cache first
    const cache = getCache();
    let result;
    
    if (cache) {
      result = await cache.get(request);
      if (result) {
        console.log('Returning cached image result');
        return {
          success: true,
          data: {
            ...result,
            cached: true,
          },
        };
      }
    }

    // Generate new image
    console.log(`Generating image with prompt: "${validatedArgs.prompt}"`);
    
    result = await providerManager.generateImage(request, validatedArgs.provider);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Image generation failed',
      };
    }

    // Cache successful result
    if (cache && result.success) {
      await cache.set(request, result);
    }

    // Format response
    const responseData = {
      ...result,
      images: result.images.map(img => ({
        url: img.url,
        localPath: img.localPath,
        format: img.format,
        dimensions: img.dimensions,
        size: formatFileSize(img.size),
        metadata: {
          prompt: img.metadata.prompt,
          style: img.metadata.style,
          provider: img.metadata.provider,
          generatedAt: img.metadata.generatedAt,
          model: img.metadata.model,
        },
      })),
      capabilities: await providerManager.getCapabilities(),
      cacheStats: cache ? {
        hitRate: cache.getHitRate(),
        entries: cache.getStats().entries,
        diskUsage: cache.getFormattedDiskUsage(),
      } : null,
    };

    return {
      success: true,
      data: responseData,
    };

  } catch (error: any) {
    console.error('Generate image tool error:', error);
    
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