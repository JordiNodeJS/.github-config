# AI Agent Configuration Index

This file provides a comprehensive index of all AI agent configurations in this project, including GitHub Copilot, TRAE, and universal AGENTS.md standard.

## 🗺️ Quick Navigation

| Configuration Type | File Location | Purpose |
|-------------------|---------------|---------|
| **Universal Standard** | [`/AGENTS.md`](../AGENTS.md) | Source of truth for all AI agents |
| **Cursor Rules** | [`.cursor/rules/`](../.cursor/rules/) | Cursor project rules (from AGENTS.md + prompts) |
| **Cursor Skills** | [`.cursor/skills/`](../.cursor/skills/) | Cursor agent skills (from `.github/skills/`) |
| **GitHub Copilot** | [`.github/copilot-instructions.md`](copilot-instructions.md) | GitHub Copilot-specific instructions |
| **TRAE** | [`.trae/rules/project_rules.md`](../.trae/rules/project_rules.md) | TRAE AI assistant rules |
| **Skills Library** | [`.github/skills/`](skills/) | Reusable skill modules (also in `.cursor/skills/`) |
| **Prompts Library** | [`.github/prompts/`](prompts/) | Reusable prompt templates (migrated to `.cursor/rules/`) |
| **Agent Configs** | [`.github/agents/`](agents/) | Specific agent configurations |
| **Basic Instructions** | [`.github/instructions/`](instructions/) | Foundational instructions |

## 📋 Configuration Hierarchy

```
┌─────────────────────────────────────────┐
│         AGENTS.md (Universal)           │  ← Source of Truth
│   All AI agents should reference this   │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌───────────────┐ ┌───────────────────┐ ┌───────────────────┐
│ .github/      │ │ .cursor/          │ │ .trae/rules/      │
│ copilot-      │ │ rules/ (15 rules) │ │ project_rules.md  │
│ instructions  │ │ skills/ (19)      │ │                   │
│ .md           │ │                   │ │ (TRAE-specific    │
│               │ │ (Cursor-specific  │ │  adaptations)     │
│ (Concise)     │ │  adaptation)      │ │ (Detailed)        │
└───────────────┘ └───────────────────┘ └───────────────────┘
```

## 🎯 File Purposes

### 1. Universal Configuration

#### `AGENTS.md`
- **Purpose**: Universal AI agent instructions following AGENTS.md standard
- **Audience**: All AI coding assistants
- **Style**: Balanced detail, portable format
- **Maintained By**: Project team
- **Update Frequency**: On major architecture changes
- **Key Sections**:
  - Project overview
  - Architecture
  - Code conventions
  - Development workflows
  - Common pitfalls

### 2. Cursor Configuration

#### `.cursor/rules/`
- **Purpose**: Cursor project rules
- **Audience**: Cursor AI agent
- **Style**: Focused, domain-specific with frontmatter metadata
- **Sources**: AGENTS.md (4 domain rules) + `.github/prompts/` (11 agent-decided rules)
- **Files (from AGENTS.md)**:
  - `architecture.mdc` - Always applied; stack, data flow, key files
  - `conventions.mdc` - Auto-attached to `src/**`; code style, naming, patterns
  - `database.mdc` - Auto-attached to `prisma/**`; Prisma + Neon patterns
  - `authentication.mdc` - Auto-attached to `src/lib/auth-*`; JWT auth system
- **Files (from prompts)**:
  - `pr-create.mdc`, `pr-squash-merge.mdc`, `chrome-devtools.mdc`, `playwright-explore.mdc`, `memory-keeper.mdc`, `memory-merger.mdc`, `init-master.mdc`, `sync-trae-rules.mdc`, `my-issues.mdc`, `neon-mcp-database.mdc`, `bar-vscode.mdc`

#### `.cursor/skills/`
- **Purpose**: Cursor agent skills (migrated from `.github/skills/`)
- **Audience**: Cursor AI agent
- **Files**: 19 skills (all from `.github/skills/`)
- **All agent-decided** (auto-invoked by context relevance)
- **Index**: See [`.cursor/README.md`](../.cursor/README.md)

### 3. GitHub Copilot

#### `.github/copilot-instructions.md`
- **Purpose**: GitHub Copilot-specific instructions
- **Audience**: GitHub Copilot
- **Style**: Concise bullet points
- **Maintained By**: Developers
- **Update Frequency**: As needed
- **Key Sections**:
  - Stack overview
  - Critical patterns
  - Architecture diagrams
  - Best practices

#### `.github/skills/`
- **Purpose**: Modular skill-based instructions
- **Files**: 20+ specialized skills
- **Examples**:
  - `nextjs-ddd-architect/` - Domain-driven design patterns
  - `prisma-nextjs16/` - Database patterns
  - `server-actions-patterns/` - Server action best practices
  - `performance-optimization/` - Performance patterns
  - `testing-automation/` - Testing strategies

#### `.github/prompts/`
- **Purpose**: Reusable prompt templates
- **Files**: 11 prompt templates
- **Examples**:
  - `init-master.prompt.md` - Project initialization
  - `pr-create.prompt.md` - Pull request creation
  - `sync-trae-rules.prompt.md` - TRAE sync process
  - `remember.prompt.md` - Context persistence

#### `.github/agents/`
- **Purpose**: Agent-specific configurations
- **Files**: Custom agent setups
- **Examples**:
  - `gemini-3-f-think.agent.md` - Gemini agent config

#### `.github/instructions/`
- **Purpose**: Foundational instructions
- **Files**: Basic instruction sets
- **Examples**:
  - `basic.instructions.md` - Core instructions

### 3. TRAE Configuration

#### `.trae/rules/project_rules.md`
- **Purpose**: TRAE AI assistant project rules
- **Audience**: TRAE
- **Style**: Detailed explanations with code examples
- **Maintained By**: Synced from `.github/`, enhanced for TRAE
- **Update Frequency**: Monthly sync + as needed
- **Key Sections**:
  - Expanded code examples
  - Rationale for patterns
  - Good vs bad examples
  - TRAE-specific debugging tips

#### `.trae/rules/SYNC_LOG.md`
- **Purpose**: Track synchronization history
- **Content**: Sync dates, changes, validation results

#### `.trae/rules/QUICK_SYNC.md`
- **Purpose**: Quick reference for manual sync
- **Content**: Checklists, commands, links

#### `.trae/rules/README.md`
- **Purpose**: TRAE rules directory overview
- **Content**: Sync process, documentation links, validation

#### `.trae/scripts/sync-rules.ts`
- **Purpose**: Automated sync script
- **Usage**: `pnpm dlx tsx .trae/scripts/sync-rules.ts`
- **Features**: 
  - Auto-sync from `.github/` to `.trae/`
  - Documentation update checking
  - Validation
  - Dry-run mode

## 🔄 Synchronization Strategy

### Primary Sync Flow

```
.github/copilot-instructions.md (Source)
            ↓
    [Automated Sync Script]
            ↓
.trae/rules/project_rules.md (Target)
            ↓
    [Enhanced with TRAE-specific content]
```

### Sync Methods

1. **Automated**: `pnpm dlx tsx .trae/scripts/sync-rules.ts`
2. **Manual**: Follow `.github/prompts/sync-trae-rules.prompt.md`
3. **Quick**: Follow `.trae/rules/QUICK_SYNC.md`

### Sync Frequency

- **Weekly**: Check changelogs for updates
- **Monthly**: Full automated sync
- **Quarterly**: Deep manual review
- **On PR**: If `.github/copilot-instructions.md` changes
- **On Breaking Changes**: Immediate sync

## 📚 Documentation Resources

### TRAE
- Docs: https://docs.trae.ai/
- Rules Schema: https://docs.trae.ai/rules/schema
- Project Rules: https://docs.trae.ai/rules/project-rules
- Changelog: https://docs.trae.ai/changelog
- GitHub: https://github.com/TRAE-AI/trae
- Issues: https://github.com/TRAE-AI/trae/issues

### GitHub Copilot
- Docs: https://docs.github.com/en/copilot
- Custom Instructions: https://docs.github.com/en/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot
- Changelog: https://github.blog/changelog/tag/copilot/
- Best Practices: https://github.blog/changelog/2024-04-09-copilot-instructions/

### AGENTS.md Standard
- Spec: https://github.com/agentic-ai-foundation/agents-md
- Examples: https://github.com/agentic-ai-foundation/agents-md/tree/main/examples
- Schema: https://github.com/agentic-ai-foundation/agents-md/blob/main/schema.md

## 🎓 Usage Guidelines

### For Developers

1. **Starting a new feature?**
   - Read `AGENTS.md` for universal patterns
   - Check `.github/copilot-instructions.md` for Copilot specifics
   - Review relevant skills in `.github/skills/`

2. **Updating project conventions?**
   - Update `AGENTS.md` first (universal truth)
   - Update `.github/copilot-instructions.md`
   - Run sync script to update `.trae/rules/`
   - Update relevant skills if applicable

3. **Adding new patterns?**
   - Document in `AGENTS.md`
   - Add to `.github/copilot-instructions.md`
   - Create skill in `.github/skills/` if reusable
   - Sync to TRAE

### For AI Agents

1. **First time in project?**
   - Start with `AGENTS.md`
   - Check agent-specific config (`.github/` or `.trae/`)
   - Review relevant skills

2. **Need specific guidance?**
   - Search `.github/skills/` for specialized patterns
   - Check `.github/prompts/` for task templates

3. **Implementing features?**
   - Follow patterns in agent-specific config
   - Reference code examples
   - Check common pitfalls section

## 🔍 Finding Information

### By Topic

| Topic | Primary Location | Secondary Location |
|-------|------------------|-------------------|
| Architecture | `AGENTS.md` | `.github/copilot-instructions.md` |
| Authentication | `AGENTS.md` → Auth section | `.trae/rules/project_rules.md` |
| Caching | `AGENTS.md` → Caching | `.github/skills/nextjs16-proxy-middleware/` |
| Database | `AGENTS.md` → Database | `.github/skills/prisma-nextjs16/` |
| Testing | `.github/skills/testing-automation/` | `.trae/rules/project_rules.md` |
| Deployment | `AGENTS.md` → Deployment | `.github/skills/vercel-cli-management/` |
| Code Review | `.github/skills/code-review/` | - |
| Performance | `.github/skills/performance-optimization/` | `AGENTS.md` → Performance |

### By Task

| Task | Use This |
|------|----------|
| Initialize project understanding | `AGENTS.md` |
| Create PR | `.github/prompts/pr-create.prompt.md` |
| Optimize performance | `.github/skills/performance-optimization/` |
| Set up testing | `.github/skills/testing-automation/` |
| Database migration | `.github/skills/prisma-nextjs16/` + `.github/skills/neon-database-management/` |
| Sync configs | `.github/prompts/sync-trae-rules.prompt.md` |

## 🛠️ Maintenance

### Regular Tasks

- [ ] **Weekly**: Check TRAE/Copilot changelogs
- [ ] **Monthly**: Run sync script
- [ ] **Quarterly**: Review all configs for drift
- [ ] **On Stack Update**: Update all configs with new versions
- [ ] **On Pattern Change**: Update AGENTS.md → sync to others

### Validation

```bash
# Check for config drift
diff .github/copilot-instructions.md .trae/rules/project_rules.md

# Validate TRAE schema
pnpm dlx tsx .trae/scripts/sync-rules.ts --check-docs

# Check for missing sections
grep -E "^## " AGENTS.md > /tmp/sections.txt
grep -E "^## " .github/copilot-instructions.md >> /tmp/sections.txt
sort /tmp/sections.txt | uniq -c
```

### Update Checklist

When updating any configuration:

- [ ] Identify impact (universal vs agent-specific)
- [ ] Update `AGENTS.md` if universal
- [ ] Update `.github/copilot-instructions.md` if Copilot-specific
- [ ] Run sync script for TRAE
- [ ] Update relevant skills
- [ ] Test with actual AI agent
- [ ] Update this index if structure changed

## 📊 Configuration Matrix

| Feature | AGENTS.md | .github/copilot | .cursor/ | .trae/rules |
|---------|-----------|-----------------|----------|-------------|
| **Detail Level** | Medium | Low | Medium | High |
| **Code Examples** | Some | Minimal | Some | Extensive |
| **Rationale** | Sometimes | Rarely | Sometimes | Always |
| **Anti-patterns** | Some | No | Some | Yes |
| **Agent-specific** | No | Copilot | Cursor | TRAE |
| **Portable** | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Skills Support** | No | Via .github/skills | Via .cursor/skills | No |

## 🚀 Quick Start

### For New AI Agent Setup

1. Read `AGENTS.md` completely
2. Determine which agent you are (Copilot/TRAE/Other)
3. Read agent-specific config
4. Review relevant skills
5. Start coding!

### For Config Updates

1. Update `AGENTS.md` (if universal)
2. Update `.github/copilot-instructions.md` (if Copilot)
3. Run: `pnpm dlx tsx .trae/scripts/sync-rules.ts`
4. Verify sync in `SYNC_LOG.md`

### For New Patterns

1. Document in appropriate skill or main config
2. Add code examples
3. Test with AI agent
4. Update cross-references

## 📞 Support

- **TRAE Issues**: https://github.com/TRAE-AI/trae/issues
- **GitHub Copilot**: https://support.github.com/
- **AGENTS.md Spec**: https://github.com/agentic-ai-foundation/agents-md/issues

---

**Last Updated**: 2024-01-15  
**Maintained By**: Project Team  
**Schema Versions**: TRAE v1.2.0, AGENTS.md v1.0.0