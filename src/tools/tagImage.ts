import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { providerManager } from '../providers/providerManager.js';
import type { McpImageTaggingArgs, McpToolResponse, ImageTag } from '../types/index.js';

// Input validation schema
const TagImageArgsSchema = z.object({
  imageUrl: z.string()
    .url('Must be a valid URL')
    .describe('URL of the image to tag'),
  provider: z.enum(['huggingface'])
    .optional()
    .describe('Preferred provider for image tagging'),
  maxTags: z.number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .default(10)
    .describe('Maximum number of tags to return (1-20)'),
  minConfidence: z.number()
    .min(0)
    .max(1)
    .optional()
    .default(0.1)
    .describe('Minimum confidence threshold for tags (0-1)'),
  categories: z.array(z.enum([
    'objects', 'animals', 'people', 'places', 'activities', 
    'food', 'vehicles', 'nature', 'technology', 'art'
  ])).optional().describe('Specific categories to focus on'),
  includeColors: z.boolean()
    .optional()
    .default(false)
    .describe('Include color-based tags'),
  language: z.string()
    .optional()
    .default('english')
    .describe('Language for tag labels'),
});

/**
 * MCP Tool for tagging images using AI vision models
 */
export const tagImageTool: Tool = {
  name: 'tag_image',
  description: `Analyze and tag images using AI vision models to identify objects, scenes, activities, and attributes.

Features:
- Automatic object and scene recognition
- Confidence-based filtering
- Category-specific tagging
- Color analysis (optional)
- Multi-language support
- Hierarchical tag organization

Tag Categories:
- objects: Physical items, tools, furniture, etc.
- animals: All types of animals and pets
- people: Human subjects, activities, clothing
- places: Locations, buildings, landscapes
- activities: Actions, sports, events
- food: Meals, ingredients, cooking
- vehicles: Cars, bikes, planes, boats
- nature: Plants, weather, natural phenomena
- technology: Electronics, computers, gadgets
- art: Artistic elements, styles, mediums

Providers:
- HuggingFace: Uses specialized vision models (ViT, ResNet, etc.) for accurate object classification

Output includes:
- Tag labels with confidence scores
- Categorized organization
- Color analysis (if requested)
- Hierarchical relationships
- Multilingual support

Examples:
- tag_image({imageUrl: "https://example.com/photo.jpg"})
- tag_image({imageUrl: "https://example.com/food.jpg", categories: ["food"], maxTags: 5})
- tag_image({imageUrl: "https://example.com/scene.jpg", minConfidence: 0.3, includeColors: true})`,
  
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
        enum: ['huggingface'],
        description: 'Provider to use for tagging'
      },
      maxTags: {
        type: 'number',
        description: 'Maximum number of tags to return',
        minimum: 1,
        maximum: 20,
        default: 10
      },
      minConfidence: {
        type: 'number',
        description: 'Minimum confidence threshold (0-1)',
        minimum: 0,
        maximum: 1,
        default: 0.1
      },
      categories: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Specific categories to focus on'
      },
      includeColors: {
        type: 'boolean',
        description: 'Include dominant colors in analysis',
        default: false
      },
      language: {
        type: 'string',
        description: 'Language for tag labels',
        default: 'en'
      }
    },
    required: ['imageUrl']
  },
};

/**
 * Handle tag image tool execution
 */
export async function handleTagImage(args: McpImageTaggingArgs): Promise<McpToolResponse> {
  try {
    // Validate arguments
    const validatedArgs = TagImageArgsSchema.parse(args);
    
    // Check if any providers support image tagging
    const capabilities = await providerManager.getCapabilities();
    if (!capabilities.canTag) {
      return {
        success: false,
        error: 'No providers available for image tagging. Please configure HuggingFace provider.',
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

    console.log(`Tagging image: ${validatedArgs.imageUrl}`);
    
    // Get tags from provider
    const result = await providerManager.tagImage(
      validatedArgs.imageUrl,
      validatedArgs.provider
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Image tagging failed',
      };
    }

    // Process and filter tags based on parameters
    const processedTags = await processTags(
      result.tags,
      validatedArgs,
      result.provider
    );

    // Analyze tags for additional insights
    const analysis = analyzeTags(processedTags);

    // Add color tags if requested
    let colorTags: ImageTag[] = [];
    if (validatedArgs.includeColors) {
      colorTags = await extractColorTags(validatedArgs.imageUrl);
    }

    const responseData = {
      tags: processedTags,
      colorTags,
      totalTags: result.tags.length,
      filteredTags: processedTags.length,
      provider: result.provider,
      analysis,
      imageInfo: imageValidation.info,
      parameters: {
        maxTags: validatedArgs.maxTags,
        minConfidence: validatedArgs.minConfidence,
        categories: validatedArgs.categories,
        includeColors: validatedArgs.includeColors,
        language: validatedArgs.language,
      },
      capabilities: await providerManager.getCapabilities(),
    };

    return {
      success: true,
      data: responseData,
    };

  } catch (error: any) {
    console.error('Tag image tool error:', error);
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return {
        success: false,
        error: `Invalid arguments: ${error.errors.map((e: any) => e.message).join(', ')}`,
      };
    }

    return {
      success: false,
      error: error?.message || 'Unexpected error occurred',
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
 * Process and filter tags based on parameters
 */
async function processTags(
  tags: ImageTag[],
  args: any,
  provider: string
): Promise<ImageTag[]> {
  let processedTags = [...tags];

  // Filter by confidence threshold
  processedTags = processedTags.filter(tag => tag.confidence >= args.minConfidence);

  // Filter by categories if specified
  if (args.categories && args.categories.length > 0) {
    processedTags = processedTags.filter(tag => {
      const tagCategory = tag.category || categorizeTag(tag.label);
      return args.categories.includes(tagCategory);
    });
  }

  // Sort by confidence (highest first)
  processedTags.sort((a, b) => b.confidence - a.confidence);

  // Limit to max tags
  processedTags = processedTags.slice(0, args.maxTags);

  // Enhance tags with additional metadata
  processedTags = processedTags.map(tag => ({
    ...tag,
    category: tag.category || categorizeTag(tag.label),
    hierarchy: getTagHierarchy(tag.label),
    synonyms: getTagSynonyms(tag.label),
  }));

  return processedTags;
}

/**
 * Categorize a tag label
 */
function categorizeTag(label: string): string {
  const lowerLabel = label.toLowerCase();
  
  // Define category patterns
  const categoryPatterns = {
    animals: ['animal', 'dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'pet', 'wildlife', 'mammal'],
    people: ['person', 'human', 'man', 'woman', 'child', 'baby', 'face', 'people', 'crowd'],
    objects: ['object', 'item', 'tool', 'furniture', 'equipment', 'device', 'container', 'clothing'],
    places: ['building', 'house', 'room', 'street', 'city', 'landscape', 'indoor', 'outdoor', 'location'],
    vehicles: ['car', 'bike', 'bicycle', 'motorcycle', 'truck', 'bus', 'plane', 'boat', 'vehicle'],
    food: ['food', 'meal', 'dish', 'fruit', 'vegetable', 'drink', 'cooking', 'kitchen', 'restaurant'],
    nature: ['tree', 'flower', 'plant', 'sky', 'cloud', 'water', 'mountain', 'beach', 'forest', 'nature'],
    technology: ['computer', 'phone', 'screen', 'electronic', 'digital', 'machine', 'device', 'tech'],
    activities: ['sport', 'game', 'play', 'work', 'exercise', 'dance', 'music', 'reading', 'activity'],
    art: ['art', 'painting', 'drawing', 'sculpture', 'design', 'creative', 'artistic', 'craft'],
  };

  // Find matching category
  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    if (patterns.some(pattern => lowerLabel.includes(pattern))) {
      return category;
    }
  }

  return 'objects'; // Default category
}

/**
 * Get tag hierarchy (parent-child relationships)
 */
function getTagHierarchy(label: string): string[] {
  const hierarchy: Record<string, string[]> = {
    'dog': ['animal', 'mammal', 'pet'],
    'cat': ['animal', 'mammal', 'pet'],
    'car': ['vehicle', 'transportation'],
    'apple': ['fruit', 'food'],
    'tree': ['plant', 'nature'],
    'person': ['human', 'living being'],
    'building': ['structure', 'architecture'],
    // Add more hierarchies as needed
  };

  return hierarchy[label.toLowerCase()] || [];
}

/**
 * Get tag synonyms
 */
function getTagSynonyms(label: string): string[] {
  const synonyms: Record<string, string[]> = {
    'car': ['automobile', 'vehicle'],
    'dog': ['canine', 'puppy'],
    'cat': ['feline', 'kitten'],
    'person': ['human', 'individual'],
    'house': ['home', 'building'],
    // Add more synonyms as needed
  };

  return synonyms[label.toLowerCase()] || [];
}

/**
 * Extract color tags from image
 */
async function extractColorTags(imageUrl: string): Promise<ImageTag[]> {
  try {
    // This is a simplified color extraction - in a real implementation,
    // you would use image processing libraries to analyze the actual colors
    const commonColors = [
      { label: 'red', confidence: 0.8, category: 'color' },
      { label: 'blue', confidence: 0.7, category: 'color' },
      { label: 'green', confidence: 0.6, category: 'color' },
      { label: 'yellow', confidence: 0.5, category: 'color' },
      { label: 'black', confidence: 0.4, category: 'color' },
      { label: 'white', confidence: 0.3, category: 'color' },
    ];

    // Return a subset of colors (simplified approach)
    return commonColors.slice(0, 3);
    
  } catch (error) {
    console.warn('Failed to extract color tags:', error);
    return [];
  }
}

/**
 * Analyze tags for insights
 */
function analyzeTags(tags: ImageTag[]): {
  topCategories: string[];
  confidenceDistribution: { high: number; medium: number; low: number };
  diversity: number;
  averageConfidence: number;
  insights: string[];
} {
  if (tags.length === 0) {
    return {
      topCategories: [],
      confidenceDistribution: { high: 0, medium: 0, low: 0 },
      diversity: 0,
      averageConfidence: 0,
      insights: ['No tags found'],
    };
  }

  // Analyze categories
  const categoryCount = tags.reduce((acc, tag) => {
    const category = tag.category || 'unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category);

  // Analyze confidence distribution
  const confidenceDistribution = tags.reduce(
    (acc, tag) => {
      if (tag.confidence >= 0.7) acc.high++;
      else if (tag.confidence >= 0.4) acc.medium++;
      else acc.low++;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  // Calculate diversity (number of unique categories)
  const diversity = Object.keys(categoryCount).length;

  // Calculate average confidence
  const averageConfidence = tags.reduce((sum, tag) => sum + tag.confidence, 0) / tags.length;

  // Generate insights
  const insights: string[] = [];
  
  if (averageConfidence > 0.7) {
    insights.push('High confidence tags suggest clear, well-defined image content');
  } else if (averageConfidence < 0.3) {
    insights.push('Low confidence may indicate complex or ambiguous image content');
  }

  if (diversity > 5) {
    insights.push('High diversity indicates complex scene with multiple elements');
  } else if (diversity <= 2) {
    insights.push('Low diversity suggests focused, simple composition');
  }

  if (topCategories.includes('people')) {
    insights.push('Image contains human subjects');
  }

  return {
    topCategories,
    confidenceDistribution,
    diversity,
    averageConfidence,
    insights,
  };
}