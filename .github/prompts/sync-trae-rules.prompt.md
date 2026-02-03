# Sync TRAE Rules from GitHub Conventions

You are an expert AI configuration architect tasked with synchronizing project rules between `.github` and `.trae` directories, ensuring TRAE conventions are properly adapted from existing GitHub Copilot instructions.

## Objective

Migrate and adapt all rules, conventions, and instructions from `.github/` to `.trae/rules/` following TRAE's official documentation standards while maintaining compatibility with the universal `AGENTS.md` format.

## Prerequisites

Before starting, verify:

1. **Source Files Exist**:
   - `.github/copilot-instructions.md` (primary source)
   - `.github/skills/` (optional skill-specific rules)
   - `.github/instructions/` (optional additional instructions)
   - `AGENTS.md` (universal agent standard)

2. **TRAE Documentation Access**:
   - Check official TRAE docs at: https://docs.trae.ai/
   - Review TRAE GitHub repo: https://github.com/TRAE-AI/trae
   - Check for latest `project_rules.md` format: https://docs.trae.ai/rules/project-rules
   - Verify current TRAE version and rule schema changes

3. **GitHub Copilot Documentation**:
   - GitHub Copilot instructions format: https://docs.github.com/en/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot
   - Copilot instruction best practices: https://github.blog/changelog/2024-04-09-copilot-instructions/

## Step-by-Step Process

### Phase 1: Documentation Review

1. **Check TRAE Official Docs**:
   ```bash
   # Visit and review:
   # - https://docs.trae.ai/configuration/project-rules
   # - https://docs.trae.ai/rules/schema
   # - https://docs.trae.ai/rules/best-practices
   ```

2. **Verify Current TRAE Version**:
   - Check if `.trae/rules/project_rules.md` schema has changed
   - Review TRAE changelog for breaking changes
   - Note any new required sections or deprecated patterns

3. **Review GitHub Copilot Updates**:
   - Check if `.github/copilot-instructions.md` format changed
   - Review new GitHub Copilot features that need rule updates
   - Note any deprecated instruction patterns

### Phase 2: Content Audit

Analyze existing `.github/` content:

1. **Primary Content** (`.github/copilot-instructions.md`):
   - [ ] Quick commands and shortcuts
   - [ ] Project overview and stack
   - [ ] Architecture and data flow
   - [ ] Code style guidelines
   - [ ] Project-specific conventions
   - [ ] Authentication patterns
   - [ ] Database patterns
   - [ ] API integration rules
   - [ ] Caching strategies
   - [ ] Styling system
   - [ ] Internationalization
   - [ ] Error handling
   - [ ] Performance guidelines
   - [ ] Common pitfalls
   - [ ] Deployment instructions

2. **Extended Content**:
   - [ ] Skills from `.github/skills/*/README.md`
   - [ ] Prompts from `.github/prompts/*.prompt.md`
   - [ ] Agent configs from `.github/agents/*.agent.md`
   - [ ] Additional instructions from `.github/instructions/*.md`

3. **Missing in TRAE**:
   - Identify sections in `.github/` not yet in `.trae/rules/`
   - Note sections that need TRAE-specific adaptation
   - List sections that should remain GitHub Copilot-exclusive

### Phase 3: TRAE Rule Structure

Follow TRAE's official `project_rules.md` structure (verify with latest docs):

```markdown
# [Project Name] - TRAE Project Rules

## Quick Reference
[Essential commands and shortcuts]

## Technology Stack
[Complete stack with versions]

## Project Architecture
[System design, components, data flow]

## Code Style Guidelines
### TypeScript
### React/Framework Patterns
### File Naming
### Import Organization

## Development Commands
[All scripts with descriptions]

## Project-Specific Conventions
### [Convention Category 1]
### [Convention Category 2]

## Database Patterns
[ORM usage, schema patterns, query patterns]

## Authentication System
[Auth flow, security patterns, implementation]

## API Integration
[External APIs, rate limiting, caching]

## Styling System
[CSS framework, theme, utilities]

## Internationalization
[i18n framework, usage patterns]

## File Structure Reference
[Key files with descriptions]

## Environment Variables
[Required vars, configuration]

## Error Handling
[Patterns, logging, recovery]

## Performance Guidelines
[Optimization strategies]

## Common Pitfalls to Avoid
[Anti-patterns, gotchas]

## Testing Guidelines
[Testing approach, commands]

## Deployment
[Process, checklist, environments]

## Getting Started for TRAE
[Onboarding steps specific to TRAE]

---
**Note**: This configuration is specific to TRAE. For universal agent instructions, see `AGENTS.md` in the project root.
```

### Phase 4: Adaptation Rules

When migrating content from `.github/` to `.trae/`:

1. **Expand Concise Instructions**:
   ```markdown
   # FROM .github (concise)
   - Use `ensureUser()` in Server Actions
   
   # TO .trae (detailed)
   ### Protected Server Action Pattern
   
   Always call `ensureUser()` at the start of protected Server Actions:
   
   ```typescript
   "use server";
   import { ensureUser } from "@/lib/actions";
   
   export async function protectedAction() {
     const user = await ensureUser(); // Throws if unauthorized
     // Proceed with authenticated operation
   }
   ```
   
   **Rationale**: Ensures authentication before database operations.
   ```

2. **Add Code Examples**:
   - Convert bullet points to executable examples
   - Show both correct and incorrect patterns
   - Include inline comments explaining "why"

3. **Add Context for AI**:
   - Explain architectural decisions
   - Add "Rationale" sections for non-obvious rules
   - Include troubleshooting tips

4. **TRAE-Specific Sections**:
   - Add "Getting Started for TRAE" section
   - Include TRAE-specific debugging tips
   - Note TRAE capabilities vs limitations

### Phase 5: Sync Skills and Prompts

For each skill in `.github/skills/`:

1. **Evaluate Relevance**:
   - Is this skill TRAE-applicable?
   - Does it require TRAE-specific adaptation?
   - Should it be a separate rule file?

2. **Integration Options**:
   - **Option A**: Merge into main `project_rules.md` (for core skills)
   - **Option B**: Create `.trae/rules/skills/[skill-name].md` (for specialized skills)
   - **Option C**: Reference in `project_rules.md` but keep in `.github/` (for tool-specific skills)

3. **Skill Adaptation Template**:
   ```markdown
   ## [Skill Name] (from .github/skills/[skill-name])
   
   ### Overview
   [Skill description and use case]
   
   ### Implementation Patterns
   [Code patterns with examples]
   
   ### TRAE-Specific Notes
   [How TRAE should apply this skill]
   
   ### Related Files
   [Key files for this skill]
   ```

### Phase 6: Quality Assurance

1. **Validation Checklist**:
   - [ ] All sections from `.github/copilot-instructions.md` covered
   - [ ] Code examples are syntactically correct
   - [ ] File paths are accurate and exist in project
   - [ ] Commands are executable and tested
   - [ ] TRAE-specific sections added
   - [ ] Cross-references to `AGENTS.md` included
   - [ ] No contradictions with universal `AGENTS.md`

2. **Consistency Checks**:
   ```bash
   # Verify stack versions match across files
   grep -r "Next.js" .github/ .trae/ AGENTS.md
   
   # Verify commands match across files
   grep -r "pnpm dev" .github/ .trae/ AGENTS.md
   
   # Check for outdated patterns
   grep -r "deprecated\|old\|legacy" .trae/
   ```

3. **TRAE Compatibility Test**:
   - Ensure rule file follows latest TRAE schema
   - Verify all code examples use project's actual stack
   - Test that TRAE can parse and apply rules

### Phase 7: Documentation Update Check

1. **Check for Official Documentation Updates**:
   ```bash
   # TRAE Documentation
   # Visit: https://docs.trae.ai/changelog
   # Check for:
   # - New rule schema versions
   # - Deprecated rule patterns
   # - New TRAE capabilities affecting rules
   
   # GitHub Copilot Documentation  
   # Visit: https://docs.github.com/en/copilot/changelog
   # Check for:
   # - New instruction formats
   # - Deprecated patterns
   # - New Copilot features
   ```

2. **Update Based on Latest Docs**:
   - If TRAE docs show new schema → Adapt `.trae/rules/` structure
   - If GitHub Copilot docs show new features → Update `.github/copilot-instructions.md`
   - If conflicts arise → Prioritize TRAE official schema for `.trae/`, GitHub schema for `.github/`

3. **Version Tracking**:
   Add metadata to rule files:
   ```markdown
   ---
   # Metadata (optional, add at top of file)
   trae_schema_version: "1.2.0"  # From https://docs.trae.ai/rules/schema
   last_synced: "2024-01-15"
   synced_from: ".github/copilot-instructions.md"
   official_docs: "https://docs.trae.ai/rules/project-rules"
   ---
   ```

### Phase 8: Cross-Reference System

Add navigation aids at the end of each file:

```markdown
---

## Configuration Cross-References

- **Universal Standard**: See [`/AGENTS.md`](/AGENTS.md)
- **GitHub Copilot**: See [`/.github/copilot-instructions.md`](/.github/copilot-instructions.md)
- **TRAE Rules**: See [`/.trae/rules/project_rules.md`](/.trae/rules/project_rules.md)
- **Skills Library**: See [`/.github/skills/`](/.github/skills/)
- **TRAE Official Docs**: https://docs.trae.ai/rules/project-rules
- **Last Updated**: [Date]
- **Schema Version**: [TRAE schema version]
```

## Output Structure

Create/update the following files:

### 1. `.trae/rules/project_rules.md`
Main TRAE configuration file with all adapted rules.

### 2. `.trae/rules/README.md`
```markdown
# TRAE Rules Directory

This directory contains TRAE-specific project rules and conventions.

## Files

- `project_rules.md` - Main project rules (synced from `.github/copilot-instructions.md`)
- `skills/` - Specialized skill rules (optional)

## Sync Process

Rules are periodically synced from `.github/` using the prompt:
`.github/prompts/sync-trae-rules.prompt.md`

## Documentation

- TRAE Official Docs: https://docs.trae.ai/
- Rule Schema: https://docs.trae.ai/rules/schema
- Best Practices: https://docs.trae.ai/rules/best-practices

## Last Sync

- Date: [YYYY-MM-DD]
- Source: `.github/copilot-instructions.md`
- Schema Version: [version]
```

### 3. `.trae/rules/SYNC_LOG.md`
Track synchronization history:
```markdown
# TRAE Rules Sync Log

## [YYYY-MM-DD] - Schema v1.2.0

### Changes
- Added [section name] from `.github/copilot-instructions.md`
- Updated [section name] based on TRAE docs update
- Deprecated [old pattern] in favor of [new pattern]

### Documentation Checked
- [x] TRAE docs: https://docs.trae.ai/ (v1.2.0)
- [x] GitHub Copilot docs: https://docs.github.com/copilot (2024-01-15)

### Validation
- [x] All code examples tested
- [x] TRAE schema compliance verified
- [x] Cross-references updated
```

## Maintenance Schedule

Establish a sync routine:

1. **Weekly**: Check TRAE and GitHub Copilot changelogs
2. **Monthly**: Full sync from `.github/` to `.trae/`
3. **Quarterly**: Deep review of both official documentations
4. **On Breaking Changes**: Immediate sync and adaptation

## Common Sync Scenarios

### Scenario 1: New GitHub Copilot Instruction Added

```markdown
# In .github/copilot-instructions.md
## New Feature X
- Use pattern Y for feature X

# Adapt to .trae/rules/project_rules.md
## New Feature X (Added: YYYY-MM-DD)

### Overview
Feature X enables [description]. Use pattern Y for implementation.

### Implementation Pattern
```typescript
// Example code for pattern Y
```

### TRAE-Specific Notes
When TRAE encounters [scenario], apply pattern Y as follows...
```

### Scenario 2: TRAE Schema Update

```markdown
# If TRAE docs introduce new required section "Performance Metrics"

## Performance Metrics (TRAE Schema v1.3.0)

### Monitoring
[Add performance monitoring guidelines]

### Benchmarks
[Add benchmark targets]

### Optimization Triggers
[When to optimize based on metrics]
```

### Scenario 3: Conflicting Instructions

```markdown
# If .github says one thing and TRAE best practices say another

## [Topic] - Approach Clarification

### GitHub Copilot Approach (from .github/)
[Copilot's preferred pattern]

### TRAE Approach (recommended)
[TRAE's preferred pattern based on official docs]

**Rationale**: TRAE prefers [approach] because [reason from official docs].

**Cross-Agent Compatibility**: When working with both tools, use [approach].
```

## Success Criteria

- [ ] All `.github/` rules represented in `.trae/rules/`
- [ ] All code examples are TRAE-tested and working
- [ ] TRAE official schema compliance verified
- [ ] Cross-references to `AGENTS.md` and `.github/` present
- [ ] Documentation update check completed
- [ ] Sync log created and maintained
- [ ] No contradictions between configuration files
- [ ] TRAE-specific sections added for AI context
- [ ] Version metadata included

## Example Execution

```bash
# 1. Check official docs for updates
echo "Checking TRAE docs at https://docs.trae.ai/..."
echo "Checking GitHub Copilot docs..."

# 2. Read source files
cat .github/copilot-instructions.md
ls .github/skills/

# 3. Create/update TRAE rules
mkdir -p .trae/rules
touch .trae/rules/project_rules.md

# 4. Validate sync
diff -u .github/copilot-instructions.md .trae/rules/project_rules.md

# 5. Update sync log
echo "## $(date +%Y-%m-%d) - Sync completed" >> .trae/rules/SYNC_LOG.md
```

## Final Notes

- **Bidirectional Sync**: Consider if changes in `.trae/` should flow back to `.github/`
- **Automation**: Consider creating a script `.trae/scripts/sync-rules.ts` for automated sync
- **Validation Tool**: Build a linter that checks rule consistency across all config files
- **Community Updates**: Subscribe to TRAE and GitHub Copilot communities for early feature announcements

---

**Remember**: TRAE needs more context than GitHub Copilot. When in doubt, add more explanation, examples, and rationale. The AI agent should understand not just "what" to do, but "why" and "how" in the context of your specific project.