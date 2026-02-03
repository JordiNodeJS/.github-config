# Multi-Agent Configuration System

This repository uses a **universal configuration system** for AI coding assistants, ensuring compatibility across multiple agents while maintaining a single source of truth.

## Overview

The Movies Tracker project supports multiple AI coding assistants through a unified configuration approach based on the AGENTS.md standard, with agent-specific extensions for compatibility.

## Configuration Files Structure

```
.
├── AGENTS.md                           # ✅ Main configuration (source of truth)
├── .agents/                            # ✅ Universal Agents modular structure
│   ├── README.md
│   ├── rules/                          # Domain-specific rules
│   │   ├── architecture.md
│   │   ├── authentication.md
│   │   ├── database.md
│   │   ├── caching.md
│   │   └── styling.md
│   └── skills/                         # Step-by-step guides
│       └── create-new-page.md
├── .trae/                              # TRAE-specific format
│   └── rules/
│       └── project_rules.md
├── .github/                            # GitHub Copilot format
│   └── copilot-instructions.md
└── .opencode/                          # OpenCode format
    └── project-rules.md
```

## Agent Compatibility Matrix

| Agent | Configuration File | Native Support | Notes |
|-------|-------------------|----------------|-------|
| **GitHub Copilot** | `.github/copilot-instructions.md` | ✅ Yes | Also reads `AGENTS.md` |
| **Cursor** | `AGENTS.md` | ✅ Yes | Dual support with `.cursor/` |
| **TRAE** | `.trae/rules/project_rules.md` | ⚠️ Partial | Use Ruler for sync |
| **OpenCode** | `.opencode/project-rules.md` | ⚠️ Partial | Manual sync |
| **Zed** | `AGENTS.md` | ✅ Yes | Via project context |
| **Aider** | `AGENTS.md` | ✅ Yes | Via context files |
| **Windsurf** | `AGENTS.md` | ✅ Yes | Native support |
| **Cline** | `AGENTS.md` | ✅ Yes | Native support |

## Usage by Agent

### For GitHub Copilot Users

GitHub Copilot automatically reads:
1. `.github/copilot-instructions.md` (primary)
2. `AGENTS.md` (fallback)

No additional setup required.

### For Cursor Users

Cursor automatically reads:
1. `AGENTS.md` (recommended)
2. `.cursor/rules/` (legacy)

No additional setup required.

### For TRAE Users

TRAE reads `.trae/rules/project_rules.md`. 

**Option 1: Use TRAE configuration directly**
- Configuration is already set up in `.trae/rules/project_rules.md`

**Option 2: Sync from AGENTS.md using Ruler**
```bash
# Install Ruler
npm install -g @ruler/cli

# Sync from AGENTS.md to TRAE format
ruler apply --agents trae
```

### For Other Agents

Most modern agents support `AGENTS.md` natively. If your agent doesn't:

1. **Manual Loading**: Reference the files manually:
   ```
   "Load the following configuration files:
   - AGENTS.md
   - .agents/rules/[relevant-domain].md"
   ```

2. **Use Ruler**: Sync to agent-specific format:
   ```bash
   ruler apply --agents your-agent
   ```

## The AGENTS.md Standard

`AGENTS.md` is an open standard for AI agent configuration maintained by the **Agentic AI Foundation** under the Linux Foundation.

### Benefits

- ✅ **Single Source of Truth**: Maintain one configuration
- ✅ **Cross-Agent Compatibility**: Works with multiple tools
- ✅ **Open Standard**: Community-driven, not vendor-locked
- ✅ **Version Controlled**: Track configuration changes over time
- ✅ **Discoverable**: Standard location in project root

### Specification

- **Location**: `AGENTS.md` in project root
- **Format**: Markdown with structured sections
- **Content**: Project overview, commands, conventions, architecture
- **Standard**: https://github.com/agentsmd/agents.md

## Universal Agents Structure (.agents/)

The `.agents/` directory provides modular organization of rules and skills.

### Rules

Domain-specific guidelines in `.agents/rules/`:
- `architecture.md` - Architectural patterns
- `authentication.md` - Auth implementation
- `database.md` - Database and Prisma usage
- `caching.md` - Caching strategies
- `styling.md` - Tailwind CSS and design system

### Skills

Step-by-step guides in `.agents/skills/`:
- `create-new-page.md` - Creating new pages in Next.js

### Benefits

- **Modularity**: Load only relevant rules for the task
- **Scalability**: Easy to add new domains
- **Organization**: Clearer than monolithic file
- **Reusability**: Skills can be shared across projects

## Synchronization Strategy

### Primary Workflow (Recommended)

1. **Edit** `AGENTS.md` as the source of truth
2. **Update** modular rules in `.agents/rules/` for granular changes
3. **Sync** to agent-specific formats (`.trae/`, `.opencode/`, etc.)

### Using Ruler for Synchronization

Ruler is a tool for managing multi-agent configurations:

```bash
# Install
npm install -g @ruler/cli

# Initialize (if starting fresh)
ruler init

# Sync to all supported agents
ruler apply --all

# Sync to specific agent
ruler apply --agents trae
ruler apply --agents cursor

# Verify consistency
ruler check
```

### Manual Synchronization

If not using Ruler, manually update:
1. `AGENTS.md` (main)
2. `.agents/rules/*.md` (modular)
3. `.trae/rules/project_rules.md` (TRAE)
4. `.github/copilot-instructions.md` (GitHub Copilot)
5. `.opencode/project-rules.md` (OpenCode)

**Tip**: Use a checklist when making changes to ensure all files are updated.

## Making Changes

### Adding New Rules

1. **Update** `AGENTS.md` with new section
2. **Create** new file in `.agents/rules/[domain].md` if needed
3. **Sync** to agent-specific formats
4. **Test** with your AI agent

### Updating Existing Rules

1. **Edit** relevant section in `AGENTS.md`
2. **Update** corresponding `.agents/rules/[domain].md`
3. **Sync** to agent-specific formats
4. **Commit** all changes together

### Best Practices

- ✅ Keep `AGENTS.md` as the authoritative source
- ✅ Maintain consistency across all formats
- ✅ Include concrete examples in rules
- ✅ Document common pitfalls
- ✅ Version control all configuration files
- ✅ Test changes with your primary AI agent

## Migration Guide

### From Agent-Specific to Universal

If you're starting with agent-specific configs:

1. **Create** `AGENTS.md` from most complete config
2. **Extract** domain-specific rules to `.agents/rules/`
3. **Generate** agent-specific formats from `AGENTS.md`
4. **Test** with each agent
5. **Remove** old redundant configs (optional)

### To New Agent

When adding support for a new agent:

1. **Check** if agent supports `AGENTS.md` natively
2. **If yes**: No additional setup needed
3. **If no**: Create agent-specific format or use Ruler

## Troubleshooting

### Agent Not Following Rules

1. **Verify** agent supports configuration format
2. **Check** file location and naming
3. **Confirm** file is committed to repository
4. **Try** explicitly referencing the file in your prompt

### Inconsistent Behavior

1. **Audit** all configuration files for inconsistencies
2. **Run** `ruler check` if using Ruler
3. **Update** all files to match `AGENTS.md`
4. **Test** each agent individually

### Configuration Not Loading

1. **Check** file syntax (valid Markdown)
2. **Verify** file permissions
3. **Ensure** files are committed (not gitignored)
4. **Restart** your IDE/agent

## Additional Resources

### Documentation

- **AGENTS.md Standard**: https://github.com/agentsmd/agents.md
- **Agentic AI Foundation**: https://www.linuxfoundation.org/
- **Ruler CLI**: https://github.com/ruler-ai/ruler
- **Universal Agents Proposal**: https://github.com/agentsmd/agents.md/issues/9

### Community

- **Discussions**: AGENTS.md GitHub Discussions
- **Issues**: Report agent compatibility issues
- **Contributing**: Submit improvements to configurations

## Project-Specific Notes

### Movies Tracker Configuration

This project uses:
- **Next.js 16** with App Router
- **Prisma ORM** with Neon Serverless Postgres
- **TMDB API** for movie data
- **Tailwind CSS 4** for styling
- **JWT authentication** with httpOnly cookies

### Key Conventions

1. **Server-first**: Default to Server Components
2. **Cache everything**: Use `"use cache"` directive for TMDB
3. **Authentication**: Always use `ensureUser()` in Server Actions
4. **Denormalization**: Store movie data locally for performance
5. **Tailwind only**: No inline styles or CSS modules

## Version History

- **v1.0.0** (2025-01-20): Initial multi-agent configuration
  - Created AGENTS.md as source of truth
  - Added Universal Agents structure (.agents/)
  - Configured TRAE, GitHub Copilot, and OpenCode formats
  - Implemented modular rules by domain

## Contributing

When contributing to this project's AI agent configuration:

1. **Update** `AGENTS.md` first
2. **Sync** to all agent-specific formats
3. **Test** with at least one AI agent
4. **Document** changes in commit message
5. **Submit** PR with all configuration files

---

**Maintained by**: Movies Tracker Team  
**Standard**: AGENTS.md v1.0  
**Last Updated**: 2025-01-20