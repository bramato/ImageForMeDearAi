# Istruzioni per Claude Code

Questo file contiene le istruzioni specifiche per il progetto e gli agenti installati.


<!-- START: Claude Agent Installer Instructions -->
# 📋 Project Context Management System

**IMPORTANT: Before using any agent, you must initialize the project context management system.**

## 🚀 Context Initialization (MANDATORY)

### 1. **Create Base Structure**

Create the following directory structure in the project root:

```bash
mkdir -p .mcp/doc/{project,frameworks,apis,knowledge,templates}
```

### 2. **Main Context File**

Create the `.mcp/doc/context_main.md` file with the following structure:

```markdown
# 🎯 Main Project Context

**Last update date:** [INSERT_DATE]
**Context version:** 1.0

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
```

### 3. **Base File Templates**

Create the following base templates:

#### `.mcp/doc/project/structure.md`
```markdown
# 📁 Project Structure

[PROJECT ARCHITECTURE DESCRIPTION]

## Main Directories
- `/src/` - Main source code
- `/tests/` - Test suite
- `/docs/` - Documentation
- `/config/` - Configuration files

## Architectural Pattern
[INSERT USED PATTERN]

## Specific Notes
[INSERT PROJECT SPECIFIC NOTES]
```

#### `.mcp/doc/frameworks/main.md`
```markdown
# 🔧 Main Frameworks

## Primary Framework
**Name:** [INSERT_FRAMEWORK]
**Version:** [INSERT_VERSION]
**Documentation:** [INSERT_LINK]

## Specific Configurations
[INSERT CONFIGURATIONS]

## Framework Conventions
[INSERT CONVENTIONS]
```

#### `.mcp/doc/knowledge/conventions.md`
```markdown
# 📝 Code Conventions

## Coding Style
[INSERT STYLE]

## Naming Conventions
[INSERT NAMING CONVENTIONS]

## File Structure
[INSERT STRUCTURE CONVENTIONS]

## Used Patterns
[INSERT PATTERNS]
```

## ⚡ Recommended Workflow

### For Each Development Session:

1. **Initialize context** (if not done)
2. **Consult context_main.md** for overview
3. **Read specific files** for the task
4. **Use specialized agents** with context
5. **Update context** if necessary

### For New Technologies/Frameworks:

1. **Invoke installer.workflow.context-manager**
2. **Specify technology to integrate**
3. **Agent will create specific context files**
4. **Automatic context_main.md update**

## 🎯 System Benefits

✅ **Consistency:** All agents work with the same information
✅ **Scalability:** Easy to add new contexts
✅ **Maintainability:** Atomically organized information
✅ **Efficiency:** More precise agents with specific context
✅ **Collaboration:** Team aligned on conventions

## 📋 Initialization Checklist

- [ ] Created `.mcp/doc/` directory structure
- [ ] Created `context_main.md` file
- [ ] Created base templates in subdirectories
- [ ] Populated files with project-specific information
- [ ] Tested agent access with new system

---

**⚠️ IMPORTANT:** This system must be initialized BEFORE using any agent to ensure optimal and consistent results.

---

# 🤖 Guida Utilizzo Agenti Installati

Gli agenti seguenti sono disponibili e pronti per l'uso. Ogni agente è specializzato in domini specifici e dovrebbe essere invocato quando necessario.

**⚠️ IMPORTANT:** Make sure you have initialized the context management system before using the agents (see previous sections).

## 📋 Agenti Disponibili e Quando Usarli

### 🔧 **Installer Ai Prompt-Engineer**
**Nome agente:** `installer.ai.prompt-engineer`

**Quando usare:** "Utilizza per LLM integration, prompt optimization, AI workflows, conversational AI, RAG systems e AI safety. Esperto in prompt engineering patterns e orchestrazione AI complessa."

**Invocazione:** Usa il Task tool con `subagent_type: "installer.ai.prompt-engineer"`

---

### 🔧 **Installer Backend Nodejs**
**Nome agente:** `installer.backend.nodejs`

**Quando usare:** Utilizza per sviluppo backend Node.js, creazione API REST/GraphQL, integrazione database, microservizi, TypeScript e ottimizzazioni delle performance server-side.

**Invocazione:** Usa il Task tool con `subagent_type: "installer.backend.nodejs"`

---

### 🔧 **Installer Backend Php-Laravel**
**Nome agente:** `installer.backend.php-laravel`

**Quando usare:** Utilizza per sviluppo backend PHP/Laravel, creazione API, Eloquent ORM, comandi Artisan, middleware, job queues e architetture enterprise Laravel.

**Invocazione:** Usa il Task tool con `subagent_type: "installer.backend.php-laravel"`

---

### 🔧 **Wrangler-Mock-Expert**
**Nome agente:** `wrangler-mock-expert`

**Quando usare:** Utilizza per sviluppo edge computing, Cloudflare Workers, D1 database, KV storage, R2 e applicazioni serverless distribuite.

**Invocazione:** Usa il Task tool con `subagent_type: "wrangler-mock-expert"`

---

### 🔧 **Installer Console Terminal-Expert**
**Nome agente:** `installer.console.terminal-expert`

**Quando usare:** Utilizza per sviluppo CLI tools, shell scripting, automazione terminal, applicazioni console e integrazione workflow da riga di comando.

**Invocazione:** Usa il Task tool con `subagent_type: "installer.console.terminal-expert"`

---

### 🔧 **Installer Data Python-Analyst**
**Nome agente:** `installer.data.python-analyst`

**Quando usare:** "Utilizza per data science, analisi esplorativa dei dati, machine learning, statistical modeling, data visualization e predictive analytics. Esperto in Python ecosystem per data analysis e ML workflows."

**Invocazione:** Usa il Task tool con `subagent_type: "installer.data.python-analyst"`

---

### 🔧 **Installer Database Sql-Architect**
**Nome agente:** `installer.database.sql-architect`

**Quando usare:** Utilizza per design database, ottimizzazione query SQL, strategie di indicizzazione, migrazioni, stored procedures e architetture multi-database enterprise.

**Invocazione:** Usa il Task tool con `subagent_type: "installer.database.sql-architect"`

---

### 🔧 **Installer Devops Docker-Expert**
**Nome agente:** `installer.devops.docker-expert`

**Quando usare:** "Utilizza per containerization Docker, orchestrazione Kubernetes, CI/CD automation, Infrastructure as Code, monitoring e deployment strategies. Esperto in DevOps best practices e cloud-native architectures."

**Invocazione:** Usa il Task tool con `subagent_type: "installer.devops.docker-expert"`

---

### 🔧 **Book-Formatter-Expert**
**Nome agente:** `book-formatter-expert`

**Quando usare:** Utilizza per formattazione libri e documenti professionali, conversione formati, layout publishing e preparazione testi per stampa/digitale.

**Invocazione:** Usa il Task tool con `subagent_type: "book-formatter-expert"`

---

### 🔧 **Documentation-Expert**
**Nome agente:** `documentation-expert`

**Quando usare:** Utilizza per documentazione codice, README files, API docs, guide utente, commenti codice e documentazione tecnica completa.

**Invocazione:** Usa il Task tool con `subagent_type: "documentation-expert"`

---

### 🔧 **Installer Frontend React**
**Nome agente:** `installer.frontend.react`

**Quando usare:** Utilizza per sviluppo frontend React, componenti TypeScript, state management (Redux/Zustand), hooks personalizzati, performance optimization e architetture scalabili.

**Invocazione:** Usa il Task tool con `subagent_type: "installer.frontend.react"`

---

### 🔧 **Tailwind-Ui-Expert**
**Nome agente:** `tailwind-ui-expert`

**Quando usare:** Utilizza per design UI/UX, sistema di design con Tailwind CSS, componenti accessibili, responsive design e ottimizzazione dell'esperienza utente.

**Invocazione:** Usa il Task tool con `subagent_type: "tailwind-ui-expert"`

---

### 🔧 **Git-Commit-Expert**
**Nome agente:** `git-commit-expert`

**Quando usare:** Usa dopo aver completato task di sviluppo per creare commit professionali con gitmoji appropriati, analisi dell'impatto e messaggi strutturati per la documentazione storica del progetto.

**Invocazione:** Usa il Task tool con `subagent_type: "git-commit-expert"`

---

### 🔧 **Github-Issue-Creator**
**Nome agente:** `github-issue-creator`

**Quando usare:** Utilizza per creare issue GitHub professionali con template strutturati, documenta bug con step di riproduzione, feature request con analisi di business value e task con criteri di accettazione chiari.

**Invocazione:** Usa il Task tool con `subagent_type: "github-issue-creator"`

---

### 🔧 **Filament-Tall-Expert**
**Nome agente:** `filament-tall-expert`

**Quando usare:** Utilizza per admin panels Filament, TALL stack (Tailwind, Alpine, Livewire, Laravel), sistemi multi-tenancy e dashboard enterprise.

**Invocazione:** Usa il Task tool con `subagent_type: "filament-tall-expert"`

---

### 🔧 **React-Native-Expert**
**Nome agente:** `react-native-expert`

**Quando usare:** Utilizza per sviluppo app mobile cross-platform, componenti nativi, navigazione, state management mobile e ottimizzazioni performance native.

**Invocazione:** Usa il Task tool con `subagent_type: "react-native-expert"`

---

### 🔧 **Swift-Macos-Expert**
**Nome agente:** `swift-macos-expert`

**Quando usare:** Utilizza per sviluppo applicazioni macOS native, SwiftUI, framework Apple, integrazione sistema e architetture native Apple.

**Invocazione:** Usa il Task tool con `subagent_type: "swift-macos-expert"`

---

### 🔧 **Task-Planning-Expert**
**Nome agente:** `task-planning-expert`

**Quando usare:** Utilizza per pianificazione progetti, breakdown task complessi, organizzazione workflow, milestone e gestione strategica dello sviluppo.

**Invocazione:** Usa il Task tool con `subagent_type: "task-planning-expert"`

---

### 🔧 **Installer Security Code-Auditor**
**Nome agente:** `installer.security.code-auditor`

**Quando usare:** "Utilizza per code security review, vulnerability assessment, dependency scanning, secure coding practices, compliance OWASP e threat modeling. Esperto in SAST/DAST tools e architetture sicure."

**Invocazione:** Usa il Task tool con `subagent_type: "installer.security.code-auditor"`

---

### 🔧 **Installer Testing E2e-Playwright**
**Nome agente:** `installer.testing.e2e-playwright`

**Quando usare:** "Utilizza per end-to-end testing con Playwright/Cypress, browser automation, visual testing, cross-browser testing e integrazione CI/CD. Esperto in test automation architecture e performance testing."

**Invocazione:** Usa il Task tool con `subagent_type: "installer.testing.e2e-playwright"`

---

### 🔧 **Installer Testing Mock-Generator**
**Nome agente:** `installer.testing.mock-generator`

**Quando usare:** Utilizza per generazione dati mock realistici, testing, prototipazione, seed database e simulazione scenari di sviluppo.

**Invocazione:** Usa il Task tool con `subagent_type: "installer.testing.mock-generator"`

---

### 🔧 **Chat-Initializer**
**Nome agente:** `chat-initializer`

**Quando usare:** Invoca questo agente all'inizio di ogni sessione di sviluppo per analizzare automaticamente README.md, KB.md e la struttura del progetto. Crea un documento di contesto temporaneo con le informazioni rilevanti per il task richiesto.

**Invocazione:** Usa il Task tool con `subagent_type: "chat-initializer"`

---

### 🔧 **Installer Workflow Context-Manager**
**Nome agente:** `installer.workflow.context-manager`

**Quando usare:** Senior Project Context Management Specialist - Expert in creating, maintaining, and analyzing dynamic project context through atomic documentation files and web research integration

**Invocazione:** Usa il Task tool con `subagent_type: "installer.workflow.context-manager"`

---


## 💡 How to Use Agents

1. **Identify the task** you need to accomplish
2. **Choose the appropriate agent** from the list above
3. **Invoke the agent** using the Task tool with the correct name
4. **Provide detailed context** in the task description

## 🚨 Important

- Always use the **Chat Initializer** agent at the beginning of each development session
- Ogni agente ha expertise senior-level (15+ anni di esperienza)
- Agents work autonomously and return complete results
- You can invoke multiple agents in sequence for complex tasks

<!-- END: Claude Agent Installer Instructions -->
