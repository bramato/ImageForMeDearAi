/**
 * Centralized error handling utilities
 */

import type { ProviderError } from '../types/index.js';

/**
 * Error codes used throughout the application
 */
export enum ErrorCodes {
  // Configuration errors
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  PROVIDER_NOT_CONFIGURED = 'PROVIDER_NOT_CONFIGURED',
  
  // Provider errors
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // Request errors
  INVALID_REQUEST = 'INVALID_REQUEST',
  CONTENT_POLICY_VIOLATION = 'CONTENT_POLICY_VIOLATION',
  
  // Processing errors
  GENERATION_FAILED = 'GENERATION_FAILED',
  DESCRIPTION_FAILED = 'DESCRIPTION_FAILED',
  TAGGING_FAILED = 'TAGGING_FAILED',
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',
  
  // System errors
  TIMEOUT = 'TIMEOUT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  
  // Feature support
  FEATURE_NOT_AVAILABLE = 'FEATURE_NOT_AVAILABLE',
  IMAGE_DESCRIPTION_NOT_SUPPORTED = 'IMAGE_DESCRIPTION_NOT_SUPPORTED',
  IMAGE_TAGGING_NOT_SUPPORTED = 'IMAGE_TAGGING_NOT_SUPPORTED',
  
  // Operation errors
  OPERATION_FAILED = 'OPERATION_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Enhanced error class with additional metadata
 */
export class ImageGenerationError extends Error implements ProviderError {
  public readonly provider: string;
  public readonly code: string;
  public readonly severity: ErrorSeverity;
  public readonly retryable: boolean;
  public readonly userFriendly: string;
  public readonly details?: any;
  public readonly timestamp: Date;
  public readonly requestId?: string | undefined;

  constructor(
    code: string,
    message: string,
    provider: string = 'system',
    options: {
      severity?: ErrorSeverity | undefined;
      retryable?: boolean | undefined;
      userFriendly?: string | undefined;
      details?: any;
      requestId?: string | undefined;
    } = {}
  ) {
    super(message);
    
    this.name = 'ImageGenerationError';
    this.provider = provider;
    this.code = code;
    this.severity = options.severity || ErrorSeverity.MEDIUM;
    this.retryable = options.retryable ?? this.isRetryableByCode(code);
    this.userFriendly = options.userFriendly || this.generateUserFriendlyMessage(code, message);
    this.details = options.details;
    this.timestamp = new Date();
    this.requestId = options.requestId;

    // Ensure proper prototype chain
    Object.setPrototypeOf(this, ImageGenerationError.prototype);
  }

  /**
   * Determine if error is retryable based on error code
   */
  private isRetryableByCode(code: string): boolean {
    const retryableCodes = [
      ErrorCodes.TIMEOUT,
      ErrorCodes.SERVICE_UNAVAILABLE,
      ErrorCodes.NETWORK_ERROR,
      ErrorCodes.RATE_LIMIT_EXCEEDED,
    ];
    
    return retryableCodes.includes(code as ErrorCodes);
  }

  /**
   * Generate user-friendly error message
   */
  private generateUserFriendlyMessage(code: string, originalMessage: string): string {
    const friendlyMessages: Record<string, string> = {
      [ErrorCodes.AUTHENTICATION_FAILED]: 'Invalid API key. Please check your configuration.',
      [ErrorCodes.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait a moment and try again.',
      [ErrorCodes.QUOTA_EXCEEDED]: 'API quota exceeded. Please check your account limits.',
      [ErrorCodes.CONTENT_POLICY_VIOLATION]: 'The request violates content policy. Please modify your prompt.',
      [ErrorCodes.TIMEOUT]: 'Request timed out. Please try again.',
      [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable. Please try again later.',
      [ErrorCodes.INVALID_REQUEST]: 'Invalid request parameters. Please check your input.',
      [ErrorCodes.GENERATION_FAILED]: 'Image generation failed. Please try again with a different prompt.',
      [ErrorCodes.DESCRIPTION_FAILED]: 'Image description failed. Please check the image URL.',
      [ErrorCodes.TAGGING_FAILED]: 'Image tagging failed. Please check the image URL.',
      [ErrorCodes.DOWNLOAD_FAILED]: 'Failed to download image. Please check the URL.',
      [ErrorCodes.FEATURE_NOT_AVAILABLE]: 'This feature is not available with current configuration.',
    };

    return friendlyMessages[code] || originalMessage;
  }

  /**
   * Convert error to JSON for logging/API responses
   */
  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      userFriendly: this.userFriendly,
      code: this.code,
      provider: this.provider,
      severity: this.severity,
      retryable: this.retryable,
      timestamp: this.timestamp.toISOString(),
      requestId: this.requestId,
      details: this.details,
    };
  }

  /**
   * Create formatted error response for MCP tools
   */
  toToolResponse(): { success: false; error: string; code?: string; retryable?: boolean } {
    return {
      success: false,
      error: this.userFriendly,
      code: this.code,
      retryable: this.retryable,
    };
  }
}

/**
 * Error handler utility class
 */
export class ErrorHandler {
  /**
   * Handle and normalize any error into ImageGenerationError
   */
  static handle(
    error: any,
    provider: string = 'system',
    requestId?: string
  ): ImageGenerationError {
    // If it's already our custom error, return as-is
    if (error instanceof ImageGenerationError) {
      return error;
    }

    // Handle provider-specific errors
    if (provider === 'chatgpt') {
      return this.handleOpenAIError(error, requestId);
    } else if (provider === 'huggingface') {
      return this.handleHuggingFaceError(error, requestId);
    }

    // Handle common error types
    if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
      return new ImageGenerationError(
        ErrorCodes.NETWORK_ERROR,
        'Network connection failed',
        provider,
        {
          severity: ErrorSeverity.HIGH,
          retryable: true,
          details: { originalError: error.message },
          requestId,
        }
      );
    }

    if (error?.code === 'ETIMEDOUT') {
      return new ImageGenerationError(
        ErrorCodes.TIMEOUT,
        'Request timed out',
        provider,
        {
          severity: ErrorSeverity.MEDIUM,
          retryable: true,
          details: { originalError: error.message },
          requestId,
        }
      );
    }

    // Generic error fallback
    return new ImageGenerationError(
      ErrorCodes.OPERATION_FAILED,
      error?.message || 'Unknown error occurred',
      provider,
      {
        severity: ErrorSeverity.MEDIUM,
        retryable: false,
        details: { originalError: error },
        requestId,
      }
    );
  }

  /**
   * Handle OpenAI/ChatGPT specific errors
   */
  private static handleOpenAIError(error: any, requestId?: string): ImageGenerationError {
    const errorCode = error?.error?.code;
    const errorMessage = error?.error?.message || error?.message;
    const statusCode = error?.response?.status;

    if (errorCode === 'content_policy_violation') {
      return new ImageGenerationError(
        ErrorCodes.CONTENT_POLICY_VIOLATION,
        errorMessage,
        'chatgpt',
        {
          severity: ErrorSeverity.LOW,
          retryable: false,
          requestId,
        }
      );
    }

    if (errorCode === 'invalid_request_error') {
      return new ImageGenerationError(
        ErrorCodes.INVALID_REQUEST,
        errorMessage,
        'chatgpt',
        {
          severity: ErrorSeverity.LOW,
          retryable: false,
          requestId,
        }
      );
    }

    if (errorCode === 'rate_limit_exceeded') {
      return new ImageGenerationError(
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        'OpenAI rate limit exceeded',
        'chatgpt',
        {
          severity: ErrorSeverity.MEDIUM,
          retryable: true,
          requestId,
        }
      );
    }

    if (errorCode === 'insufficient_quota') {
      return new ImageGenerationError(
        ErrorCodes.QUOTA_EXCEEDED,
        'OpenAI quota exceeded',
        'chatgpt',
        {
          severity: ErrorSeverity.HIGH,
          retryable: false,
          requestId,
        }
      );
    }

    if (statusCode === 401) {
      return new ImageGenerationError(
        ErrorCodes.AUTHENTICATION_FAILED,
        'Invalid OpenAI API key',
        'chatgpt',
        {
          severity: ErrorSeverity.CRITICAL,
          retryable: false,
          requestId,
        }
      );
    }

    if (statusCode === 403) {
      return new ImageGenerationError(
        ErrorCodes.PERMISSION_DENIED,
        'Access denied to OpenAI API',
        'chatgpt',
        {
          severity: ErrorSeverity.HIGH,
          retryable: false,
          requestId,
        }
      );
    }

    if (statusCode === 503) {
      return new ImageGenerationError(
        ErrorCodes.SERVICE_UNAVAILABLE,
        'OpenAI service temporarily unavailable',
        'chatgpt',
        {
          severity: ErrorSeverity.MEDIUM,
          retryable: true,
          requestId,
        }
      );
    }

    return new ImageGenerationError(
      ErrorCodes.OPERATION_FAILED,
      errorMessage || 'OpenAI API error',
      'chatgpt',
      {
        details: { originalError: error },
        requestId,
      }
    );
  }

  /**
   * Handle HuggingFace specific errors
   */
  private static handleHuggingFaceError(error: any, requestId?: string): ImageGenerationError {
    const statusCode = error?.response?.status;
    const errorMessage = error?.message;

    if (statusCode === 401) {
      return new ImageGenerationError(
        ErrorCodes.AUTHENTICATION_FAILED,
        'Invalid HuggingFace API key',
        'huggingface',
        {
          severity: ErrorSeverity.CRITICAL,
          retryable: false,
          requestId,
        }
      );
    }

    if (statusCode === 403) {
      return new ImageGenerationError(
        ErrorCodes.PERMISSION_DENIED,
        'Access denied to HuggingFace model',
        'huggingface',
        {
          severity: ErrorSeverity.HIGH,
          retryable: false,
          requestId,
        }
      );
    }

    if (statusCode === 429) {
      return new ImageGenerationError(
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        'HuggingFace rate limit exceeded',
        'huggingface',
        {
          severity: ErrorSeverity.MEDIUM,
          retryable: true,
          requestId,
        }
      );
    }

    if (statusCode === 503) {
      return new ImageGenerationError(
        ErrorCodes.SERVICE_UNAVAILABLE,
        'HuggingFace model is loading',
        'huggingface',
        {
          severity: ErrorSeverity.MEDIUM,
          retryable: true,
          userFriendly: 'Model is starting up. Please wait a few moments and try again.',
          requestId,
        }
      );
    }

    return new ImageGenerationError(
      ErrorCodes.OPERATION_FAILED,
      errorMessage || 'HuggingFace API error',
      'huggingface',
      {
        details: { originalError: error },
        requestId,
      }
    );
  }

  /**
   * Log error with appropriate level
   */
  static log(error: ImageGenerationError): void {
    const logData = {
      timestamp: error.timestamp.toISOString(),
      level: error.severity,
      provider: error.provider,
      code: error.code,
      message: error.message,
      userFriendly: error.userFriendly,
      retryable: error.retryable,
      requestId: error.requestId,
      details: error.details,
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('🚨 CRITICAL ERROR:', JSON.stringify(logData, null, 2));
        break;
      case ErrorSeverity.HIGH:
        console.error('❌ HIGH ERROR:', JSON.stringify(logData, null, 2));
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('⚠️  MEDIUM ERROR:', JSON.stringify(logData, null, 2));
        break;
      case ErrorSeverity.LOW:
        console.info('ℹ️  LOW ERROR:', JSON.stringify(logData, null, 2));
        break;
    }
  }

  /**
   * Create error from validation failure
   */
  static validationError(
    message: string,
    details?: any,
    requestId?: string
  ): ImageGenerationError {
    return new ImageGenerationError(
      ErrorCodes.VALIDATION_FAILED,
      message,
      'system',
      {
        severity: ErrorSeverity.LOW,
        retryable: false,
        details,
        requestId,
      }
    );
  }

  /**
   * Create timeout error
   */
  static timeoutError(
    operation: string,
    timeout: number,
    provider: string = 'system',
    requestId?: string
  ): ImageGenerationError {
    return new ImageGenerationError(
      ErrorCodes.TIMEOUT,
      `${operation} timed out after ${timeout}ms`,
      provider,
      {
        severity: ErrorSeverity.MEDIUM,
        retryable: true,
        details: { operation, timeout },
        requestId,
      }
    );
  }
}

export default ErrorHandler;