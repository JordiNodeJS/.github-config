# Universal Agents Directory

This directory follows the **Universal Agents** proposal for structured agent configuration, extending the AGENTS.md standard.

## Purpose

The `.agents/` directory provides a modular, organized structure for AI agent instructions, complementing the root `AGENTS.md` file. This approach enables:

- **Granular organization** of rules by functional domain
- **Scalability** for monorepositorios with multiple subprojects
- **Modularity** for skill-based agent capabilities
- **Compatibility** with multiple AI coding assistants

## Structure

```
.agents/
├── README.md           # This file
├── rules/              # Project-specific rules organized by domain
│   ├── architecture.md
│   ├── authentication.md
│   ├── caching.md
│   ├── database.md
│   ├── styling.md
│   └── api-integration.md
└── skills/             # Reusable skills and capabilities
    ├── debug-server-action.md
    ├── create-new-page.md
    └── setup-prisma-model.md
```

## Directory Breakdown

### `/rules/` - Domain-Specific Rules

Contains focused, domain-specific guidelines that agents should follow when working on particular aspects of the project.

**Guidelines for rules:**
- Each file covers a single domain (auth, database, styling, etc.)
- Include concrete examples and patterns
- Reference key files and their locations
- Specify common pitfalls to avoid

### `/skills/` - Reusable Capabilities

Contains step-by-step procedures for common development tasks that agents can execute.

**Guidelines for skills:**
- Provide executable step-by-step instructions
- Include code examples and commands
- Specify prerequisites and dependencies
- Define success criteria

## Usage

### For AI Agents

Most modern AI coding assistants will automatically detect and load files from `.agents/` when working in this project. Agents should:

1. Load `AGENTS.md` for project overview
2. Load relevant files from `.agents/rules/` based on the task domain
3. Use `.agents/skills/` for guided workflows

### Manual Loading (for agents without native support)

If your AI agent doesn't automatically load `.agents/` files:

```
"Load the following agent configuration files:
- AGENTS.md
- .agents/rules/[relevant-domain].md
- .agents/skills/[task-name].md"
```

## Compatibility

### Agents with Native Support
- GitHub Copilot (via workspace indexing)
- Cursor (via custom rules detection)
- Zed (via project context)
- Aider (via context files)

### Agents Requiring Manual Loading
- TRAE (use `.trae/rules/project_rules.md`)
- Windsurf (use `.windsurfrules`)
- Cline (use `.clinerules`)

## Relationship to Other Configurations

This project maintains multiple agent configurations for compatibility:

- **`AGENTS.md`** (root) - Universal standard, main source of truth
- **`.agents/`** (this directory) - Modular extension of AGENTS.md
- **`.trae/`** - TRAE-specific format
- **`.github/copilot-instructions.md`** - GitHub Copilot format
- **`.opencode/`** - OpenCode format (future)

All configurations should remain synchronized. When updating rules:
1. Update `AGENTS.md` first (source of truth)
2. Update modular rules in `.agents/rules/`
3. Sync to agent-specific formats (`.trae/`, `.github/`, etc.)

## Contributing

When adding new rules or skills:

1. **Rules**: Create focused, single-domain files in `.agents/rules/`
2. **Skills**: Create actionable, step-by-step guides in `.agents/skills/`
3. **Naming**: Use `kebab-case.md` for filenames
4. **Content**: Include examples, references, and anti-patterns

## References

- [AGENTS.md Standard](https://github.com/agentsmd/agents.md) - Official specification
- [Universal Agents Proposal](https://github.com/agentsmd/agents.md/issues/9) - Directory support discussion
- [Agentic AI Foundation](https://www.linuxfoundation.org/) - Standards stewardship

---

**Note**: This structure is based on the Universal Agents proposal and aims to provide a standardized approach to modular agent configuration across different AI coding tools.