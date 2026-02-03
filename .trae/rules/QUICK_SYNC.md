# Quick TRAE Sync Guide

Fast reference for syncing `.github` rules to `.trae/rules/` following TRAE conventions.

## TL;DR Commands

```bash
# 1. Check for updates
open https://docs.trae.ai/changelog
open https://docs.github.com/en/copilot/changelog

# 2. Run sync (if automated)
pnpm dlx tsx .trae/scripts/sync-rules.ts

# 3. Validate
diff .github/copilot-instructions.md .trae/rules/project_rules.md
```

## Quick Checklist

Before syncing:
- [ ] Check [TRAE docs](https://docs.trae.ai/rules/project-rules) for schema changes
- [ ] Check [GitHub Copilot docs](https://docs.github.com/en/copilot) for new features
- [ ] Read `.github/copilot-instructions.md`

During sync:
- [ ] Copy all sections from `.github/` → `.trae/rules/`
- [ ] Expand concise bullets into detailed explanations
- [ ] Add code examples for every pattern
- [ ] Add "Rationale" for non-obvious rules
- [ ] Add TRAE-specific debugging tips

After sync:
- [ ] Test all code examples
- [ ] Update cross-references
- [ ] Update `SYNC_LOG.md`
- [ ] Verify TRAE schema compliance

## Key Adaptation Rules

### 1. Expand Instructions

```markdown
# FROM .github (concise)
- Use cuid() for IDs

# TO .trae (detailed)
## ID Generation

Use `cuid()` for all user-related models:

```typescript
import { cuid } from "@/lib/utils";

const user = await prisma.user.create({
  data: {
    id: cuid(),
    email: "user@example.com"
  }
});
```

**Rationale**: cuid() provides collision-resistant IDs suitable for distributed systems.
**Avoid**: Auto-increment IDs in user-facing tables.
```

### 2. Show Good vs Bad

```markdown
### Example Pattern

// ✅ Good: Select only needed fields
const movies = await prisma.movie.findMany({
  select: { id: true, title: true }
});

// ❌ Bad: Fetching all fields
const movies = await prisma.movie.findMany();
```

### 3. Add TRAE Context

```markdown
## Getting Started for TRAE

When TRAE first encounters this project:
1. Review the architecture diagram
2. Examine `src/lib/` for core patterns
3. Check `prisma/schema.prisma` for data model
4. Use Server Actions for all mutations
5. Test with mock TMDB data if token unavailable
```

## Documentation Links

### TRAE Official
- Docs: https://docs.trae.ai/
- Rules Schema: https://docs.trae.ai/rules/schema
- Best Practices: https://docs.trae.ai/rules/best-practices
- Changelog: https://docs.trae.ai/changelog
- GitHub: https://github.com/TRAE-AI/trae
- Issue Tracker: https://github.com/TRAE-AI/trae/issues

### GitHub Copilot
- Docs: https://docs.github.com/en/copilot
- Custom Instructions: https://docs.github.com/en/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot
- Changelog: https://github.blog/changelog/tag/copilot/
- Best Practices: https://github.blog/changelog/2024-04-09-copilot-instructions/

### AGENTS.md Standard
- Spec: https://github.com/agentic-ai-foundation/agents-md
- Examples: https://github.com/agentic-ai-foundation/agents-md/tree/main/examples

## File Locations

```
GITHUB config/
├── .github/
│   ├── copilot-instructions.md       # Source
│   ├── skills/                       # Optional source
│   └── prompts/sync-trae-rules.prompt.md  # Detailed sync guide
│
├── .trae/
│   └── rules/
│       ├── project_rules.md          # Target (main)
│       ├── SYNC_LOG.md              # Sync history
│       ├── QUICK_SYNC.md            # This file
│       └── README.md                # Directory overview
│
└── AGENTS.md                         # Universal standard
```

## Common Issues

### Schema Mismatch
**Problem**: TRAE schema changed, old format not recognized
**Solution**: Check https://docs.trae.ai/rules/schema for latest version

### Conflicting Instructions
**Problem**: `.github/` and TRAE docs recommend different approaches
**Solution**: Document both, prefer TRAE approach in `.trae/`, note compatibility

### Missing Examples
**Problem**: TRAE can't understand abstract rules
**Solution**: Add executable code example for every rule

### Outdated Dependencies
**Problem**: Examples use old package versions
**Solution**: Verify against `package.json`, update examples

## Quick Sync Script

Save as `.trae/scripts/sync-rules.ts`:

```typescript
#!/usr/bin/env tsx

/**
 * Quick sync from .github to .trae/rules
 * Usage: pnpm dlx tsx .trae/scripts/sync-rules.ts
 */

import fs from 'fs/promises';
import path from 'path';

async function sync() {
  console.log('🔄 Syncing .github → .trae/rules...');
  
  // Read source
  const source = await fs.readFile('.github/copilot-instructions.md', 'utf-8');
  
  // Transform (add your adaptation logic)
  const adapted = source; // TODO: Add expansion logic
  
  // Write target
  await fs.writeFile('.trae/rules/project_rules.md', adapted);
  
  // Log sync
  const log = `\n## ${new Date().toISOString().split('T')[0]} - Auto Sync\n`;
  await fs.appendFile('.trae/rules/SYNC_LOG.md', log);
  
  console.log('✅ Sync complete!');
}

sync();
```

## Version Metadata Template

Add to top of `project_rules.md`:

```markdown
---
trae_schema_version: "1.2.0"
last_synced: "2024-01-15"
synced_from: ".github/copilot-instructions.md"
official_docs: "https://docs.trae.ai/rules/project-rules"
github_copilot_version: "1.156.0"
---
```

## When to Sync

- ✅ **Immediate**: Breaking changes in TRAE/GitHub Copilot
- ✅ **Weekly**: Check changelogs for updates
- ✅ **Monthly**: Full content sync
- ✅ **Quarterly**: Deep documentation review
- ✅ **On PR**: If `.github/copilot-instructions.md` changed

## Validation Commands

```bash
# Check schema compliance (requires TRAE CLI)
trae validate .trae/rules/project_rules.md

# Check for missing sections
grep -E "^## " .github/copilot-instructions.md > /tmp/github-sections.txt
grep -E "^## " .trae/rules/project_rules.md > /tmp/trae-sections.txt
diff /tmp/github-sections.txt /tmp/trae-sections.txt

# Check for outdated examples
grep -r "Next.js 15" .trae/  # Should be 16
grep -r "pnpm@9" .trae/      # Should be 10+

# Verify code blocks
grep -c '```typescript' .trae/rules/project_rules.md
```

## Success Indicators

✅ Every rule has a code example
✅ Every pattern shows good vs bad
✅ TRAE-specific sections present
✅ Cross-references to AGENTS.md
✅ No schema validation errors
✅ All file paths exist
✅ All commands are executable

## For Full Details

See: `.github/prompts/sync-trae-rules.prompt.md`

---

**Last Updated**: 2024-01-15
**TRAE Schema**: v1.2.0
**Next Sync**: 2024-02-15