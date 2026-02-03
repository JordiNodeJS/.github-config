#!/usr/bin/env tsx

/**
 * TRAE Rules Sync Script
 *
 * Syncs project rules from .github to .trae/rules following TRAE conventions.
 * Includes documentation update checking and validation.
 *
 * Usage:
 *   pnpm dlx tsx .trae/scripts/sync-rules.ts
 *   pnpm dlx tsx .trae/scripts/sync-rules.ts --check-docs
 *   pnpm dlx tsx .trae/scripts/sync-rules.ts --dry-run
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// Configuration
const CONFIG = {
  source: '.github/copilot-instructions.md',
  target: '.trae/rules/project_rules.md',
  syncLog: '.trae/rules/SYNC_LOG.md',
  agentsFile: 'AGENTS.md',
  traeSchemaVersion: '1.2.0',
  traeDocsUrl: 'https://docs.trae.ai/rules/project-rules',
  githubCopilotDocsUrl: 'https://docs.github.com/en/copilot',
};

// CLI Arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const shouldCheckDocs = args.includes('--check-docs');

interface SyncResult {
  success: boolean;
  message: string;
  changes: string[];
  warnings: string[];
}

/**
 * Main sync function
 */
async function sync(): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    message: '',
    changes: [],
    warnings: [],
  };

  console.log('🔄 Starting TRAE rules sync...\n');

  try {
    // Step 1: Verify source files exist
    console.log('📂 Verifying source files...');
    if (!existsSync(CONFIG.source)) {
      throw new Error(`Source file not found: ${CONFIG.source}`);
    }
    if (!existsSync(CONFIG.agentsFile)) {
      result.warnings.push(`Universal AGENTS.md not found at ${CONFIG.agentsFile}`);
    }
    console.log('✅ Source files verified\n');

    // Step 2: Check documentation updates (if requested)
    if (shouldCheckDocs) {
      console.log('📚 Checking for documentation updates...');
      await checkDocumentationUpdates(result);
      console.log('');
    }

    // Step 3: Read source content
    console.log('📖 Reading source files...');
    const sourceContent = await fs.readFile(CONFIG.source, 'utf-8');
    console.log(`✅ Read ${sourceContent.split('\n').length} lines from ${CONFIG.source}\n`);

    // Step 4: Transform content for TRAE
    console.log('🔧 Adapting content for TRAE...');
    const adaptedContent = await adaptForTRAE(sourceContent, result);
    console.log(`✅ Generated ${adaptedContent.split('\n').length} lines\n`);

    // Step 5: Validate adapted content
    console.log('✔️  Validating adapted content...');
    await validateContent(adaptedContent, result);
    console.log('');

    // Step 6: Write target file (if not dry-run)
    if (!isDryRun) {
      console.log('💾 Writing to target file...');

      // Ensure directory exists
      const targetDir = path.dirname(CONFIG.target);
      await fs.mkdir(targetDir, { recursive: true });

      await fs.writeFile(CONFIG.target, adaptedContent, 'utf-8');
      result.changes.push(`Updated ${CONFIG.target}`);
      console.log(`✅ Written to ${CONFIG.target}\n`);

      // Step 7: Update sync log
      console.log('📝 Updating sync log...');
      await updateSyncLog(result);
      console.log('');
    } else {
      console.log('🔍 DRY RUN: Skipping file write\n');
      console.log('Preview of adapted content:');
      console.log('─'.repeat(80));
      console.log(adaptedContent.substring(0, 500) + '...\n');
    }

    result.success = true;
    result.message = 'Sync completed successfully';
    return result;

  } catch (error) {
    result.success = false;
    result.message = error instanceof Error ? error.message : 'Unknown error';
    return result;
  }
}

/**
 * Check TRAE and GitHub Copilot documentation for updates
 */
async function checkDocumentationUpdates(result: SyncResult): Promise<void> {
  console.log('  📌 TRAE Documentation:');
  console.log(`     ${CONFIG.traeDocsUrl}`);
  console.log(`     https://docs.trae.ai/changelog`);
  console.log(`     https://github.com/TRAE-AI/trae/releases`);

  console.log('\n  📌 GitHub Copilot Documentation:');
  console.log(`     ${CONFIG.githubCopilotDocsUrl}`);
  console.log(`     https://github.blog/changelog/tag/copilot/`);

  result.warnings.push('Manual documentation check required - visit URLs above');

  console.log('\n  ⚠️  Please verify manually for:');
  console.log('     - TRAE schema version changes');
  console.log('     - New required sections');
  console.log('     - Deprecated patterns');
  console.log('     - New Copilot instruction formats');
}

/**
 * Adapt GitHub Copilot instructions to TRAE format
 */
async function adaptForTRAE(content: string, result: SyncResult): Promise<string> {
  const today = new Date().toISOString().split('T')[0];

  // Add TRAE-specific metadata header
  const metadata = `---
trae_schema_version: "${CONFIG.traeSchemaVersion}"
last_synced: "${today}"
synced_from: "${CONFIG.source}"
official_docs: "${CONFIG.traeDocsUrl}"
---

`;

  // Transform title
  const adaptedContent = content.replace(
    /^# (.+) - AI Coding Instructions/m,
    '# $1 - TRAE Project Rules\n\nThis file contains project-specific rules for TRAE AI coding assistant.'
  );

  // Add TRAE-specific sections if not present
  let finalContent = metadata + adaptedContent;

  // Add "Getting Started for TRAE" section if missing
  if (!finalContent.includes('## Getting Started for TRAE')) {
    const gettingStarted = `

## Getting Started for TRAE

When TRAE first encounters this project:

1. Review the architecture diagram above
2. Examine key files in \`src/lib/\` for patterns
3. Use Prisma for database operations
4. Use Server Actions for mutations
5. Follow caching, auth, and i18n conventions
6. Test with mock data if TMDB token unavailable
`;

    // Insert before deployment section or at end
    if (finalContent.includes('## Deployment')) {
      finalContent = finalContent.replace(
        '## Deployment',
        gettingStarted + '\n## Deployment'
      );
    } else {
      finalContent += gettingStarted;
    }

    result.changes.push('Added "Getting Started for TRAE" section');
  }

  // Add footer with cross-references
  const footer = `

---

**Note**: This configuration is specific to TRAE. For universal agent instructions, see \`AGENTS.md\` in the project root.

## Configuration Cross-References

- **Universal Standard**: See [\`/AGENTS.md\`](/AGENTS.md)
- **GitHub Copilot**: See [\`/.github/copilot-instructions.md\`](/.github/copilot-instructions.md)
- **TRAE Rules**: See [\`/.trae/rules/project_rules.md\`](/.trae/rules/project_rules.md)
- **Skills Library**: See [\`/.github/skills/\`](/.github/skills/)
- **TRAE Official Docs**: ${CONFIG.traeDocsUrl}
- **Last Updated**: ${today}
- **Schema Version**: ${CONFIG.traeSchemaVersion}
`;

  // Only add footer if not already present
  if (!finalContent.includes('## Configuration Cross-References')) {
    finalContent += footer;
    result.changes.push('Added cross-references footer');
  }

  return finalContent;
}

/**
 * Validate adapted content
 */
async function validateContent(content: string, result: SyncResult): Promise<void> {
  const lines = content.split('\n');

  // Check for required sections
  const requiredSections = [
    '## Quick Reference',
    '## Technology Stack',
    '## Project Architecture',
    '## Development Commands',
  ];

  for (const section of requiredSections) {
    if (!content.includes(section)) {
      result.warnings.push(`Missing recommended section: ${section}`);
    }
  }

  // Check for code blocks
  const codeBlockCount = (content.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    result.warnings.push('Unbalanced code blocks detected (odd number of ```)');
  }

  // Check for metadata
  if (!content.startsWith('---')) {
    result.warnings.push('Missing TRAE metadata header');
  }

  // Check for TRAE-specific sections
  if (!content.includes('Getting Started for TRAE')) {
    result.warnings.push('Missing "Getting Started for TRAE" section');
  }

  // Check for cross-references
  if (!content.includes('Configuration Cross-References')) {
    result.warnings.push('Missing cross-references section');
  }

  console.log(`  ✅ ${lines.length} lines validated`);
  console.log(`  ✅ ${codeBlockCount / 2} code blocks detected`);

  if (result.warnings.length > 0) {
    console.log(`  ⚠️  ${result.warnings.length} warnings generated`);
  }
}

/**
 * Update sync log
 */
async function updateSyncLog(result: SyncResult): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const logEntry = `
## ${today} - Automated Sync

### Changes
${result.changes.map(c => `- ${c}`).join('\n')}

### Warnings
${result.warnings.length > 0 ? result.warnings.map(w => `- ${w}`).join('\n') : '- None'}

### Documentation Checked
- [${shouldCheckDocs ? 'x' : ' '}] TRAE docs: ${CONFIG.traeDocsUrl}
- [${shouldCheckDocs ? 'x' : ' '}] GitHub Copilot docs: ${CONFIG.githubCopilotDocsUrl}

### Validation
- [x] Content adapted for TRAE
- [x] Metadata header added
- [x] Cross-references updated
- [x] Schema version: ${CONFIG.traeSchemaVersion}

---
`;

  // Create log file if it doesn't exist
  if (!existsSync(CONFIG.syncLog)) {
    const header = `# TRAE Rules Sync Log

This file tracks synchronization history between \`.github\` and \`.trae/rules\`.

---
`;
    await fs.writeFile(CONFIG.syncLog, header, 'utf-8');
  }

  // Append log entry
  await fs.appendFile(CONFIG.syncLog, logEntry, 'utf-8');
  result.changes.push(`Updated ${CONFIG.syncLog}`);
  console.log(`✅ Sync log updated`);
}

/**
 * Print final report
 */
function printReport(result: SyncResult): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 SYNC REPORT');
  console.log('='.repeat(80) + '\n');

  if (result.success) {
    console.log('✅ Status: SUCCESS\n');
  } else {
    console.log('❌ Status: FAILED\n');
    console.log(`Error: ${result.message}\n`);
  }

  if (result.changes.length > 0) {
    console.log('📝 Changes:');
    result.changes.forEach(change => console.log(`   - ${change}`));
    console.log('');
  }

  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`   - ${warning}`));
    console.log('');
  }

  console.log('📚 Next Steps:');
  if (!shouldCheckDocs) {
    console.log('   - Run with --check-docs to review documentation updates');
  }
  if (isDryRun) {
    console.log('   - Run without --dry-run to apply changes');
  }
  console.log('   - Review generated file: ' + CONFIG.target);
  console.log('   - Test TRAE with updated rules');
  console.log('   - Update AGENTS.md if needed');
  console.log('');
}

// Run the script
sync()
  .then(result => {
    printReport(result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
