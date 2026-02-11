# Windows Directory Junctions & Symbolic Links

**Version 1.0.0**  
January 2026

> **Note:**  
> This document provides guidance for AI agents and developers on creating  
> and managing directory junctions and symbolic links in Windows environments,  
> particularly for syncing configuration directories across multiple tools.

---

## Abstract

Practical guide for creating directory junctions and symbolic links in Windows without requiring administrator privileges. Focuses on junction creation (no admin needed) for mirroring directories across multiple tool configurations. Includes error handling, verification steps, and Git integration considerations.

---

## When to Use This Skill

Use this skill when:

- User requests creating symlinks, directory links, or mirroring directories in Windows
- Need to synchronize configuration folders across multiple tools (.agent, .cursor, .github, .opencode)
- Setting up skill directories that should reference a single source of truth
- Creating directory links without admin privileges
- Managing directory synchronization in Windows development environments

---

## Key Concepts

**Junctions:**

- Windows directory links that don't require admin privileges
- Work only with directories (not files)
- Limited to same volume/drive
- Ideal for local directory mirroring

**Symbolic Links:**

- More flexible but require admin privileges
- Work with files and directories
- Can span across drives
- Support relative paths

**Recommendation:** Use junctions for local directory mirroring in development environments.

---

## Implementation Guidelines

See [SKILL.md](SKILL.md) for complete workflows, patterns, and troubleshooting.

### Quick Start

```bash
# Create single junction (from Git Bash or bash terminal)
cd /path/to/project && powershell -Command "
  Remove-Item -Recurse -Force '.\.target\dir' -ErrorAction SilentlyContinue;
  New-Item -ItemType Junction -Path '.\.target\dir' -Target (Resolve-Path '.\.source\dir').Path
"
```

### Common Use Cases

1. **Skill directory synchronization** - Mirror `.agents/skills` to `.agent/skills`, `.cursor/skills`, etc.
2. **Configuration sharing** - Share config directories across multiple tool installations
3. **Workspace organization** - Maintain single source of truth with multiple access points

---

## Best Practices for Agents

1. **Always clean before creating** - Remove existing directories with `-ErrorAction SilentlyContinue`
2. **Use Resolve-Path for absolute paths** - Ensures consistent behavior
3. **Verify after creation** - List junction contents to confirm correct setup
4. **Handle errors explicitly** - Check for common errors and provide solutions
5. **Update .gitignore** - Add junction paths to avoid committing duplicates

---

## Error Resolution

| Error            | Cause                    | Solution                                          |
| ---------------- | ------------------------ | ------------------------------------------------- |
| ResourceExists   | Directory already exists | Remove first with `-ErrorAction SilentlyContinue` |
| PermissionDenied | Trying to create symlink | Use Junction instead or run as admin              |
| PathNotFound     | Source doesn't exist     | Verify source path exists                         |

---

## Integration with Development Tools

This skill is particularly useful for:

- AI coding assistants (Cursor, GitHub Copilot, etc.)
- Multi-tool development environments
- Skill management systems
- Configuration synchronization
- Monorepo setups

---

## Further Reading

For complete workflows, patterns, and detailed examples, see [SKILL.md](SKILL.md).
