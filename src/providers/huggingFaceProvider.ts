import { HfInference } from '@huggingface/inference';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { BaseImageProvider } from './baseProvider.js';
import { applyStyleToPrompt } from '../config/imageStyles.js';
import type {
  ImageGenerationRequest,
  ImageGenerationResult,
  ImageDescriptionResult,
  ImageTaggingResult,
  HuggingFaceConfig,
  GeneratedImage,
  ImageTag,
} from '../types/index.js';

/**
 * HuggingFace provider for image generation using Stable Diffusion and other models
 */
export class HuggingFaceProvider extends BaseImageProvider {
  name = 'huggingface';
  private client: HfInference | null = null;
  private config: HuggingFaceConfig;

  constructor(config: HuggingFaceConfig) {
    super(config.timeout);
    this.config = config;
    
    if (config.enabled && config.apiKey) {
      this.initializeClient();
    }
  }

  /**
   * Initialize HuggingFace client
   */
  private initializeClient(): void {
    if (!this.config.apiKey) {
      throw this.createError('CONFIGURATION_ERROR', 'HuggingFace API key is required');
    }

    this.client = new HfInference(this.config.apiKey);
  }

  /**
   * Check if provider is available and configured
   */
  async isAvailable(): Promise<boolean> {
    if (!this.config.enabled || !this.config.apiKey || !this.client) {
      return false;
    }

    try {
      // Test API connectivity by checking if model exists
      const modelInfo = await fetch(`https://huggingface.co/api/models/${this.config.model}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });
      return modelInfo.ok;
    } catch (error) {
      console.warn('HuggingFace provider not available:', error);
      return false;
    }
  }

  /**
   * Generate image using Stable Diffusion or other models
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    if (!this.client) {
      throw this.createError('PROVIDER_NOT_CONFIGURED', 'HuggingFace provider is not configured');
    }

    this.validateRequest(request);

    const requestId = uuidv4();
    const sanitizedPrompt = this.sanitizePrompt(request.prompt);
    const styledPrompt = applyStyleToPrompt(sanitizedPrompt, request.style);

    return this.executeWithRetry(async () => {
      try {
        const parameters: any = {
          inputs: styledPrompt,
        };

        // Add negative prompt if provided
        if (request.negativePrompt) {
          parameters.negative_prompt = request.negativePrompt;
        }

        // Add seed if provided
        if (request.seed) {
          parameters.seed = request.seed;
        }

        // Configure model-specific parameters
        if (this.isStableDiffusionModel()) {
          parameters.num_inference_steps = 50;
          parameters.guidance_scale = 7.5;
          
          if (request.dimensions) {
            parameters.width = request.dimensions.width;
            parameters.height = request.dimensions.height;
          } else {
            parameters.width = 1024;
            parameters.height = 1024;
          }
        }

        const response = await this.client!.textToImage({
          model: this.config.model,
          inputs: styledPrompt,
          parameters,
        });

        if (!response) {
          throw this.createError('INVALID_RESPONSE', 'No response from HuggingFace API');
        }

        // Convert response to buffer
        const imageBuffer = Buffer.from(await response.arrayBuffer());
        
        if (imageBuffer.length === 0) {
          throw this.createError('INVALID_RESPONSE', 'Empty image data received');
        }

        // Process image with Sharp
        let processedImage = sharp(imageBuffer);
        
        // Get image metadata
        const metadata = await processedImage.metadata();
        const actualDimensions = {
          width: metadata.width || request.dimensions?.width || 1024,
          height: metadata.height || request.dimensions?.height || 1024,
        };

        // Apply format conversion if needed
        const targetFormat = request.format || 'png';
        if (targetFormat === 'png') {
          processedImage = processedImage.png();
        } else if (targetFormat === 'jpeg') {
          processedImage = processedImage.jpeg({ quality: 90 });
        } else if (targetFormat === 'webp') {
          processedImage = processedImage.webp({ quality: 90 });
        }

        // Apply transparency if requested (PNG only)
        if (request.transparent && targetFormat === 'png') {
          processedImage = await this.makeImageTransparent(processedImage);
        }

        // Resize if specific dimensions requested
        if (request.dimensions && 
            (request.dimensions.width !== actualDimensions.width || 
             request.dimensions.height !== actualDimensions.height)) {
          processedImage = processedImage.resize(
            request.dimensions.width,
            request.dimensions.height,
            { fit: 'fill' }
          );
        }

        const finalImageBuffer = await processedImage.toBuffer();
        const base64 = finalImageBuffer.toString('base64');

        const generatedImage: GeneratedImage = {
          url: `data:image/${targetFormat};base64,${base64}`,
          base64,
          format: targetFormat,
          dimensions: request.dimensions || actualDimensions,
          size: finalImageBuffer.length,
          metadata: {
            prompt: sanitizedPrompt,
            style: request.style || 'realistic',
            provider: this.name,
            generatedAt: new Date(),
            model: this.config.model,
            seed: request.seed,
          },
        };

        return {
          success: true,
          images: [generatedImage], // HuggingFace typically returns one image
          provider: this.name,
          requestId,
        };

      } catch (error: any) {
        // Handle HuggingFace specific errors
        if (error?.response?.status) {
          switch (error.response.status) {
            case 401:
              throw this.createError('AUTHENTICATION_FAILED', 'Invalid HuggingFace API key');
            case 403:
              throw this.createError('PERMISSION_DENIED', 'Access denied to HuggingFace model');
            case 429:
              throw this.createError('RATE_LIMIT_EXCEEDED', 'HuggingFace API rate limit exceeded');
            case 503:
              throw this.createError('SERVICE_UNAVAILABLE', 'HuggingFace model is currently loading');
            default:
              throw this.createError('API_ERROR', `HuggingFace API error: ${error.response.status}`);
          }
        }

        throw this.createError('GENERATION_FAILED', `Image generation failed: ${error.message}`, { error });
      }
    }, 'generate image');
  }

  /**
   * Describe image using BLIP or other vision models
   */
  override async describeImage(imageUrl: string): Promise<ImageDescriptionResult> {
    if (!this.client) {
      throw this.createError('PROVIDER_NOT_CONFIGURED', 'HuggingFace provider is not configured');
    }

    return this.executeWithRetry(async () => {
      try {
        // Use BLIP model for image captioning
        const response = await this.client!.imageToText({
          data: await this.downloadImage(imageUrl),
          model: 'Salesforce/blip-image-captioning-large',
        });

        if (!response?.generated_text) {
          throw this.createError('INVALID_RESPONSE', 'No description in response');
        }

        return {
          success: true,
          description: response.generated_text,
          confidence: 0.8, // BLIP typically has good confidence
          provider: this.name,
        };

      } catch (error: any) {
        throw this.createError('DESCRIPTION_FAILED', `Image description failed: ${error.message}`, { error });
      }
    }, 'describe image');
  }

  /**
   * Tag image using classification models
   */
  override async tagImage(imageUrl: string): Promise<ImageTaggingResult> {
    if (!this.client) {
      throw this.createError('PROVIDER_NOT_CONFIGURED', 'HuggingFace provider is not configured');
    }

    return this.executeWithRetry(async () => {
      try {
        // Use image classification model
        const response = await this.client!.imageClassification({
          data: await this.downloadImage(imageUrl),
          model: 'google/vit-base-patch16-224',
        });

        if (!Array.isArray(response)) {
          throw this.createError('INVALID_RESPONSE', 'Invalid classification response');
        }

        const tags: ImageTag[] = response.slice(0, 10).map((item: any) => ({
          label: item.label || 'unknown',
          confidence: item.score || 0,
          category: this.categorizeTag(item.label),
        }));

        return {
          success: true,
          tags,
          provider: this.name,
        };

      } catch (error: any) {
        throw this.createError('TAGGING_FAILED', `Image tagging failed: ${error.message}`, { error });
      }
    }, 'tag image');
  }

  /**
   * Make image background transparent (for logos)
   */
  private async makeImageTransparent(sharpImage: sharp.Sharp): Promise<sharp.Sharp> {
    try {
      // Simple background removal - in production, you might want to use a more sophisticated method
      return sharpImage
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })
        .then(({ data, info }) => {
          // Basic white/light background removal
          const pixels = new Uint8ClampedArray(data);
          const channels = info.channels;
          
          for (let i = 0; i < pixels.length; i += channels) {
            const r = pixels[i] ?? 0;
            const g = pixels[i + 1] ?? 0;
            const b = pixels[i + 2] ?? 0;
            
            // Check if pixel is close to white/light background
            const brightness = (r + g + b) / 3;
            const isBackground = brightness > 240 && Math.abs(r - g) < 10 && Math.abs(g - b) < 10;
            
            if (isBackground) {
              // Make transparent
              pixels[i + 3] = 0; // Alpha channel
            }
          }
          
          return sharp(pixels, {
            raw: {
              width: info.width,
              height: info.height,
              channels: channels,
            }
          }).png();
        });
    } catch (error) {
      console.warn('Failed to make image transparent, returning original:', error);
      return sharpImage;
    }
  }

  /**
   * Download image from URL
   */
  private async downloadImage(imageUrl: string): Promise<ArrayBuffer> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw this.createError('DOWNLOAD_FAILED', `Failed to download image: ${response.statusText}`);
    }
    
    return await response.arrayBuffer();
  }

  /**
   * Categorize tag label
   */
  private categorizeTag(label: string): string {
    const lowerLabel = label.toLowerCase();
    
    if (lowerLabel.includes('animal') || lowerLabel.includes('dog') || lowerLabel.includes('cat')) {
      return 'animal';
    } else if (lowerLabel.includes('person') || lowerLabel.includes('human') || lowerLabel.includes('face')) {
      return 'person';
    } else if (lowerLabel.includes('vehicle') || lowerLabel.includes('car') || lowerLabel.includes('bike')) {
      return 'vehicle';
    } else if (lowerLabel.includes('building') || lowerLabel.includes('house') || lowerLabel.includes('architecture')) {
      return 'architecture';
    } else if (lowerLabel.includes('nature') || lowerLabel.includes('landscape') || lowerLabel.includes('tree')) {
      return 'nature';
    } else if (lowerLabel.includes('food') || lowerLabel.includes('meal') || lowerLabel.includes('dish')) {
      return 'food';
    } else {
      return 'object';
    }
  }

  /**
   * Check if current model is Stable Diffusion
   */
  private isStableDiffusionModel(): boolean {
    return this.config.model.toLowerCase().includes('stable-diffusion');
  }

  /**
   * Get supported formats
   */
  override getSupportedFormats(): string[] {
    return ['png', 'jpeg', 'webp'];
  }

  /**
   * Get supported dimensions
   */
  override getSupportedDimensions(): { width: number; height: number }[] {
    return [
      { width: 512, height: 512 },
      { width: 768, height: 768 },
      { width: 1024, height: 1024 },
      { width: 512, height: 768 },
      { width: 768, height: 512 },
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
    ];
  }

  /**
   * Get maximum image count
   */
  override getMaxImageCount(): number {
    return 1; // Most HF models generate one image at a time
  }

  /**
   * Check if provider supports feature
   */
  override supportsFeature(feature: 'generation' | 'description' | 'tagging' | 'transparency' | 'logo'): boolean {
    switch (feature) {
      case 'generation':
        return true;
      case 'description':
        return true; // BLIP models
      case 'tagging':
        return true; // Classification models
      case 'transparency':
        return true; // PNG support with alpha
      case 'logo':
        return true;
      default:
        return false;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HuggingFaceConfig>): void {
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
  getConfig(): Omit<HuggingFaceConfig, 'apiKey'> {
    const { apiKey, ...safeConfig } = this.config;
    return safeConfig;
  }
}