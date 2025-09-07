import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { BaseImageProvider } from './baseProvider.js';
import { applyStyleToPrompt } from '../config/imageStyles.js';
import type {
  ImageGenerationRequest,
  ImageGenerationResult,
  ImageDescriptionResult,
  ChatGPTConfig,
  GeneratedImage,
} from '../types/index.js';

/**
 * ChatGPT/OpenAI DALL-E provider for image generation
 */
export class ChatGPTProvider extends BaseImageProvider {
  name = 'chatgpt';
  private client: OpenAI | null = null;
  private config: ChatGPTConfig;

  constructor(config: ChatGPTConfig) {
    super(config.timeout);
    this.config = config;
    
    if (config.enabled && config.apiKey) {
      this.initializeClient();
    }
  }

  /**
   * Initialize OpenAI client
   */
  private initializeClient(): void {
    if (!this.config.apiKey) {
      throw this.createError('CONFIGURATION_ERROR', 'OpenAI API key is required');
    }

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      organization: this.config.organization,
      timeout: this.config.timeout || 30000,
    });
  }

  /**
   * Check if provider is available and configured
   */
  async isAvailable(): Promise<boolean> {
    if (!this.config.enabled || !this.config.apiKey || !this.client) {
      return false;
    }

    try {
      // Test API connectivity
      await this.client.models.list();
      return true;
    } catch (error) {
      console.warn('ChatGPT provider not available:', error);
      return false;
    }
  }

  /**
   * Generate image using DALL-E
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    if (!this.client) {
      throw this.createError('PROVIDER_NOT_CONFIGURED', 'ChatGPT provider is not configured');
    }

    this.validateRequest(request);

    const requestId = uuidv4();
    const sanitizedPrompt = this.sanitizePrompt(request.prompt);
    const styledPrompt = applyStyleToPrompt(sanitizedPrompt, request.style);

    return this.executeWithRetry(async () => {
      const dalleParams: OpenAI.Images.ImageGenerateParams = {
        prompt: styledPrompt,
        model: this.config.model || 'dall-e-3',
        n: Math.min(request.count || 1, this.getMaxImageCount()),
        quality: request.quality || 'standard',
        response_format: 'url',
        user: requestId,
      };

      // Set size based on dimensions
      if (request.dimensions) {
        dalleParams.size = this.mapDimensionsToSize(request.dimensions) as '1024x1024' | '1024x1792' | '1792x1024' | '256x256' | '512x512';
      } else {
        dalleParams.size = '1024x1024';
      }

      // DALL-E 3 specific parameters
      if (this.config.model === 'dall-e-3') {
        dalleParams.style = request.style === 'realistic' ? 'natural' : 'vivid';
      }

      try {
        const response = await this.client!.images.generate(dalleParams);
        
        if (!response.data || response.data.length === 0) {
          throw this.createError('INVALID_RESPONSE', 'No images in response');
        }
        
        const images: GeneratedImage[] = await Promise.all(
          response.data.map(async (imageData, index) => {
            if (!imageData.url) {
              throw this.createError('INVALID_RESPONSE', 'No image URL in response');
            }

            // Download image to get metadata
            const imageResponse = await fetch(imageData.url);
            if (!imageResponse.ok) {
              throw this.createError('DOWNLOAD_FAILED', `Failed to download generated image: ${imageResponse.statusText}`);
            }

            const imageBuffer = await imageResponse.arrayBuffer();
            const base64 = Buffer.from(imageBuffer).toString('base64');

            return {
              url: imageData.url,
              base64,
              format: request.format || 'png',
              dimensions: request.dimensions || { width: 1024, height: 1024 },
              size: imageBuffer.byteLength,
              metadata: {
                prompt: sanitizedPrompt,
                style: request.style || 'realistic',
                provider: this.name,
                generatedAt: new Date(),
                model: this.config.model || 'dall-e-3',
                revisedPrompt: imageData.revised_prompt,
              },
            };
          })
        );

        return {
          success: true,
          images,
          provider: this.name,
          requestId,
        };

      } catch (error: any) {
        // Handle OpenAI specific errors
        if (error?.error?.code) {
          switch (error.error.code) {
            case 'content_policy_violation':
              throw this.createError('CONTENT_POLICY_VIOLATION', 'Content violates OpenAI content policy');
            case 'invalid_request_error':
              throw this.createError('INVALID_REQUEST', error.error.message || 'Invalid request');
            case 'rate_limit_exceeded':
              throw this.createError('RATE_LIMIT_EXCEEDED', 'API rate limit exceeded');
            case 'insufficient_quota':
              throw this.createError('QUOTA_EXCEEDED', 'API quota exceeded');
            default:
              throw this.createError('API_ERROR', error.error.message || 'Unknown API error');
          }
        }

        throw this.createError('GENERATION_FAILED', `Image generation failed: ${error.message}`, { error });
      }
    }, 'generate image');
  }

  /**
   * Describe image using GPT-4 Vision
   */
  override async describeImage(imageUrl: string): Promise<ImageDescriptionResult> {
    if (!this.client) {
      throw this.createError('PROVIDER_NOT_CONFIGURED', 'ChatGPT provider is not configured');
    }

    return this.executeWithRetry(async () => {
      try {
        const response = await this.client!.chat.completions.create({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Describe this image in detail. Include information about objects, people, colors, composition, style, and mood.',
                },
                {
                  type: 'image_url',
                  image_url: { url: imageUrl },
                },
              ],
            },
          ],
          max_tokens: 500,
        });

        const description = response.choices[0]?.message?.content;
        
        if (!description) {
          throw this.createError('INVALID_RESPONSE', 'No description in response');
        }

        return {
          success: true,
          description,
          provider: this.name,
        };

      } catch (error: any) {
        if (error?.error?.code === 'model_not_found') {
          throw this.createError('FEATURE_NOT_AVAILABLE', 'GPT-4 Vision is not available');
        }

        throw this.createError('DESCRIPTION_FAILED', `Image description failed: ${error.message}`, { error });
      }
    }, 'describe image');
  }

  /**
   * Map dimensions to DALL-E size format
   */
  private mapDimensionsToSize(dimensions: { width: number; height: number }): string {
    const { width, height } = dimensions;
    
    // DALL-E 3 supported sizes
    const supportedSizes = [
      '1024x1024',
      '1024x1792',
      '1792x1024',
    ];

    // Find closest supported size
    const requestedSize = `${width}x${height}`;
    if (supportedSizes.includes(requestedSize)) {
      return requestedSize;
    }

    // Default to square
    if (width === height) return '1024x1024';
    
    // Choose based on aspect ratio
    return width > height ? '1792x1024' : '1024x1792';
  }

  /**
   * Get supported formats
   */
  override getSupportedFormats(): string[] {
    return ['png'];
  }

  /**
   * Get supported dimensions
   */
  override getSupportedDimensions(): { width: number; height: number }[] {
    return [
      { width: 1024, height: 1024 },
      { width: 1024, height: 1792 },
      { width: 1792, height: 1024 },
    ];
  }

  /**
   * Get maximum image count
   */
  override getMaxImageCount(): number {
    return this.config.model === 'dall-e-3' ? 1 : 10;
  }

  /**
   * Check if provider supports feature
   */
  override supportsFeature(feature: 'generation' | 'description' | 'tagging' | 'transparency' | 'logo'): boolean {
    switch (feature) {
      case 'generation':
        return true;
      case 'description':
        return true; // GPT-4 Vision
      case 'tagging':
        return false; // Not implemented
      case 'transparency':
        return true; // PNG support
      case 'logo':
        return true;
      default:
        return false;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ChatGPTConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.config.enabled && this.config.apiKey) {
      this.initializeClient();
    } else {
      this.client = null;
    }
  }

  /**
   * Get current configuration (without sensitive data)
   */
  getConfig(): Omit<ChatGPTConfig, 'apiKey'> {
    const { apiKey, ...safeConfig } = this.config;
    return safeConfig;
  }
}