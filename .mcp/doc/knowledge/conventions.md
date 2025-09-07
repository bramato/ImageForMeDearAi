# 📝 Code Conventions - ImageForMeDearAi

## Coding Style
**Standard:** Airbnb TypeScript Style Guide
**Formatter:** Prettier
**Linter:** ESLint con plugin TypeScript

## Naming Conventions

### Files & Directories
- **Files:** camelCase.ts (es. imageProvider.ts)
- **Classes:** PascalCase (es. OpenAIProvider.ts)
- **Constants:** UPPER_SNAKE_CASE (es. DEFAULT_CONFIG.ts)
- **Directories:** kebab-case (es. image-providers/)

### Variables & Functions
- **Variables:** camelCase (es. apiKey, imageUrl)
- **Functions:** camelCase con verbi (es. generateImage, validateConfig)
- **Classes:** PascalCase (es. ImageProvider, ConfigManager)
- **Interfaces:** PascalCase con 'I' prefix (es. IImageProvider, IConfig)
- **Types:** PascalCase (es. ImageResponse, ProviderConfig)
- **Enums:** PascalCase (es. ImageFormat, ProviderType)

## File Structure Conventions

### Source Files Organization
```
src/
├── providers/           # Provider implementations
│   ├── base/           # Base classes e interfaces
│   ├── openai/         # OpenAI provider
│   └── huggingface/    # HuggingFace provider
├── server/             # MCP server core
├── utils/              # Utility functions
├── types/              # Type definitions
├── config/             # Configuration management
└── errors/             # Custom error classes
```

### Import Order
1. Node.js built-in modules
2. External libraries
3. Internal modules (absolute paths)
4. Relative imports (same directory)

## Used Patterns

### 1. Provider Pattern
```typescript
interface IImageProvider {
  generateImage(prompt: string, options?: ImageOptions): Promise<ImageResponse>;
  validateConfig(): boolean;
}
```

### 2. Factory Pattern
```typescript
class ProviderFactory {
  static createProvider(type: ProviderType): IImageProvider {
    // Factory logic
  }
}
```

### 3. Strategy Pattern
Per gestione fallback tra provider

### 4. Configuration Pattern
```typescript
class ConfigManager {
  private static instance: ConfigManager;
  static getInstance(): ConfigManager;
}
```

## Error Handling Conventions

### Custom Error Classes
```typescript
class ImageGenerationError extends Error {
  constructor(
    message: string,
    public provider: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ImageGenerationError';
  }
}
```

### Error Response Format
```typescript
interface ErrorResponse {
  error: string;
  provider: string;
  code: string;
  message: string;
  timestamp: string;
}
```

## Logging Conventions

### Log Levels
- **error:** Errori che richiedono attenzione immediata
- **warn:** Problemi potenziali (rate limits, fallback)
- **info:** Informazioni generali (richieste, risposte)
- **debug:** Dettagli per debugging
- **trace:** Dettagli molto granulari

### Log Format
```typescript
logger.info('Image generation started', {
  provider: 'openai',
  prompt: prompt.substring(0, 100),
  options: sanitizedOptions
});
```

## Testing Conventions

### Test File Naming
- **Unit Tests:** `*.test.ts`
- **Integration Tests:** `*.integration.test.ts`
- **E2E Tests:** `*.e2e.test.ts`

### Test Structure
```typescript
describe('OpenAIProvider', () => {
  describe('generateImage', () => {
    it('should generate image successfully', async () => {
      // Test implementation
    });
  });
});
```