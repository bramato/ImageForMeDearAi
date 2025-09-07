# 📁 Project Structure - ImageForMeDearAi

**Project Type:** MCP Server for Image Generation
**Architecture Pattern:** Provider-based modular architecture

## Main Directories (To be created)
- `/src/` - Main source code
  - `/providers/` - Image generation providers (OpenAI, HuggingFace)
  - `/server/` - MCP server implementation
  - `/utils/` - Utility functions and helpers
  - `/types/` - TypeScript type definitions
- `/tests/` - Test suite
- `/config/` - Configuration files
- `/docs/` - Documentation
- `/examples/` - Usage examples

## Architectural Pattern
**Provider Pattern** con **Factory Method** per la gestione dei diversi provider di generazione immagini.

### Core Components:
1. **MCP Server Core**: Gestione delle richieste MCP
2. **Provider Manager**: Factory per la gestione dei provider
3. **Image Provider Interface**: Interfaccia comune per tutti i provider
4. **Configuration Manager**: Gestione configurazioni e chiavi API
5. **Cache Manager**: Sistema di caching per ottimizzazione
6. **Error Handler**: Gestione centralizzata degli errori

## Technology Stack (Planned)
- **Runtime:** Node.js/TypeScript
- **MCP Framework:** @modelcontextprotocol/sdk
- **HTTP Client:** axios/fetch
- **Configuration:** dotenv
- **Validation:** zod
- **Testing:** Jest
- **Logging:** winston

## Specific Notes
- Progetto attualmente in fase di inizializzazione
- Struttura da creare seguendo best practices MCP
- Focus su modularità e estensibilità per futuri provider