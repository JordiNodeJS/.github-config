# TRAE Rules Directory

This directory contains TRAE-specific project rules and conventions, synchronized from `.github/copilot-instructions.md` and adapted for TRAE's AI coding assistant.

## 📁 Files

- **`project_rules.md`** - Main TRAE project rules (synced from `.github/copilot-instructions.md`)
- **`SYNC_LOG.md`** - Synchronization history and changelog
- **`QUICK_SYNC.md`** - Quick reference guide for manual syncing
- **`README.md`** - This file

## 🔄 Sync Process

Rules are periodically synchronized from `.github/` using:

### Automated Sync

```bash
# Run the sync script
pnpm dlx tsx .trae/scripts/sync-rules.ts

# Check for documentation updates first
pnpm dlx tsx .trae/scripts/sync-rules.ts --check-docs

# Preview changes without applying
pnpm dlx tsx .trae/scripts/sync-rules.ts --dry-run
```

### Manual Sync

Use the comprehensive prompt:
```bash
# Reference: .github/prompts/sync-trae-rules.prompt.md
```

Or follow the quick guide:
```bash
# Reference: .trae/rules/QUICK_SYNC.md
```

## 📚 Official Documentation

### TRAE Resources

- **Official Docs**: https://docs.trae.ai/
- **Rule Schema**: https://docs.trae.ai/rules/schema
- **Project Rules Guide**: https://docs.trae.ai/rules/project-rules
- **Best Practices**: https://docs.trae.ai/rules/best-practices
- **Changelog**: https://docs.trae.ai/changelog
- **GitHub Repository**: https://github.com/TRAE-AI/trae
- **Issue Tracker**: https://github.com/TRAE-AI/trae/issues
- **Feature Requests**: https://github.com/TRAE-AI/trae/discussions

### GitHub Copilot Resources

- **Official Docs**: https://docs.github.com/en/copilot
- **Custom Instructions**: https://docs.github.com/en/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot
- **Changelog**: https://github.blog/changelog/tag/copilot/
- **Best Practices Blog**: https://github.blog/changelog/2024-04-09-copilot-instructions/

### AGENTS.md Standard

- **Specification**: https://github.com/agentic-ai-foundation/agents-md
- **Examples**: https://github.com/agentic-ai-foundation/agents-md/tree/main/examples
- **Schema**: https://github.com/agentic-ai-foundation/agents-md/blob/main/schema.md

## 🎯 TRAE vs GitHub Copilot

### Key Differences

| Aspect | GitHub Copilot | TRAE |
|--------|---------------|------|
| **Format** | Concise bullet points | Detailed explanations with examples |
| **Context** | Assumes developer knowledge | Provides full context for AI |
| **Examples** | Minimal | Extensive code examples |
| **Patterns** | Implicit | Explicit good vs bad patterns |
| **Structure** | Flexible | Follows strict schema |

### Adaptation Strategy

When syncing from `.github/` to `.trae/`:

1. **Expand Instructions**: Convert bullets to detailed paragraphs
2. **Add Code Examples**: Show executable code for every pattern
3. **Include Rationale**: Explain "why" for non-obvious rules
4. **Show Anti-Patterns**: Demonstrate incorrect approaches
5. **Add TRAE Context**: Include TRAE-specific debugging tips

## 📅 Sync Schedule

- **Weekly**: Check TRAE and GitHub Copilot changelogs
- **Monthly**: Full sync from `.github/` to `.trae/`
- **Quarterly**: Deep review of both official documentations
- **On Breaking Changes**: Immediate sync and adaptation
- **On PR**: If `.github/copilot-instructions.md` changed

## ✅ Validation Checklist

Before considering a sync complete:

- [ ] All sections from `.github/copilot-instructions.md` covered
- [ ] Code examples are syntactically correct
- [ ] File paths are accurate and exist in project
- [ ] Commands are executable and tested
- [ ] TRAE-specific sections added
- [ ] Cross-references to `AGENTS.md` included
- [ ] No contradictions with universal `AGENTS.md`
- [ ] TRAE schema version specified in metadata
- [ ] Sync log updated
- [ ] Documentation updates checked

## 🔍 Quick Checks

### Check for Missing Sections

```bash
# Compare sections between files
grep -E "^## " .github/copilot-instructions.md > /tmp/github-sections.txt
grep -E "^## " .trae/rules/project_rules.md > /tmp/trae-sections.txt
diff /tmp/github-sections.txt /tmp/trae-sections.txt
```

### Validate Code Blocks

```bash
# Ensure code blocks are balanced
grep -c '```' .trae/rules/project_rules.md
# Should be even number
```

### Check for Outdated Content

```bash
# Search for old versions
grep -r "Next.js 15" .trae/  # Should be 16
grep -r "pnpm@9" .trae/      # Should be 10+
```

## 🛠️ Troubleshooting

### Schema Version Mismatch

**Problem**: TRAE reports schema version error

**Solution**:
1. Visit https://docs.trae.ai/rules/schema
2. Check current schema version
3. Update metadata in `project_rules.md`
4. Adapt structure to new schema requirements

### Conflicting Instructions

**Problem**: `.github/` and TRAE docs recommend different approaches

**Solution**:
1. Document both approaches in `project_rules.md`
2. Prefer TRAE's official recommendation
3. Note compatibility concerns
4. Add rationale for chosen approach

### Missing Code Examples

**Problem**: TRAE can't understand abstract rules

**Solution**:
1. Add executable TypeScript/JavaScript example
2. Show both correct and incorrect patterns
3. Include inline comments
4. Test examples in actual project context

## 📊 Current Status

- **Last Sync**: Check `SYNC_LOG.md`
- **Schema Version**: Check metadata in `project_rules.md`
- **Source File**: `.github/copilot-instructions.md`
- **Target File**: `.trae/rules/project_rules.md`

## 🔗 Related Files

- **Universal Standard**: [`/AGENTS.md`](../../AGENTS.md)
- **GitHub Copilot Config**: [`/.github/copilot-instructions.md`](../../.github/copilot-instructions.md)
- **Sync Prompt**: [`/.github/prompts/sync-trae-rules.prompt.md`](../../.github/prompts/sync-trae-rules.prompt.md)
- **Sync Script**: [`/.trae/scripts/sync-rules.ts`](../scripts/sync-rules.ts)
- **Skills Library**: [`/.github/skills/`](../../.github/skills/)

## 📝 Contributing

When updating TRAE rules:

1. **Check Documentation First**: Review TRAE and GitHub Copilot docs for changes
2. **Update Source**: If possible, update `.github/copilot-instructions.md` first
3. **Run Sync**: Use the automated sync script
4. **Manual Adaptation**: Add TRAE-specific enhancements
5. **Validate**: Run validation checks
6. **Update Log**: Document changes in `SYNC_LOG.md`
7. **Test**: Verify TRAE can parse and apply rules

## 🎓 Best Practices

1. **Keep AGENTS.md as Source of Truth**: Universal standard takes precedence
2. **Sync Regularly**: Don't let configurations drift
3. **Document Differences**: Note intentional vs accidental differences
4. **Add Context**: TRAE needs more explanation than Copilot
5. **Use Examples**: Every rule should have executable code
6. **Version Everything**: Track schema versions and sync dates
7. **Cross-Reference**: Link between all configuration files

## 📞 Support

- **TRAE Issues**: https://github.com/TRAE-AI/trae/issues
- **TRAE Discussions**: https://github.com/TRAE-AI/trae/discussions
- **GitHub Copilot Support**: https://support.github.com/

---

**Note**: This directory follows TRAE's official project rules format. For universal agent instructions applicable to all AI coding assistants, see `AGENTS.md` in the project root.

**Last Updated**: 2024-01-15
**TRAE Schema**: v1.2.0