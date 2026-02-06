# Cursor AI Configuration

This directory contains Cursor-specific AI rules and skills migrated from `.github/prompts/`, `.github/skills/`, and `AGENTS.md`.

## Structure

```
.cursor/
├── rules/                        # Project rules (persistent guidance)
│   ├── architecture.mdc          # [AGENTS.md] Stack, data flow, key files, deployment
│   ├── authentication.mdc        # [AGENTS.md] JWT auth, sessions, password security
│   ├── conventions.mdc           # [AGENTS.md] Code style, naming, caching, i18n
│   ├── database.mdc              # [AGENTS.md] Prisma ORM + Neon patterns
│   ├── bar-vscode.mdc            # [prompt] VS Code status bar config
│   ├── chrome-devtools.mdc       # [prompt] Chrome DevTools debugging
│   ├── init-master.mdc           # [prompt] Project initialization
│   ├── memory-keeper.mdc         # [prompt] /remember domain-organized memory
│   ├── memory-merger.mdc         # [prompt] Merge memory into instructions
│   ├── my-issues.mdc             # [prompt] List assigned GitHub issues
│   ├── neon-mcp-database.mdc     # [prompt] Neon MCP database operations
│   ├── playwright-explore.mdc    # [prompt] Website exploration for testing
│   ├── pr-create.mdc             # [prompt] Create/update PRs with gh CLI
│   ├── pr-squash-merge.mdc       # [prompt] Squash merge PRs with cleanup
│   └── sync-trae-rules.mdc       # [prompt] Sync rules to TRAE format
│
├── skills/                       # Agent skills (from .github/skills/)
│   ├── clean-architecture-frontend/
│   ├── code-review/
│   ├── component-development/
│   ├── e2e-production/
│   ├── github-pull-request/
│   ├── neon-database-management/
│   ├── nextjs-ddd-architect/
│   ├── nextjs16-proxy-middleware/
│   ├── notion-management/
│   ├── performance-optimization/
│   ├── prisma-nextjs16/
│   ├── server-actions-patterns/
│   ├── skill-creator/
│   ├── sonarqube-best-practices/
│   ├── testing-automation/
│   ├── vercel-cli-management/
│   ├── vercel-env-sync/
│   ├── webapp-testing/
│   └── windows-symlinks/
│
└── README.md                     # This file
```

## Rules (15 total)

Rules are `.mdc` files in `.cursor/rules/` with YAML frontmatter. Cursor applies them based on their trigger type.

### Always Applied (from AGENTS.md)

| Rule | Description |
|------|-------------|
| `architecture.mdc` | Project stack, architecture, data flow, key files |

### Auto-Attached by file pattern (from AGENTS.md)

| Rule | Globs | Description |
|------|-------|-------------|
| `conventions.mdc` | `src/**/*.{ts,tsx,js,jsx}` | Code style, naming, caching, i18n |
| `database.mdc` | `prisma/**, src/lib/prisma.ts, ...` | Prisma ORM + Neon patterns |
| `authentication.mdc` | `src/lib/auth-*.ts, ...` | JWT auth, sessions, security |

### Agent-Decided (from .github/prompts/)

| Rule | Triggers when... |
|------|-------------------|
| `pr-create.mdc` | User wants to create or update a PR |
| `pr-squash-merge.mdc` | User wants to squash merge a PR |
| `chrome-devtools.mdc` | Debugging UI, inspecting runtime errors |
| `playwright-explore.mdc` | Exploring a website for testing |
| `memory-keeper.mdc` | User says `/remember` to save a lesson |
| `memory-merger.mdc` | User says `/memory-merger` to consolidate |
| `init-master.mdc` | Initializing the project from scratch |
| `sync-trae-rules.mdc` | Syncing configs to TRAE format |
| `my-issues.mdc` | User asks for assigned issues |
| `neon-mcp-database.mdc` | Database operations via Neon MCP |
| `bar-vscode.mdc` | Customizing VS Code status bar |

## Skills (19 total)

Skills are in `.cursor/skills/<name>/SKILL.md`. Cursor automatically discovers them and applies when relevant based on their `description`.

All skills are agent-decided (Cursor chooses when they are relevant).

## Migration Reference

| Original Location | Cursor Location | Type |
|---|---|---|
| `AGENTS.md` | `.cursor/rules/*.mdc` | Rules (split by domain) |
| `.github/prompts/*.prompt.md` | `.cursor/rules/*.mdc` | Rules (agent-decided) |
| `.github/skills/*/SKILL.md` | `.cursor/skills/*/SKILL.md` | Skills (agent-decided) |

## Source of Truth

- `AGENTS.md` remains the universal source of truth for all AI agents
- `.cursor/rules/` provides Cursor-specific adaptations
- `.cursor/skills/` mirrors `.github/skills/` for Cursor compatibility
- `.github/` configurations remain for GitHub Copilot compatibility
