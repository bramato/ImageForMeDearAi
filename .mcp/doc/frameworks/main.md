# 🔧 Main Frameworks - ImageForMeDearAi

## Primary Framework
**Name:** Model Context Protocol (MCP)
**Version:** Latest stable
**Documentation:** https://modelcontextprotocol.io/
**Repository:** https://github.com/modelcontextprotocol

## Runtime Environment
**Name:** Node.js
**Version:** >= 18.0.0 (recommended 20+)
**TypeScript:** >= 5.0.0

## Core Dependencies (Planned)

### MCP Framework
- `@modelcontextprotocol/sdk`: Core MCP SDK
- `@modelcontextprotocol/server`: Server implementation utilities

### HTTP & API Integration  
- `axios`: HTTP client per API calls
- `node-fetch`: Alternative HTTP client

### Configuration & Validation
- `dotenv`: Environment variables management
- `zod`: Runtime type validation
- `joi`: Alternative validation library

### Utilities
- `winston`: Logging framework
- `lodash`: Utility functions
- `uuid`: UUID generation

### Testing & Development
- `jest`: Testing framework
- `supertest`: HTTP testing
- `ts-jest`: TypeScript testing support
- `nodemon`: Development auto-reload

## Specific Configurations
- **tsconfig.json**: Strict TypeScript configuration
- **jest.config.js**: Test environment setup
- **.env.example**: Environment variables template

## Framework Conventions
- Uso di TypeScript per type safety
- Implementazione asincrona con async/await
- Error-first callback pattern
- Structured logging con winston
- Environment-based configuration