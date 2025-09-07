# 🎯 ImageForMeDearAi - Claude Code Setup Guide

## 📋 Quick Install

### 1. Install the MCP Server
```bash
npm install -g image-for-me-dear-ai
```

### 2. Run Interactive Setup
```bash
image-for-me-dear-ai setup
```

### 3. Configure Claude Code

Add to your Claude Code MCP configuration file (`~/.claude/mcp_settings.json`):

```json
{
  "mcpServers": {
    "image-for-me-dear-ai": {
      "command": "image-for-me-dear-ai",
      "args": ["server"],
      "env": {
        "OPENAI_API_KEY": "your_openai_key_here",
        "HUGGINGFACE_API_KEY": "your_hf_key_here"
      }
    }
  }
}
```

## 🛠️ Advanced Configuration

### Environment Variables Setup
Create a `.env` file or set environment variables:

```bash
# Required: API Keys
export OPENAI_API_KEY="your_openai_api_key_here"
export HUGGINGFACE_API_KEY="your_huggingface_token_here"

# Optional: Model Configuration
export OPENAI_MODEL="dall-e-3"
export HUGGINGFACE_MODEL="black-forest-labs/FLUX.1-schnell"

# Optional: Cache Settings
export CACHE_ENABLED=true
export CACHE_TTL=3600
export CACHE_MAX_SIZE=100

# Optional: Output Settings
export DEFAULT_OUTPUT_DIR="./generated_images"
export DEFAULT_IMAGE_FORMAT="png"
export DEFAULT_IMAGE_SIZE="1024x1024"
```

### Claude Code Configuration Options

#### Option 1: Global Installation (Recommended)
```json
{
  "mcpServers": {
    "image-for-me-dear-ai": {
      "command": "image-for-me-dear-ai", 
      "args": ["server"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

#### Option 2: Local Development Build
```json
{
  "mcpServers": {
    "image-for-me-dear-ai": {
      "command": "node",
      "args": ["./dist/server.js"],
      "cwd": "/path/to/ImageForMeDearAi",
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "true"
      }
    }
  }
}
```

#### Option 3: Docker Container
```json
{
  "mcpServers": {
    "image-for-me-dear-ai": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "OPENAI_API_KEY",
        "-e", "HUGGINGFACE_API_KEY", 
        "image-for-me-dear-ai:latest"
      ]
    }
  }
}
```

## 🎨 Available Tools in Claude Code

### 1. `generate_image` - AI Image Generation
Creates images from text descriptions with artistic styles.

**Usage in Claude Code:**
```
Generate a "futuristic robot in cyberpunk style" with 1024x1024 dimensions
```

**Parameters:**
- `prompt` (required): Text description
- `style` (optional): artistic, realistic, cartoon, anime, oil-painting, watercolor, etc.
- `width/height` (optional): Image dimensions
- `provider` (optional): "openai" or "huggingface"

### 2. `generate_logo` - Professional Logo Creation
Creates business logos and brand assets.

**Usage in Claude Code:**
```
Create a minimalist logo for "TechCorp" company in blue and white colors
```

**Parameters:**
- `text` (required): Company/brand name
- `style` (optional): minimalist, vintage, modern, etc.
- `colors` (optional): Color preferences
- `industry` (optional): tech, healthcare, finance, etc.

### 3. `describe_image` - Image Analysis
Provides detailed descriptions of images for documentation.

**Usage in Claude Code:**
```
Analyze and describe this screenshot for technical documentation
```

**Parameters:**
- `image_url` or `image_path` (required): Image to analyze
- `detail_level` (optional): basic, detailed, technical
- `focus` (optional): ui, content, objects, people

### 4. `tag_image` - Image Tagging
Generates relevant tags and keywords for images.

**Usage in Claude Code:**
```
Generate SEO tags for this product photo
```

**Parameters:**
- `image_url` or `image_path` (required): Image to tag
- `tag_type` (optional): seo, social, descriptive, technical
- `max_tags` (optional): Maximum number of tags

## 🚀 Workflow Examples

### Development Workflow
```bash
# 1. Generate mockup images for your app
"Generate a mobile app login screen mockup, modern UI design"

# 2. Create placeholder images
"Create a 400x300 placeholder image for blog posts, minimalist style"

# 3. Generate icons and assets
"Create a settings icon, 64x64, flat design, blue color"
```

### Content Creation Workflow
```bash
# 1. Generate blog post images
"Create a header image about AI and machine learning, futuristic style"

# 2. Social media assets
"Generate a Twitter post image about web development tips, vibrant colors"

# 3. Documentation images
"Create a diagram showing API data flow, technical illustration style"
```

### Design Workflow
```bash
# 1. Concept exploration
"Generate 5 different logo concepts for a coffee shop, various styles"

# 2. Color variations
"Create the same logo in different color schemes: warm, cool, monochrome"

# 3. Asset variations
"Generate this logo in multiple formats: horizontal, vertical, icon-only"
```

## 🔧 Troubleshooting

### Installation Issues
```bash
# Check installation
image-for-me-dear-ai --version

# Reinstall if needed
npm uninstall -g image-for-me-dear-ai
npm install -g image-for-me-dear-ai

# Fix permissions
chmod +x $(which image-for-me-dear-ai)
```

### Configuration Issues
```bash
# Test MCP server directly
image-for-me-dear-ai server

# Debug mode
DEBUG=true image-for-me-dear-ai server

# Check configuration
image-for-me-dear-ai setup
```

### API Issues
```bash
# Verify API keys
echo $OPENAI_API_KEY
echo $HUGGINGFACE_API_KEY

# Test API connectivity
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

## 📊 Performance Tips

### Optimize for Speed
```json
{
  "mcpServers": {
    "image-for-me-dear-ai": {
      "env": {
        "CACHE_ENABLED": "true",
        "CACHE_TTL": "7200",
        "HUGGINGFACE_MODEL": "black-forest-labs/FLUX.1-schnell"
      }
    }
  }
}
```

### Optimize for Quality
```json
{
  "mcpServers": {
    "image-for-me-dear-ai": {
      "env": {
        "OPENAI_MODEL": "dall-e-3",
        "DEFAULT_IMAGE_SIZE": "1792x1024"
      }
    }
  }
}
```

## 🔐 Security Best Practices

### API Key Management
- Use environment variables, not hardcoded keys
- Rotate API keys regularly
- Use separate keys for development/production
- Monitor API usage and costs

### File Permissions
```bash
# Secure configuration file
chmod 600 ~/.claude/mcp_settings.json

# Secure environment file
chmod 600 .env
```

## 📚 Integration with Claude Code Features

### Code Generation
Use generated images as:
- UI mockups for frontend development
- Documentation diagrams
- Asset placeholders in code

### Project Documentation  
- Generate flowcharts and diagrams
- Create visual API documentation
- Build user guide images

### Testing and QA
- Describe UI screenshots for bug reports
- Generate test data images
- Create visual regression test baselines

## 🆘 Support & Resources

- 📖 [Complete Documentation](https://github.com/bramato/ImageForMeDearAi)
- 🐛 [Issue Tracker](https://github.com/bramato/ImageForMeDearAi/issues)  
- 💬 [Discussions](https://github.com/bramato/ImageForMeDearAi/discussions)
- 📧 [Email Support](mailto:marco@example.com)

## 🔄 Updates

Keep your installation updated:
```bash
npm update -g image-for-me-dear-ai
```

Check for new features and improvements in the [changelog](https://github.com/bramato/ImageForMeDearAi/releases).

---

*ImageForMeDearAi v1.2.2 - Designed for Claude Code integration*