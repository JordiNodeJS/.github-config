# Configuration Index - Quick Reference

This document provides a quick reference guide to all AI agent configuration files in this project.

## 📁 File Structure Overview

```
GITHUB config/
├── AGENTS.md                          # ✅ MAIN - Universal configuration
├── AGENT-CONFIG-README.md             # 📖 Documentation for multi-agent setup
├── CONFIG-INDEX.md                    # 📋 This file
│
├── .agents/                           # 🎯 Universal Agents modular structure
│   ├── README.md                      # Documentation
│   ├── rules/                         # Domain-specific rules
│   │   ├── architecture.md            # System architecture patterns
│   │   ├── authentication.md          # JWT auth implementation
│   │   ├── database.md                # Prisma + Neon patterns
│   │   ├── caching.md                 # Next.js 16 caching strategy
│   │   ├── styling.md                 # Tailwind CSS + design system
│   │   └── api-integration.md         # TMDB API integration
│   └── skills/                        # Step-by-step guides
│       └── create-new-page.md         # Creating new Next.js pages
│
├── .trae/                             # 🔧 TRAE-specific format
│   └── rules/
│       └── project_rules.md           # Complete TRAE configuration
│
├── .github/                           # 🤖 GitHub Copilot format
│   └── copilot-instructions.md        # GitHub Copilot configuration
│
└── .opencode/                         # 💻 OpenCode format
    └── project-rules.md               # OpenCode configuration
```

## 🎯 Quick Access by Topic

### Architecture & Patterns
- **Main**: `AGENTS.md` (Lines: Project Overview, Architecture)
- **Detailed**: `.agents/rules/architecture.md`
- **TRAE**: `.trae/rules/project_rules.md` (Lines: Project Architecture)

### Authentication & Security
- **Main**: `AGENTS.md` (Lines: Authentication System)
- **Detailed**: `.agents/rules/authentication.md`
- **Key Files**: `src/lib/auth-actions.ts`, `src/lib/auth-utils.ts`, `src/lib/actions.ts`

### Database & Prisma
- **Main**: `AGENTS.md` (Lines: Database Patterns)
- **Detailed**: `.agents/rules/database.md`
- **Schema**: `prisma/schema.prisma`
- **Client**: `src/lib/prisma.ts`

### Caching Strategy
- **Main**: `AGENTS.md` (Lines: Caching Strategy)
- **Detailed**: `.agents/rules/caching.md`
- **Config**: `next.config.ts` (cache profiles)

### Styling & Design
- **Main**: `AGENTS.md` (Lines: Styling System)
- **Detailed**: `.agents/rules/styling.md`
- **Theme**: "Avant-Garde" (glassmorphism, minimalist)

### API Integration
- **Main**: `AGENTS.md` (Lines: TMDB API Integration)
- **Detailed**: `.agents/rules/api-integration.md`
- **Client**: `src/lib/tmdb.ts`

### Development Workflows
- **Commands**: `AGENTS.md` (Lines: Quick Commands)
- **Creating Pages**: `.agents/skills/create-new-page.md`

## 🤖 Configuration by AI Agent

| Agent | Primary File | Fallback | Auto-Load |
|-------|-------------|----------|-----------|
| **GitHub Copilot** | `.github/copilot-instructions.md` | `AGENTS.md` | ✅ Yes |
| **Cursor** | `AGENTS.md` | `.cursor/rules/` | ✅ Yes |
| **TRAE** | `.trae/rules/project_rules.md` | - | ✅ Yes |
| **OpenCode** | `.opencode/project-rules.md` | `AGENTS.md` | ⚠️ Partial |
| **Zed** | `AGENTS.md` | - | ✅ Yes |
| **Aider** | `AGENTS.md` | - | ✅ Yes |
| **Windsurf** | `AGENTS.md` | - | ✅ Yes |
| **Cline** | `AGENTS.md` | - | ✅ Yes |

## 📊 File Sizes & Content Summary

| File | Size | Lines | Purpose |
|------|------|-------|---------|
| `AGENTS.md` | ~10KB | ~300 | Universal standard, main reference |
| `.agents/rules/architecture.md` | ~12KB | ~365 | Detailed architecture patterns |
| `.agents/rules/authentication.md` | ~18KB | ~511 | Complete auth implementation |
| `.agents/rules/database.md` | ~22KB | ~637 | Prisma/Neon best practices |
| `.agents/rules/caching.md` | ~19KB | ~543 | Next.js 16 caching guide |
| `.agents/rules/styling.md` | ~21KB | ~618 | Tailwind CSS design system |
| `.agents/rules/api-integration.md` | ~17KB | ~507 | TMDB API patterns |
| `.agents/skills/create-new-page.md` | ~15KB | ~430 | Step-by-step page creation |
| `.trae/rules/project_rules.md` | ~15KB | ~433 | TRAE-specific format |
| `.opencode/project-rules.md` | ~14KB | ~410 | OpenCode-specific format |

## 🔄 Synchronization Status

**Source of Truth**: `AGENTS.md`

**Last Synced**: 2025-01-20

**Sync Status**:
- ✅ `.agents/rules/*.md` - In sync
- ✅ `.trae/rules/project_rules.md` - In sync
- ✅ `.github/copilot-instructions.md` - In sync
- ✅ `.opencode/project-rules.md` - In sync

## 🛠️ Common Tasks

### Add New Rule
1. Edit `AGENTS.md` (add new section)
2. Create `.agents/rules/[domain].md` (if needed)
3. Sync to `.trae/`, `.opencode/`, `.github/`
4. Test with AI agent

### Update Existing Rule
1. Edit `AGENTS.md` (update section)
2. Update `.agents/rules/[domain].md`
3. Sync to agent-specific formats
4. Commit all files together

### Add New Skill
1. Create `.agents/skills/[skill-name].md`
2. Follow step-by-step guide format
3. Include prerequisites, checklist, examples
4. Reference from `AGENTS.md` or rule files

## 📚 Key Concepts by File

### AGENTS.md
- Project overview
- Quick commands
- Architecture summary
- Code style basics
- Common pitfalls

### .agents/rules/architecture.md
- Server Components vs Client Components
- Service boundaries (User, Movie, Watchlist, Recommendation)
- Data flow patterns
- File organization
- Anti-patterns

### .agents/rules/authentication.md
- JWT implementation (HS256)
- Password hashing (scrypt)
- Protected Server Actions pattern
- Session management
- Security best practices

### .agents/rules/database.md
- Prisma client singleton
- Denormalization strategy
- ID generation (cuid)
- Query patterns (select, include, pagination)
- Transactions

### .agents/rules/caching.md
- Next.js 16 cache directives
- Cache profiles (trending, movie, search, genres)
- revalidateTag vs revalidatePath
- Server Action revalidation patterns

### .agents/rules/styling.md
- Avant-Garde theme
- Tailwind CSS 4 utilities
- Custom classes (glass, text-gradient)
- Dark mode implementation
- Lucide React icons

### .agents/rules/api-integration.md
- TMDB API client
- Internationalization (locale parameter)
- Error handling & fallbacks
- Rate limiting
- Image handling

### .agents/skills/create-new-page.md
- Step-by-step page creation
- Data fetching setup
- Server Actions implementation
- Client Components integration
- i18n setup

## 🎓 Learning Path for New AI Agents

### Step 1: Understand the Project
Read: `AGENTS.md` (full file)

### Step 2: Learn Architecture
Read: `.agents/rules/architecture.md`

### Step 3: Master Core Domains
Read in order:
1. `.agents/rules/database.md`
2. `.agents/rules/authentication.md`
3. `.agents/rules/caching.md`
4. `.agents/rules/api-integration.md`
5. `.agents/rules/styling.md`

### Step 4: Practice with Skills
Follow: `.agents/skills/create-new-page.md`

## 🔍 Search Tips

### Find Configuration by Keyword

- **Next.js 16**: `AGENTS.md`, `architecture.md`, `caching.md`
- **Prisma**: `database.md`, `AGENTS.md`
- **JWT**: `authentication.md`, `AGENTS.md`
- **TMDB**: `api-integration.md`, `AGENTS.md`
- **Tailwind**: `styling.md`, `AGENTS.md`
- **Server Actions**: `architecture.md`, `authentication.md`, `caching.md`
- **Server Components**: `architecture.md`, `create-new-page.md`

## 📞 Support & Resources

- **Main Docs**: `AGENT-CONFIG-README.md`
- **AGENTS.md Standard**: https://github.com/agentsmd/agents.md
- **Project Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-20  
**Maintained By**: Movies Tracker Team