# 🎯 Main Project Context - ImageForMeDearAi

**Last update date:** 2025-09-07
**Context version:** 1.0
**Project Type:** MCP Server for Image Generation

## 📋 Context Index

### 🏗️ Project
- [Project Structure](./project/structure.md)
- [Configurations](./project/config.md)
- [Dependencies](./project/dependencies.md)

### 🔧 Frameworks and Technologies
- [Main Frameworks](./frameworks/main.md)
- [Used Libraries](./frameworks/libraries.md)
- [Versions and Compatibility](./frameworks/versions.md)

### 🌐 APIs and Services
- [Internal APIs](./apis/internal.md)
- [External Services](./apis/external.md)
- [API Documentation](./apis/documentation.md)

### 📚 Knowledge Base
- [Code Conventions](./knowledge/conventions.md)
- [Architectural Patterns](./knowledge/patterns.md)
- [Best Practices](./knowledge/best_practices.md)

## 🎯 Project Overview

**ImageForMeDearAi** è un server MCP (Model Context Protocol) specializzato nella generazione di immagini attraverso l'integrazione di diversi provider AI:

- **ChatGPT/OpenAI DALL-E**: Per generazione immagini di alta qualità
- **HuggingFace**: Per modelli open-source di image generation
- **Architettura modulare**: Supporto per aggiunta di nuovi provider

## 🚀 Obiettivi del Progetto

1. **Server MCP Completo**: Implementazione server conforme alle specifiche MCP
2. **Multi-Provider**: Integrazione seamless di multiple API per generazione immagini
3. **Gestione Configurazione**: Sistema flessibile per gestire chiavi API e configurazioni
4. **Cache Intelligente**: Sistema di caching per ottimizzare performance e costi
5. **Error Handling**: Gestione robusta degli errori e fallback tra provider
6. **Logging & Monitoring**: Sistema completo di logging e monitoraggio

## 🎯 Instructions for Agents

**FUNDAMENTAL RULE:** All agents must:

1. **Always read the context** before starting any task
2. **Consult specific files** for their domain of expertise
3. **Update the context** when necessary
4. **Maintain consistency** with existing conventions

## 🔄 Context Updates

To update or extend the context, use the **installer.workflow.context-manager** agent which can:
- Analyze updated web documentation
- Create new atomic context files
- Integrate new technologies into existing context
- Maintain coherence across all context files

## 📋 Current Development Status

**Status:** Inizializzazione del progetto
**Next Steps:** 
- Analisi requisiti dettagliati
- Setup struttura base del server MCP
- Implementazione provider ChatGPT
- Implementazione provider HuggingFace
- Sistema di configurazione e testing