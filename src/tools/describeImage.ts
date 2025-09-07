import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { providerManager } from '../providers/providerManager.js';
import type { McpImageDescriptionArgs, McpToolResponse } from '../types/index.js';

// Input validation schema
const DescribeImageArgsSchema = z.object({
  imageUrl: z.string()
    .url('Must be a valid URL')
    .describe('URL of the image to describe'),
  provider: z.enum(['chatgpt', 'huggingface'])
    .optional()
    .describe('Preferred provider for image description'),
  detailLevel: z.enum(['brief', 'detailed', 'comprehensive'])
    .optional()
    .default('detailed')
    .describe('Level of detail in the description'),
  focus: z.enum(['general', 'objects', 'people', 'scene', 'colors', 'composition', 'style'])
    .optional()
    .describe('Specific aspect to focus on in the description'),
  language: z.string()
    .optional()
    .default('english')
    .describe('Language for the description'),
});

/**
 * MCP Tool for describing images using AI vision models
 */
export const describeImageTool: Tool = {
  name: 'describe_image',
  description: `Analyze and describe images using AI vision models (GPT-4 Vision, BLIP, etc.).

Detail Levels:
- brief: Short, concise description (1-2 sentences)
- detailed: Comprehensive description including objects, scene, colors, and composition
- comprehensive: Extensive analysis including style, mood, technical aspects, and artistic elements

Focus Areas:
- general: Overall image description (default)
- objects: Focus on identifying and describing objects in the image
- people: Focus on people, their appearance, actions, and expressions
- scene: Focus on the setting, location, and environment
- colors: Focus on color palette, lighting, and visual tone
- composition: Focus on visual arrangement, framing, and artistic composition
- style: Focus on artistic style, technique, and aesthetic qualities

Providers:
- ChatGPT: Uses GPT-4 Vision for detailed, contextual descriptions
- HuggingFace: Uses specialized vision models like BLIP for technical descriptions

Examples:
- describe_image({imageUrl: "https://example.com/photo.jpg"})
- describe_image({imageUrl: "https://example.com/artwork.jpg", detailLevel: "comprehensive", focus: "style"})
- describe_image({imageUrl: "https://example.com/portrait.jpg", focus: "people", provider: "chatgpt"})`,
  
  inputSchema: {
    type: 'object',
    properties: {
      imageUrl: {
        type: 'string',
        description: 'URL of the image to analyze',
        format: 'uri'
      },
      provider: {
        type: 'string',
        enum: ['chatgpt', 'huggingface'],
        description: 'Provider to use for description'
      },
      detailLevel: {
        type: 'string',
        enum: ['brief', 'detailed', 'comprehensive'],
        description: 'Level of detail in description',
        default: 'detailed'
      },
      focus: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Specific aspects to focus on'
      },
      language: {
        type: 'string',
        description: 'Language for the description',
        default: 'en'
      }
    },
    required: ['imageUrl']
  },
};

/**
 * Handle describe image tool execution
 */
export async function handleDescribeImage(args: McpImageDescriptionArgs): Promise<McpToolResponse> {
  try {
    // Validate arguments
    const validatedArgs = DescribeImageArgsSchema.parse(args);
    
    // Check if any providers support image description
    const capabilities = await providerManager.getCapabilities();
    if (!capabilities.canDescribe) {
      return {
        success: false,
        error: 'No providers available for image description. Please configure ChatGPT (GPT-4 Vision) or HuggingFace providers.',
      };
    }

    // Validate image URL accessibility
    const imageValidation = await validateImageUrl(validatedArgs.imageUrl);
    if (!imageValidation.valid) {
      return {
        success: false,
        error: imageValidation.error || 'Image validation failed',
      };
    }

    console.log(`Describing image: ${validatedArgs.imageUrl}`);
    
    // Get description from provider
    const result = await providerManager.describeImage(
      validatedArgs.imageUrl,
      validatedArgs.provider
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Image description failed',
      };
    }

    // Process and enhance description based on parameters
    const processedDescription = await processDescription(
      result.description,
      validatedArgs,
      result.provider
    );

    // Analyze description for additional insights
    const analysis = analyzeDescription(processedDescription);

    const responseData = {
      description: processedDescription,
      originalDescription: result.description,
      provider: result.provider,
      confidence: result.confidence,
      imageInfo: imageValidation.info,
      analysis,
      parameters: {
        detailLevel: validatedArgs.detailLevel,
        focus: validatedArgs.focus,
        language: validatedArgs.language,
      },
      capabilities: await providerManager.getCapabilities(),
    };

    return {
      success: true,
      data: responseData,
    };

  } catch (error: any) {
    console.error('Describe image tool error:', error);
    
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
 * Validate image URL and check accessibility
 */
async function validateImageUrl(imageUrl: string): Promise<{
  valid: boolean;
  error?: string;
  info?: {
    contentType?: string | undefined;
    size?: number | undefined;
    dimensions?: { width?: number | undefined; height?: number | undefined };
  };
}> {
  try {
    // Check if URL is accessible
    const response = await fetch(imageUrl, { method: 'HEAD' });
    
    if (!response.ok) {
      return {
        valid: false,
        error: `Image not accessible: ${response.status} ${response.statusText}`,
      };
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return {
        valid: false,
        error: 'URL does not point to an image file',
      };
    }

    // Get file size
    const contentLength = response.headers.get('content-length');
    const size = contentLength ? parseInt(contentLength, 10) : undefined;

    // Check if image is too large (>10MB)
    if (size && size > 10 * 1024 * 1024) {
      return {
        valid: false,
        error: 'Image is too large (max 10MB supported)',
      };
    }

    return {
      valid: true,
      info: {
        contentType,
        size,
      },
    };

  } catch (error) {
    return {
      valid: false,
      error: `Failed to validate image URL: ${error}`,
    };
  }
}

/**
 * Process description based on parameters
 */
async function processDescription(
  description: string,
  args: any,
  provider: string
): Promise<string> {
  let processedDescription = description;

  // Apply detail level filtering
  switch (args.detailLevel) {
    case 'brief':
      // Extract first 1-2 sentences for brief description
      const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
      processedDescription = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '');
      break;
    
    case 'comprehensive':
      // Add more context and analysis if description seems short
      if (description.length < 200) {
        processedDescription += ' This image would benefit from additional analysis of artistic elements, cultural context, and technical composition details.';
      }
      break;
  }

  // Apply focus filtering (simple keyword-based approach)
  if (args.focus && args.focus !== 'general') {
    const focusKeywords = getFocusKeywords(args.focus);
    const relevantSentences = description.split(/[.!?]+/).filter(sentence => 
      focusKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    if (relevantSentences.length > 0) {
      const focusDescription = relevantSentences.join('. ') + '.';
      processedDescription = `Focusing on ${args.focus}: ${focusDescription}`;
    }
  }

  return processedDescription.trim();
}

/**
 * Get keywords for different focus areas
 */
function getFocusKeywords(focus: string): string[] {
  const keywordMap: Record<string, string[]> = {
    objects: ['object', 'item', 'thing', 'furniture', 'tool', 'device', 'equipment'],
    people: ['person', 'people', 'man', 'woman', 'child', 'face', 'expression', 'clothing', 'hair'],
    scene: ['setting', 'location', 'place', 'environment', 'background', 'landscape', 'indoor', 'outdoor'],
    colors: ['color', 'colour', 'red', 'blue', 'green', 'yellow', 'black', 'white', 'bright', 'dark', 'hue', 'tone'],
    composition: ['composition', 'framing', 'perspective', 'angle', 'layout', 'arrangement', 'balance', 'symmetry'],
    style: ['style', 'artistic', 'technique', 'aesthetic', 'mood', 'atmosphere', 'feeling', 'art', 'painting', 'photography'],
  };

  return keywordMap[focus] || [];
}

/**
 * Analyze description for additional insights
 */
function analyzeDescription(description: string): {
  wordCount: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  categories: string[];
  keyEntities: string[];
  confidence: 'high' | 'medium' | 'low';
} {
  const wordCount = description.split(/\s+/).length;
  
  // Simple sentiment analysis
  const positiveWords = ['beautiful', 'stunning', 'vibrant', 'bright', 'happy', 'joyful', 'colorful', 'excellent'];
  const negativeWords = ['dark', 'gloomy', 'sad', 'damaged', 'broken', 'ugly', 'disturbing'];
  
  const positiveCount = positiveWords.filter(word => 
    description.toLowerCase().includes(word)
  ).length;
  const negativeCount = negativeWords.filter(word => 
    description.toLowerCase().includes(word)
  ).length;
  
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (positiveCount > negativeCount) sentiment = 'positive';
  else if (negativeCount > positiveCount) sentiment = 'negative';

  // Extract potential categories
  const categoryKeywords = {
    portrait: ['face', 'person', 'portrait', 'individual'],
    landscape: ['landscape', 'scenery', 'nature', 'mountains', 'trees', 'sky'],
    architecture: ['building', 'structure', 'architecture', 'house', 'bridge'],
    art: ['painting', 'artwork', 'artistic', 'canvas', 'brush'],
    photography: ['photo', 'photograph', 'camera', 'shot', 'image'],
    animal: ['animal', 'dog', 'cat', 'bird', 'wildlife', 'pet'],
    food: ['food', 'meal', 'dish', 'cooking', 'kitchen', 'restaurant'],
  };

  const categories = Object.keys(categoryKeywords).filter(category =>
    categoryKeywords[category as keyof typeof categoryKeywords].some(keyword =>
      description.toLowerCase().includes(keyword)
    )
  );

  // Extract potential entities (simple approach - capitalized words)
  const entities = description
    .match(/\b[A-Z][a-z]+\b/g)
    ?.filter(word => word.length > 2)
    ?.slice(0, 5) || [];

  // Determine confidence based on description length and specificity
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  if (wordCount > 50 && categories.length > 0) confidence = 'high';
  else if (wordCount < 20) confidence = 'low';

  return {
    wordCount,
    sentiment,
    categories,
    keyEntities: entities,
    confidence,
  };
}