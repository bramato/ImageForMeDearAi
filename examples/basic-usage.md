# Basic Usage Examples

This document provides practical examples of how to use the Image Generation MCP Server tools.

## Image Generation Examples

### 1. Simple Image Generation

Generate a basic image with default settings:

```json
{
  "tool": "generate_image",
  "arguments": {
    "prompt": "A beautiful sunset over a calm lake"
  }
}
```

### 2. Styled Image Generation

Apply specific artistic styles:

```json
{
  "tool": "generate_image",
  "arguments": {
    "prompt": "A bustling city street at night",
    "style": "cyberpunk",
    "quality": "hd"
  }
}
```

### 3. Custom Dimensions

Generate images with specific dimensions:

```json
{
  "tool": "generate_image",
  "arguments": {
    "prompt": "A panoramic mountain landscape",
    "width": 1792,
    "height": 1024,
    "style": "photographic"
  }
}
```

### 4. Multiple Images

Generate several variations:

```json
{
  "tool": "generate_image",
  "arguments": {
    "prompt": "Abstract geometric patterns",
    "style": "abstract",
    "count": 4,
    "format": "png"
  }
}
```

### 5. Provider-Specific Generation

Choose a specific AI provider:

```json
{
  "tool": "generate_image",
  "arguments": {
    "prompt": "A realistic portrait of a person",
    "style": "realistic",
    "provider": "chatgpt",
    "quality": "hd"
  }
}
```

## Logo Generation Examples

### 1. Text-Based Logo

Create a typography-focused logo:

```json
{
  "tool": "generate_logo",
  "arguments": {
    "prompt": "Professional law firm logo",
    "logoType": "text",
    "businessName": "Smith & Associates",
    "style": "professional",
    "primaryColor": "#1a365d"
  }
}
```

### 2. Icon-Only Logo

Generate a symbol-based logo:

```json
{
  "tool": "generate_logo",
  "arguments": {
    "prompt": "Coffee shop icon with coffee bean symbol",
    "logoType": "icon",
    "style": "vintage",
    "primaryColor": "#8B4513",
    "backgroundColor": "transparent"
  }
}
```

### 3. Combination Logo

Create a logo with both text and icon:

```json
{
  "tool": "generate_logo",
  "arguments": {
    "prompt": "Tech startup logo with rocket icon",
    "logoType": "combination",
    "businessName": "InnovateTech",
    "style": "modern",
    "primaryColor": "#2563eb",
    "secondaryColor": "#64748b",
    "industry": "technology"
  }
}
```

### 4. Minimalist Brand Logo

Create a clean, modern logo:

```json
{
  "tool": "generate_logo",
  "arguments": {
    "prompt": "Minimalist fitness brand logo",
    "logoType": "combination",
    "businessName": "FitCore",
    "style": "minimalist",
    "primaryColor": "#059669",
    "width": 512,
    "height": 512
  }
}
```

## Image Description Examples

### 1. Basic Image Description

Get a detailed description of an image:

```json
{
  "tool": "describe_image",
  "arguments": {
    "imageUrl": "https://example.com/landscape.jpg"
  }
}
```

### 2. Brief Description

Get a concise summary:

```json
{
  "tool": "describe_image",
  "arguments": {
    "imageUrl": "https://example.com/photo.jpg",
    "detailLevel": "brief"
  }
}
```

### 3. Focus on Specific Elements

Analyze specific aspects:

```json
{
  "tool": "describe_image",
  "arguments": {
    "imageUrl": "https://example.com/artwork.jpg",
    "detailLevel": "comprehensive",
    "focus": "style"
  }
}
```

### 4. People-Focused Analysis

Analyze human subjects:

```json
{
  "tool": "describe_image",
  "arguments": {
    "imageUrl": "https://example.com/group-photo.jpg",
    "focus": "people",
    "provider": "chatgpt"
  }
}
```

## Image Tagging Examples

### 1. Basic Image Tagging

Extract general tags from an image:

```json
{
  "tool": "tag_image",
  "arguments": {
    "imageUrl": "https://example.com/nature-scene.jpg"
  }
}
```

### 2. High-Confidence Tags Only

Get only the most confident tags:

```json
{
  "tool": "tag_image",
  "arguments": {
    "imageUrl": "https://example.com/complex-scene.jpg",
    "minConfidence": 0.7,
    "maxTags": 5
  }
}
```

### 3. Category-Specific Tagging

Focus on specific categories:

```json
{
  "tool": "tag_image",
  "arguments": {
    "imageUrl": "https://example.com/food-photo.jpg",
    "categories": ["food", "objects"],
    "maxTags": 15
  }
}
```

### 4. Complete Analysis with Colors

Get comprehensive tagging including colors:

```json
{
  "tool": "tag_image",
  "arguments": {
    "imageUrl": "https://example.com/colorful-image.jpg",
    "maxTags": 20,
    "minConfidence": 0.3,
    "includeColors": true,
    "categories": ["objects", "nature", "art"]
  }
}
```

## Advanced Usage Patterns

### 1. Creative Workflow

Combine multiple tools for creative projects:

1. Generate initial concept:
   ```json
   {
     "tool": "generate_image",
     "arguments": {
       "prompt": "Concept art for a fantasy castle",
       "style": "digital-art",
       "count": 3
     }
   }
   ```

2. Analyze the best result:
   ```json
   {
     "tool": "describe_image",
     "arguments": {
       "imageUrl": "generated-image-url",
       "detailLevel": "comprehensive",
       "focus": "composition"
     }
   }
   ```

3. Generate variations based on analysis:
   ```json
   {
     "tool": "generate_image",
     "arguments": {
       "prompt": "Fantasy castle with improved lighting and more detailed architecture",
       "style": "digital-art"
     }
   }
   ```

### 2. Brand Identity Development

Create a complete brand identity:

1. Generate logo variations:
   ```json
   {
     "tool": "generate_logo",
     "arguments": {
       "prompt": "Modern eco-friendly brand logo",
       "logoType": "combination",
       "businessName": "GreenTech",
       "style": "modern",
       "primaryColor": "#10b981"
     }
   }
   ```

2. Create supporting imagery:
   ```json
   {
     "tool": "generate_image",
     "arguments": {
       "prompt": "Eco-friendly technology concepts, clean and modern",
       "style": "minimalist",
       "format": "png"
     }
   }
   ```

### 3. Content Analysis Pipeline

Analyze and categorize image content:

1. Get detailed description:
   ```json
   {
     "tool": "describe_image",
     "arguments": {
       "imageUrl": "content-image-url",
       "detailLevel": "detailed"
     }
   }
   ```

2. Extract structured tags:
   ```json
   {
     "tool": "tag_image",
     "arguments": {
       "imageUrl": "content-image-url",
       "maxTags": 15,
       "includeColors": true
     }
   }
   ```

## Error Handling Examples

### Handling Invalid Requests

```json
{
  "success": false,
  "error": "Invalid arguments: Prompt is required",
  "code": "VALIDATION_FAILED",
  "retryable": false
}
```

### Handling Provider Issues

```json
{
  "success": false,
  "error": "API rate limit exceeded. Please wait a moment and try again.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryable": true
}
```

### Handling Network Issues

```json
{
  "success": false,
  "error": "Request timed out. Please try again.",
  "code": "TIMEOUT",
  "retryable": true
}
```

## Tips for Better Results

### Image Generation Tips

1. **Be Specific**: Detailed prompts produce better results
   - Good: "A majestic golden retriever sitting in a sunlit meadow with wildflowers"
   - Avoid: "A dog"

2. **Use Style Appropriately**: Match style to content
   - Portraits: `realistic` or `photographic`
   - Illustrations: `cartoon` or `digital-art`
   - Artistic pieces: `oil-painting` or `watercolor`

3. **Consider Dimensions**: Match aspect ratio to use case
   - Logos: Square (512x512)
   - Banners: Wide (1792x1024)
   - Portraits: Tall (1024x1792)

### Logo Generation Tips

1. **Keep It Simple**: Minimalist designs work best for logos
2. **Consider Usage**: Think about where the logo will be used
3. **Color Strategy**: Limit to 2-3 colors maximum
4. **Scalability**: Test how the logo looks at different sizes

### Analysis Tips

1. **Image Quality**: Higher quality images produce better analysis
2. **Clear Subjects**: Well-lit, unobstructed subjects are easier to analyze
3. **Appropriate URLs**: Ensure images are publicly accessible
4. **File Size**: Keep images under 10MB for best performance