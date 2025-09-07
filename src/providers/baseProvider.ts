import type {
  ImageProvider,
  ImageGenerationRequest,
  ImageGenerationResult,
  ImageDescriptionResult,
  ImageTaggingResult,
  ProviderError,
} from '../types/index.js';

/**
 * Abstract base class for image providers
 */
export abstract class BaseImageProvider implements ImageProvider {
  abstract name: string;
  protected timeout: number;
  protected retryAttempts: number;
  protected retryDelay: number;

  constructor(timeout: number = 30000) {
    this.timeout = timeout;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  /**
   * Generate image using the provider
   */
  abstract generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult>;

  /**
   * Describe image content (optional)
   */
  async describeImage?(imageUrl: string): Promise<ImageDescriptionResult> {
    throw this.createError('IMAGE_DESCRIPTION_NOT_SUPPORTED', 'Image description not supported by this provider');
  }

  /**
   * Tag image content (optional)
   */
  async tagImage?(imageUrl: string): Promise<ImageTaggingResult> {
    throw this.createError('IMAGE_TAGGING_NOT_SUPPORTED', 'Image tagging not supported by this provider');
  }

  /**
   * Check if provider is available and configured
   */
  abstract isAvailable(): Promise<boolean>;

  /**
   * Validate image generation request
   */
  protected validateRequest(request: ImageGenerationRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw this.createError('INVALID_REQUEST', 'Prompt is required');
    }

    if (request.prompt.length > 4000) {
      throw this.createError('INVALID_REQUEST', 'Prompt is too long (max 4000 characters)');
    }

    if (request.count && (request.count < 1 || request.count > 10)) {
      throw this.createError('INVALID_REQUEST', 'Count must be between 1 and 10');
    }

    if (request.dimensions) {
      const { width, height } = request.dimensions;
      
      if (width < 64 || width > 2048 || height < 64 || height > 2048) {
        throw this.createError('INVALID_REQUEST', 'Dimensions must be between 64x64 and 2048x2048');
      }

      // Check for valid aspect ratios (within reason)
      const aspectRatio = width / height;
      if (aspectRatio < 0.25 || aspectRatio > 4) {
        throw this.createError('INVALID_REQUEST', 'Invalid aspect ratio (must be between 1:4 and 4:1)');
      }
    }
  }

  /**
   * Create provider-specific error
   */
  protected createError(code: string, message: string, details?: any): ProviderError {
    const error = new Error(message) as ProviderError;
    error.name = 'ProviderError';
    error.provider = this.name;
    error.code = code;
    error.details = details;
    return error;
  }

  /**
   * Execute with retry logic
   */
  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await Promise.race([
          operation(),
          this.createTimeoutPromise<T>(operationName),
        ]);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors (4xx)
        if (this.isClientError(error)) {
          throw error;
        }

        if (attempt < this.retryAttempts) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.warn(
            `${this.name} ${operationName} attempt ${attempt} failed, retrying in ${delay}ms:`,
            error
          );
          await this.delay(delay);
        }
      }
    }

    throw this.createError(
      'OPERATION_FAILED',
      `Failed to ${operationName} after ${this.retryAttempts} attempts`,
      { lastError }
    );
  }

  /**
   * Check if error is a client error (shouldn't retry)
   */
  protected isClientError(error: any): boolean {
    // Check for HTTP 4xx status codes
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      return true;
    }

    // Check for specific error codes that shouldn't be retried
    const nonRetryableErrorCodes = [
      'INVALID_REQUEST',
      'AUTHENTICATION_FAILED',
      'PERMISSION_DENIED',
      'QUOTA_EXCEEDED',
      'CONTENT_POLICY_VIOLATION',
    ];

    return nonRetryableErrorCodes.includes(error?.code);
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise<T>(operationName: string): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(this.createError('TIMEOUT', `${operationName} timed out after ${this.timeout}ms`));
      }, this.timeout);
    });
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Sanitize prompt (remove potentially harmful content)
   */
  protected sanitizePrompt(prompt: string): string {
    // Remove excessive whitespace
    let sanitized = prompt.trim().replace(/\s+/g, ' ');

    // Remove potentially harmful patterns
    const harmfulPatterns = [
      /\b(?:hack|exploit|vulnerability|bypass|jailbreak)\b/gi,
      /\b(?:nsfw|explicit|adult|sexual|pornographic)\b/gi,
      /\b(?:violence|gore|death|suicide|self-harm)\b/gi,
      /\b(?:illegal|drugs|weapons|terrorism)\b/gi,
    ];

    for (const pattern of harmfulPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Clean up multiple spaces again
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    return sanitized;
  }

  /**
   * Get supported formats for this provider
   */
  getSupportedFormats(): string[] {
    return ['png', 'jpeg'];
  }

  /**
   * Get supported dimensions for this provider
   */
  getSupportedDimensions(): { width: number; height: number }[] {
    return [
      { width: 256, height: 256 },
      { width: 512, height: 512 },
      { width: 1024, height: 1024 },
      { width: 1024, height: 1792 },
      { width: 1792, height: 1024 },
    ];
  }

  /**
   * Get maximum image count supported
   */
  getMaxImageCount(): number {
    return 1;
  }

  /**
   * Check if provider supports feature
   */
  supportsFeature(feature: 'generation' | 'description' | 'tagging' | 'transparency' | 'logo'): boolean {
    switch (feature) {
      case 'generation':
        return true;
      case 'description':
        return typeof this.describeImage === 'function';
      case 'tagging':
        return typeof this.tagImage === 'function';
      case 'transparency':
        return this.getSupportedFormats().includes('png');
      case 'logo':
        return this.supportsFeature('transparency');
      default:
        return false;
    }
  }

  /**
   * Get provider information
   */
  getInfo(): {
    name: string;
    supportedFormats: string[];
    supportedDimensions: { width: number; height: number }[];
    maxImageCount: number;
    features: string[];
  } {
    const features: string[] = [];
    
    if (this.supportsFeature('generation')) features.push('generation');
    if (this.supportsFeature('description')) features.push('description');
    if (this.supportsFeature('tagging')) features.push('tagging');
    if (this.supportsFeature('transparency')) features.push('transparency');
    if (this.supportsFeature('logo')) features.push('logo');

    return {
      name: this.name,
      supportedFormats: this.getSupportedFormats(),
      supportedDimensions: this.getSupportedDimensions(),
      maxImageCount: this.getMaxImageCount(),
      features,
    };
  }
}