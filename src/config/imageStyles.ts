import type { ImageStyle, ImageStyleDefinition, ImageDimensions } from '../types/index.js';

/**
 * Predefined image styles with their configurations
 */
export const IMAGE_STYLES: Record<ImageStyle, ImageStyleDefinition> = {
  realistic: {
    name: 'realistic',
    displayName: 'Realistic',
    description: 'Photorealistic images with high detail and natural lighting',
    promptModifier: 'photorealistic, highly detailed, professional photography, natural lighting, sharp focus',
    recommendedDimensions: { width: 1024, height: 1024 },
    tags: ['photorealistic', 'detailed', 'natural', 'sharp'],
  },
  
  cartoon: {
    name: 'cartoon',
    displayName: 'Cartoon',
    description: 'Fun and colorful cartoon-style illustrations',
    promptModifier: 'cartoon style, colorful, fun, animated, bright colors, clean lines',
    recommendedDimensions: { width: 1024, height: 1024 },
    tags: ['cartoon', 'colorful', 'animated', 'fun'],
  },
  
  anime: {
    name: 'anime',
    displayName: 'Anime',
    description: 'Japanese anime and manga-inspired artwork',
    promptModifier: 'anime style, manga, Japanese art, detailed eyes, cel shading, vibrant colors',
    recommendedDimensions: { width: 1024, height: 1024 },
    tags: ['anime', 'manga', 'japanese', 'detailed'],
  },
  
  'oil-painting': {
    name: 'oil-painting',
    displayName: 'Oil Painting',
    description: 'Classic oil painting style with rich textures and brushstrokes',
    promptModifier: 'oil painting, classical art, rich textures, visible brushstrokes, artistic, painted',
    recommendedDimensions: { width: 1024, height: 1024 },
    tags: ['oil', 'painting', 'classical', 'artistic'],
  },
  
  watercolor: {
    name: 'watercolor',
    displayName: 'Watercolor',
    description: 'Soft watercolor painting with flowing colors and gentle textures',
    promptModifier: 'watercolor painting, soft colors, flowing paint, artistic, gentle textures, painted on paper',
    recommendedDimensions: { width: 1024, height: 1024 },
    tags: ['watercolor', 'soft', 'flowing', 'gentle'],
  },
  
  sketch: {
    name: 'sketch',
    displayName: 'Sketch',
    description: 'Hand-drawn sketch style with pencil or charcoal effects',
    promptModifier: 'pencil sketch, hand drawn, artistic sketch, charcoal drawing, black and white, detailed linework',
    recommendedDimensions: { width: 1024, height: 1024 },
    tags: ['sketch', 'pencil', 'hand-drawn', 'linework'],
  },
  
  'digital-art': {
    name: 'digital-art',
    displayName: 'Digital Art',
    description: 'Modern digital artwork with clean lines and vibrant colors',
    promptModifier: 'digital art, modern artwork, clean lines, vibrant colors, digital painting, contemporary',
    recommendedDimensions: { width: 1024, height: 1024 },
    tags: ['digital', 'modern', 'clean', 'vibrant'],
  },
  
  cyberpunk: {
    name: 'cyberpunk',
    displayName: 'Cyberpunk',
    description: 'Futuristic cyberpunk aesthetic with neon lights and dark themes',
    promptModifier: 'cyberpunk style, neon lights, futuristic, dark atmosphere, high tech, sci-fi, urban',
    recommendedDimensions: { width: 1024, height: 1024 },
    tags: ['cyberpunk', 'neon', 'futuristic', 'sci-fi'],
  },
  
  steampunk: {
    name: 'steampunk',
    displayName: 'Steampunk',
    description: 'Victorian-era industrial aesthetic with brass, gears, and steam',
    promptModifier: 'steampunk style, victorian industrial, brass and copper, gears and machinery, steam-powered',
    recommendedDimensions: { width: 1024, height: 1024 },
    tags: ['steampunk', 'victorian', 'brass', 'gears'],
  },
  
  minimalist: {
    name: 'minimalist',
    displayName: 'Minimalist',
    description: 'Clean, simple designs with minimal elements and lots of white space',
    promptModifier: 'minimalist design, clean lines, simple, lots of white space, geometric, modern',
    recommendedDimensions: { width: 1024, height: 1024 },
    tags: ['minimalist', 'clean', 'simple', 'geometric'],
  },
  
  vintage: {
    name: 'vintage',
    displayName: 'Vintage',
    description: 'Retro and nostalgic style reminiscent of past decades',
    promptModifier: 'vintage style, retro, nostalgic, aged look, classic design, old-fashioned',
    recommendedDimensions: { width: 1024, height: 1024 },
    tags: ['vintage', 'retro', 'nostalgic', 'classic'],
  },
  
  'pop-art': {
    name: 'pop-art',
    displayName: 'Pop Art',
    description: 'Bold, colorful pop art style inspired by Andy Warhol and Roy Lichtenstein',
    promptModifier: 'pop art style, bold colors, high contrast, comic book style, Andy Warhol inspired',
    recommendedDimensions: { width: 1024, height: 1024 },
    tags: ['pop-art', 'bold', 'colorful', 'comic'],
  },
  
  surreal: {
    name: 'surreal',
    displayName: 'Surreal',
    description: 'Dreamlike and fantastical imagery that defies reality',
    promptModifier: 'surreal art, dreamlike, fantastical, impossible scenes, Salvador Dali inspired, abstract reality',
    recommendedDimensions: { width: 1024, height: 1024 },
    tags: ['surreal', 'dreamlike', 'fantastical', 'abstract'],
  },
  
  photographic: {
    name: 'photographic',
    displayName: 'Photographic',
    description: 'High-quality photographic style with professional camera settings',
    promptModifier: 'professional photography, high resolution, perfect lighting, camera shot, photographic quality',
    recommendedDimensions: { width: 1024, height: 1024 },
    tags: ['photographic', 'professional', 'high-quality', 'camera'],
  },
  
  abstract: {
    name: 'abstract',
    displayName: 'Abstract',
    description: 'Non-representational art with emphasis on colors, shapes, and forms',
    promptModifier: 'abstract art, non-representational, geometric shapes, color study, modern abstract',
    recommendedDimensions: { width: 1024, height: 1024 },
    tags: ['abstract', 'geometric', 'non-representational', 'modern'],
  },
};

/**
 * Get all available image styles
 */
export function getAllImageStyles(): ImageStyleDefinition[] {
  return Object.values(IMAGE_STYLES);
}

/**
 * Get image style definition by name
 */
export function getImageStyle(style: ImageStyle): ImageStyleDefinition | undefined {
  return IMAGE_STYLES[style];
}

/**
 * Get style names only
 */
export function getImageStyleNames(): ImageStyle[] {
  return Object.keys(IMAGE_STYLES) as ImageStyle[];
}

/**
 * Apply style to prompt
 */
export function applyStyleToPrompt(prompt: string, style?: ImageStyle): string {
  if (!style) return prompt;
  
  const styleDefinition = getImageStyle(style);
  if (!styleDefinition) return prompt;
  
  return `${prompt}, ${styleDefinition.promptModifier}`;
}

/**
 * Get recommended dimensions for a style
 */
export function getRecommendedDimensions(style?: ImageStyle): ImageDimensions {
  if (!style) return { width: 1024, height: 1024 };
  
  const styleDefinition = getImageStyle(style);
  return styleDefinition?.recommendedDimensions || { width: 1024, height: 1024 };
}

/**
 * Validate if a style exists
 */
export function isValidStyle(style: string): style is ImageStyle {
  return Object.keys(IMAGE_STYLES).includes(style as ImageStyle);
}

/**
 * Search styles by tag
 */
export function searchStylesByTag(tag: string): ImageStyleDefinition[] {
  return getAllImageStyles().filter(style => 
    style.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

/**
 * Get random style
 */
export function getRandomStyle(): ImageStyleDefinition {
  const styles = getAllImageStyles();
  return styles[Math.floor(Math.random() * styles.length)] as ImageStyleDefinition;
}