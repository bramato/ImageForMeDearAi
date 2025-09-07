# 🎯 ImageForMeDearAi - Cursor Setup Guide

## 📋 Quick Install

### 1. Install the MCP Server
```bash
npm install -g image-for-me-dear-ai
```

### 2. Run Setup Wizard
```bash
image-for-me-dear-ai setup
```

### 3. Configure Cursor

Add to your Cursor MCP settings (`~/.cursor/mcp_servers.json`):

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

### Environment Variables
Create a `.env` file in your project root:

```bash
# OpenAI Configuration (for DALL-E)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=dall-e-3

# HuggingFace Configuration  
HUGGINGFACE_API_KEY=your_huggingface_token_here
HUGGINGFACE_MODEL=black-forest-labs/FLUX.1-schnell

# Cache Settings
CACHE_ENABLED=true
CACHE_TTL=3600
CACHE_MAX_SIZE=100

# Output Settings
DEFAULT_OUTPUT_DIR=./generated_images
DEFAULT_IMAGE_FORMAT=png
DEFAULT_IMAGE_SIZE=1024x1024
```

### Alternative Setup (Local Development)

If you're working on the MCP server locally:

```json
{
  "mcpServers": {
    "image-for-me-dear-ai": {
      "command": "node",
      "args": ["/path/to/ImageForMeDearAi/dist/server.js"],
      "cwd": "/path/to/ImageForMeDearAi",
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

## 🎨 Available Tools in Cursor

Once configured, you'll have access to these tools via Cursor's AI chat:

### 1. `generate_image`
Generate AI images with various artistic styles
```
@image-for-me-dear-ai Generate a cyberpunk cityscape at night
```

### 2. `generate_logo` 
Create professional logos for brands
```
@image-for-me-dear-ai Create a minimalist tech company logo with "AI Corp"
```

### 3. `describe_image`
Get detailed descriptions of images
```
@image-for-me-dear-ai Describe this screenshot for documentation
```

### 4. `tag_image`
Generate relevant tags for images
```
@image-for-me-dear-ai Generate SEO tags for this product image
```

## 🚀 Usage Examples

### Generate Marketing Images
```
Generate a product showcase image with realistic style, 1024x1024, showing a modern smartphone on a clean desk
```

### Create Brand Assets
```
Generate a professional logo for "TechStart" company, minimalist style, suitable for business cards
```

### Content Analysis
```
Describe this user interface screenshot in detail for our documentation
```

## 🔧 Troubleshooting

### Common Issues

1. **Permission Errors**
   ```bash
   sudo chmod +x $(which image-for-me-dear-ai)
   ```

2. **API Key Issues**
   - Verify keys are correctly set in environment
   - Check API key permissions and quotas

3. **Connection Issues**
   - Restart Cursor after configuration changes
   - Check MCP server logs in Cursor developer tools

### Debug Mode
Enable detailed logging:

```json
{
  "mcpServers": {
    "image-for-me-dear-ai": {
      "command": "image-for-me-dear-ai",
      "args": ["server"],
      "env": {
        "DEBUG": "true",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

## 📚 Integration Tips

### Workflow Integration
- Use with Cursor's AI chat for rapid prototyping
- Generate images directly in your development workflow  
- Create assets for documentation and presentations
- Analyze UI screenshots for code generation

### Best Practices
- Set appropriate cache settings for your workflow
- Use descriptive prompts for better results
- Leverage different artistic styles for varied outputs
- Organize generated images in project folders

## 🆘 Support

- 📖 [Full Documentation](https://github.com/bramato/ImageForMeDearAi)
- 🐛 [Report Issues](https://github.com/bramato/ImageForMeDearAi/issues)
- 💬 [Community Discussion](https://github.com/bramato/ImageForMeDearAi/discussions)

---

*Generated with ImageForMeDearAi v1.2.2*