# 🎨 Image Generation MCP Server

A powerful **Model Context Protocol (MCP) server** that provides AI-powered image generation, analysis, and manipulation tools. Built with TypeScript and featuring dual provider support for both ChatGPT/DALL-E and HuggingFace models.

## ✨ Features

### 🖼️ Image Generation
- **Multiple AI Providers**: ChatGPT/DALL-E and HuggingFace/Stable Diffusion
- **15+ Artistic Styles**: Realistic, cartoon, anime, oil-painting, watercolor, cyberpunk, and more
- **Flexible Dimensions**: Custom width/height with intelligent aspect ratio handling
- **Quality Control**: Standard and HD quality options
- **Format Support**: PNG, JPEG, WebP output formats

### 🏷️ Logo Generation
- **Professional Quality**: Transparent PNG logos perfect for branding
- **Logo Types**: Text-only, icon-only, or combination logos
- **Style Options**: Minimalist, modern, vintage, professional, creative, elegant
- **Color Control**: Custom primary/secondary colors and backgrounds
- **Industry Optimization**: Tailored designs for different business sectors

### 🔍 Image Analysis
- **Smart Description**: AI-powered image description with multiple detail levels
- **Intelligent Tagging**: Automatic object and scene recognition
- **Category Organization**: Structured tags by objects, people, places, activities
- **Confidence Scoring**: Reliability metrics for all analysis results

### ⚡ Performance & Reliability
- **Intelligent Caching**: Fast repeated requests with configurable cache settings
- **Fallback System**: Automatic provider switching for high availability
- **Error Handling**: Comprehensive error management with user-friendly messages
- **Retry Logic**: Automatic retries with exponential backoff

## 🚀 Quick Start

### NPM Installation (Recommended)

```bash
npm install -g image-for-me-dear-ai
```

Then run the setup:
```bash
image-for-me-dear-ai
```

### Development Installation

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/bramato/ImageForMeDearAi.git
   cd ImageForMeDearAi
   npm install
   ```

2. **Run the interactive setup**:
   ```bash
   npm run install-providers
   ```
   
   This will guide you through:
   - Provider selection (ChatGPT/HuggingFace)
   - API key configuration
   - Model selection
   - Cache and output settings

3. **Build the server**:
   ```bash
   npm run build
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

### Quick Configuration

Alternatively, create a `.env` file with your API keys:

```env
# OpenAI/ChatGPT Configuration
OPENAI_API_KEY=your-openai-api-key
CHATGPT_ENABLED=true
CHATGPT_MODEL=dall-e-3

# HuggingFace Configuration
HUGGINGFACE_API_KEY=your-huggingface-token
HUGGINGFACE_ENABLED=true
HUGGINGFACE_MODEL=stabilityai/stable-diffusion-xl-base-1.0

# General Settings
OUTPUT_DIRECTORY=./generated-images
CACHE_ENABLED=true
CACHE_MAX_SIZE=100
```

## 🛠️ Available Tools

### 1. `generate_image`

Generate images with various artistic styles and configurations.

**Parameters:**
- `prompt` (required): Text description of the image to generate
- `style` (optional): Artistic style from 15+ options
- `width/height` (optional): Custom dimensions (64-2048px)
- `quality` (optional): 'standard' or 'hd'
- `count` (optional): Number of images (1-10)
- `format` (optional): 'png', 'jpeg', or 'webp'
- `provider` (optional): Preferred provider

**Example:**
```json
{
  "prompt": "A serene mountain landscape at sunset",
  "style": "oil-painting",
  "width": 1024,
  "height": 768,
  "quality": "hd"
}
```

### 2. `generate_logo`

Create professional logos with transparent backgrounds.

**Parameters:**
- `prompt` (required): Description of the logo
- `logoType` (required): 'text', 'icon', or 'combination'
- `style` (optional): Design style (minimalist, modern, vintage, etc.)
- `businessName` (optional): Company/brand name
- `primaryColor/secondaryColor` (optional): Custom colors
- `width/height` (optional): Dimensions (128-1024px, square recommended)

**Example:**
```json
{
  "prompt": "Modern tech startup logo",
  "logoType": "combination",
  "businessName": "InnovateTech",
  "style": "minimalist",
  "primaryColor": "#2563eb",
  "width": 512,
  "height": 512
}
```

### 3. `describe_image`

Analyze and describe image content using AI vision models.

**Parameters:**
- `imageUrl` (required): URL of the image to analyze
- `detailLevel` (optional): 'brief', 'detailed', or 'comprehensive'
- `focus` (optional): Specific aspect to focus on
- `provider` (optional): Preferred provider

**Example:**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "detailLevel": "detailed",
  "focus": "people"
}
```

### 4. `tag_image`

Extract tags and metadata from images.

**Parameters:**
- `imageUrl` (required): URL of the image to tag
- `maxTags` (optional): Maximum number of tags (1-20)
- `minConfidence` (optional): Minimum confidence threshold (0-1)
- `categories` (optional): Focus on specific categories
- `includeColors` (optional): Include color analysis

**Example:**
```json
{
  "imageUrl": "https://example.com/photo.jpg",
  "maxTags": 10,
  "minConfidence": 0.3,
  "categories": ["objects", "people"],
  "includeColors": true
}
```

## 🎨 Available Styles

Choose from 15+ artistic styles for image generation:

| Style | Description | Best For |
|-------|-------------|----------|
| `realistic` | Photorealistic images | Professional photos, portraits |
| `cartoon` | Fun, colorful cartoon style | Children's content, playful designs |
| `anime` | Japanese anime/manga style | Character art, stylized illustrations |
| `oil-painting` | Classical oil painting | Fine art, traditional aesthetics |
| `watercolor` | Soft watercolor effects | Gentle, artistic illustrations |
| `sketch` | Hand-drawn pencil sketch | Concept art, rough designs |
| `digital-art` | Modern digital artwork | Contemporary designs |
| `cyberpunk` | Futuristic neon aesthetic | Sci-fi, technology themes |
| `steampunk` | Victorian industrial style | Retro-futuristic designs |
| `minimalist` | Clean, simple design | Modern, professional looks |
| `vintage` | Retro, nostalgic style | Classic, timeless designs |
| `pop-art` | Bold, colorful pop art | Eye-catching, commercial art |
| `surreal` | Dreamlike, fantastical | Creative, imaginative scenes |
| `photographic` | Professional photography | High-quality, realistic images |
| `abstract` | Non-representational art | Artistic, experimental designs |

## ⚙️ Configuration

### Provider Configuration

The server supports multiple AI providers with automatic fallback:

**ChatGPT/OpenAI:**
- Models: DALL-E 3, DALL-E 2
- Features: Generation, Description (GPT-4 Vision)
- Quality: Premium, professional results
- API: `https://platform.openai.com/api-keys`

**HuggingFace:**
- Models: Stable Diffusion XL, SD 2.1, custom models
- Features: Generation, Description (BLIP), Tagging (ViT)
- Quality: Open-source, customizable
- API: `https://huggingface.co/settings/tokens`

### Cache Configuration

Intelligent caching system for improved performance:

```json
{
  "cache": {
    "enabled": true,
    "ttl": 86400000,
    "maxSize": 100,
    "directory": "./cache"
  }
}
```

### Output Configuration

Customize where and how images are saved:

```json
{
  "output": {
    "directory": "./generated-images",
    "format": "png",
    "naming": "{{timestamp}}-{{hash}}"
  }
}
```

## 🏗️ Architecture

### Provider Pattern
- **Abstraction Layer**: Unified interface for different AI providers
- **Fallback System**: Automatic switching when providers fail
- **Feature Detection**: Tools enabled based on provider capabilities

### Caching System
- **Smart Caching**: Request-based caching with content hashing
- **File Management**: Automatic cleanup and orphan file removal
- **Performance Metrics**: Hit rates and usage statistics

### Error Handling
- **Structured Errors**: Comprehensive error codes and user-friendly messages
- **Retry Logic**: Intelligent retries with exponential backoff
- **Logging**: Detailed error tracking and debugging information

## 📊 Monitoring & Debugging

### Server Status
Check server health and provider availability:
```bash
# View server logs
npm start

# Development mode with auto-reload
npm run dev
```

### Cache Statistics
Monitor cache performance and storage usage through the API responses.

### Error Tracking
All errors are logged with:
- Error codes and severity levels
- Provider-specific error handling
- User-friendly error messages
- Request tracing for debugging

## 🔒 Security & Best Practices

### API Key Management
- Store keys in environment variables
- Use `.env` files for local development
- Never commit API keys to version control

### Input Validation
- Comprehensive parameter validation
- Content policy compliance
- Request size limitations

### Rate Limiting
- Provider-specific rate limit handling
- Automatic retry with backoff
- Queue management for high-volume usage

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**No providers available:**
- Check API keys in environment variables
- Verify network connectivity
- Ensure provider APIs are accessible

**Generation failures:**
- Try different prompts or styles
- Check provider status and quotas
- Review error logs for specific issues

**Cache issues:**
- Clear cache directory if corrupted
- Check disk space and permissions
- Adjust cache settings in configuration

### Getting Help

- 📧 **Issues**: [GitHub Issues](https://github.com/bramato/ImageForMeDearAi/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/bramato/ImageForMeDearAi/discussions)
- 📚 **Documentation**: [Project Wiki](https://github.com/bramato/ImageForMeDearAi/wiki)

## 🗺️ Roadmap

- [ ] Additional AI providers (Midjourney, Stable Diffusion API)
- [ ] Advanced image editing capabilities
- [ ] Batch processing support
- [ ] REST API interface
- [ ] Web dashboard for management
- [ ] Custom style training
- [ ] Image upscaling and enhancement
- [ ] Video generation support

---

Made with ❤️ for the Model Context Protocol ecosystem.