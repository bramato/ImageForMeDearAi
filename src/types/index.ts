/**
 * Type definitions for the Image Generation MCP Server
 */

export interface ImageProvider {
  name: string;
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult>;
  describeImage?(imageUrl: string): Promise<ImageDescriptionResult>;
  tagImage?(imageUrl: string): Promise<ImageTaggingResult>;
  isAvailable(): Promise<boolean>;
  supportsFeature(feature: 'generation' | 'description' | 'tagging' | 'transparency' | 'logo'): boolean;
  getSupportedFormats(): string[];
  getMaxImageCount(): number;
  getInfo(): {
    name: string;
    supportedFormats: string[];
    supportedDimensions: { width: number; height: number }[];
    maxImageCount: number;
    features: string[];
  };
}

export interface ImageGenerationRequest {
  prompt: string;
  style?: ImageStyle | undefined;
  dimensions?: ImageDimensions | undefined;
  quality?: 'standard' | 'hd' | undefined;
  count?: number | undefined;
  format?: 'png' | 'jpeg' | 'webp' | undefined;
  transparent?: boolean | undefined;
  negativePrompt?: string | undefined;
  seed?: number | undefined;
}

export interface ImageGenerationResult {
  success: boolean;
  images: GeneratedImage[];
  provider: string;
  requestId: string;
  cached?: boolean;
  error?: string;
}

export interface GeneratedImage {
  url: string;
  localPath?: string | undefined;
  base64?: string | undefined;
  format: string;
  dimensions: ImageDimensions;
  size: number;
  metadata: ImageMetadata;
}

export interface ImageMetadata {
  prompt: string;
  style: string;
  provider: string;
  generatedAt: Date;
  model: string;
  seed?: number | undefined;
  revisedPrompt?: string | undefined;
}

export interface ImageDescriptionResult {
  success: boolean;
  description: string;
  confidence?: number;
  provider: string;
  error?: string;
}

export interface ImageTaggingResult {
  success: boolean;
  tags: ImageTag[];
  provider: string;
  error?: string;
}

export interface ImageTag {
  label: string;
  confidence: number;
  category?: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export type ImageStyle = 
  | 'realistic' 
  | 'cartoon' 
  | 'anime' 
  | 'oil-painting' 
  | 'watercolor' 
  | 'sketch' 
  | 'digital-art' 
  | 'cyberpunk' 
  | 'steampunk' 
  | 'minimalist' 
  | 'vintage' 
  | 'pop-art' 
  | 'surreal' 
  | 'photographic' 
  | 'abstract';

export interface ServerConfig {
  providers: {
    chatgpt: ChatGPTConfig;
    huggingface: HuggingFaceConfig;
  };
  cache: CacheConfig;
  server: {
    name: string;
    version: string;
    port?: number | undefined;
  };
  output: {
    directory: string;
    format: string;
    naming: string;
  };
}

export interface ChatGPTConfig {
  enabled: boolean;
  apiKey?: string | undefined;
  model: string;
  baseUrl?: string | undefined;
  organization?: string | undefined;
  timeout: number;
}

export interface HuggingFaceConfig {
  enabled: boolean;
  apiKey?: string | undefined;
  model: string;
  endpoint?: string | undefined;
  timeout: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  directory: string;
}

export interface ProviderError extends Error {
  provider: string;
  code: string;
  details?: any;
}

export interface ImageStyleDefinition {
  name: ImageStyle;
  displayName: string;
  description: string;
  promptModifier: string;
  recommendedDimensions?: ImageDimensions;
  tags: string[];
}

export interface LogoGenerationRequest extends Omit<ImageGenerationRequest, 'format'> {
  format: 'png';
  transparent: true;
  logoType: 'text' | 'icon' | 'combination';
  backgroundColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

// MCP Tool interfaces
export interface McpImageGenerationArgs {
  prompt: string;
  style?: ImageStyle;
  width?: number;
  height?: number;
  quality?: 'standard' | 'hd';
  count?: number;
}

export interface McpLogoGenerationArgs extends McpImageGenerationArgs {
  logoType: 'text' | 'icon' | 'combination';
  backgroundColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface McpImageDescriptionArgs {
  imageUrl: string;
}

export interface McpImageTaggingArgs {
  imageUrl: string;
}

export interface McpToolResponse {
  success: boolean;
  data?: any;
  error?: string | undefined;
  cached?: boolean | undefined;
}

// Installation script types
export interface InstallationOptions {
  providers: ('chatgpt' | 'huggingface')[];
  outputDirectory: string;
  enableCache: boolean;
  cacheSize: number;
}

export interface ProviderSetupResult {
  provider: string;
  configured: boolean;
  error?: string;
}