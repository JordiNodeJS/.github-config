# Notion API Examples and Patterns

Complete, runnable examples for common Notion operations in Node.js/JavaScript.

## Creating a Simple Database

```typescript
const db = await notion_notion-create-database({
  title: [{
    type: "text",
    text: {content: "Projects Database"}
  }],
  parent: {page_id: "parent-page-id"},
  properties: {
    "Project Name": {type: "title"},
    "Status": {
      type: "select",
      select: {
        options: [
          {name: "Planning", color: "blue"},
          {name: "In Progress", color: "yellow"},
          {name: "Completed", color: "green"}
        ]
      }
    },
    "Priority": {
      type: "number"
    },
    "Due Date": {
      type: "date"
    },
    "Team": {
      type: "multi_select",
      multi_select: {
        options: [
          {name: "Frontend", color: "purple"},
          {name: "Backend", color: "pink"},
          {name: "Design", color: "orange"}
        ]
      }
    },
    "Is Active": {
      type: "checkbox"
    }
  }
});

console.log("Database created:", db.url);
```

## Creating Pages in a Database

```typescript
const pages = await notion_notion-create-pages({
  pages: [
    {
      properties: {
        "Project Name": "Website Redesign",
        "Status": "In Progress",
        "Priority": 1,
        "date:Due Date:start": "2025-03-15",
        "date:Due Date:is_datetime": 0,
        "Is Active": "__YES__"
      },
      content: `# Website Redesign

## Overview
Complete redesign of the company website with modern design patterns.

## Key Features
- Responsive mobile design
- Dark mode support
- Improved accessibility

## Timeline
- Phase 1: Design (Jan-Feb)
- Phase 2: Development (Mar-Apr)
- Phase 3: Testing (May)

▶ Technical Details
\tStack: Next.js, React, Tailwind CSS
\tDatabase: Prisma + PostgreSQL
\tDeployment: Vercel`
    },
    {
      properties: {
        "Project Name": "Mobile App",
        "Status": "Planning",
        "Priority": 2,
        "date:Due Date:start": "2025-06-30",
        "date:Due Date:is_datetime": 0,
        "Is Active": "__YES__"
      },
      content: `# Mobile App Development

## Description
Native mobile application for iOS and Android.

## Requirements
- User authentication
- Offline capabilities
- Push notifications`
    }
  ],
  parent: {data_source_id: "collection-id"}
});

console.log(`Created ${pages.length} pages`);
```

## Fetching and Displaying Database Content

```typescript
// Fetch the database structure
const db = await notion_notion-fetch({
  id: "database-id-or-url"
});

console.log("Database name:", db.title);
console.log("Data sources:", db.dataSources.length);

// Show schema for first data source
const firstSource = db.dataSources[0];
console.log("\nSchema:");
Object.entries(firstSource.schema).forEach(([key, value]) => {
  console.log(`  - ${key} (${value.type})`);
  if (value.options?.length) {
    console.log(`    Options: ${value.options.map(o => o.name).join(', ')}`);
  }
});
```

## Updating Page Content with Toggles

```typescript
const pageId = "page-id-here";

// Add a new toggle section with environment variables
await notion_notion-update-page({
  page_id: pageId,
  command: "insert_content_after",
  selection_with_ellipsis: "## Technical...",
  new_str: `

▶ Environment Variables (Sensitive - Private Document)
\tDATABASE_URL=postgresql://user:pass@host/db
\tAPI_KEY=secret_key_here
\tAUTH_SECRET=auth_secret_here
\tNODE_ENV=production`
});
```

## Syncing from External API

```typescript
// Example: Sync GitHub issues to Notion

interface GitHubIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  labels: Array<{name: string}>;
}

async function syncGitHubIssuesToNotion(
  repoOwner: string,
  repoName: string,
  notionDatabaseId: string
) {
  // Fetch GitHub issues
  const response = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/issues`
  );
  const issues: GitHubIssue[] = await response.json();

  // Check existing issues in Notion
  const notionDb = await notion_notion-fetch({id: notionDatabaseId});
  const existingIssueNumbers = new Set();
  
  // You'd parse the database view to find existing issue numbers
  // For now, just sync all

  // Create pages for issues
  const pages = issues.map(issue => ({
    properties: {
      "title": `#${issue.number}: ${issue.title}`,
      "Status": issue.state === 'open' ? 'Open' : 'Closed',
      "date:Created:start": issue.created_at.split('T')[0],
      "date:Created:is_datetime": 0,
      "Labels": issue.labels[0]?.name || 'general'  // First label as single select
    },
    content: `# Issue #${issue.number}\n\n## Description\n${issue.title}\n\n## Labels\n${issue.labels.map(l => `- ${l.name}`).join('\n')}`
  }));

  // Create in batches
  const batchSize = 10;
  for (let i = 0; i < pages.length; i += batchSize) {
    const batch = pages.slice(i, i + batchSize);
    await notion_notion-create-pages({
      pages: batch,
      parent: {data_source_id: "collection-id"}
    });
    console.log(`Created ${batch.length} pages`);
  }
}
```

## Managing Project Documentation with Templates

```typescript
// Create a project documentation template

async function createProjectPage(projectName: string, parentPageId: string) {
  const today = new Date().toISOString().split('T')[0];

  const page = await notion_notion-create-pages({
    pages: [{
      properties: {
        title: projectName
      },
      content: `# ${projectName}

**Created**: ${today}

## Overview
Add project overview here.

## Goals & Objectives
- Goal 1
- Goal 2
- Goal 3

## Stakeholders
- [ ] Product Manager
- [ ] Tech Lead
- [ ] Designer

## Timeline
| Phase | Start | End | Status |
|-------|-------|-----|--------|
| Phase 1 | TBD | TBD | Not Started |
| Phase 2 | TBD | TBD | Not Started |

▶ Resources
\tBudget: $X
\tTeam Size: N people
\tTools: List tools here

▶ Success Metrics
\tMetric 1: Target value
\tMetric 2: Target value
\tMetric 3: Target value

▶ Technical Details
\tArchitecture: Describe here
\tStack: Describe here
\tDatabase: Describe here
\tAPI Design: Describe here

## Status Updates
### Latest Update (${today})
- Update 1
- Update 2

### Previous Updates
- Archive old updates here

## Next Steps
- [ ] Action item 1
- [ ] Action item 2
- [ ] Action item 3

---
*Last updated: ${today}*`
    }],
    parent: {page_id: parentPageId}
  });

  return page[0];
}

// Usage
await createProjectPage("Mobile App Redesign", "parent-page-id");
```

## Searching and Filtering

```typescript
// Search within a specific date range
const recentDocs = await notion_notion-search({
  query: "project",
  filters: {
    created_date_range: {
      start_date: "2025-01-01",
      end_date: "2025-01-31"
    }
  }
});

console.log("Found docs:", recentDocs.results.length);
recentDocs.results.forEach(result => {
  console.log(`- ${result.title} (${result.url})`);
});

// Search for users
const teamMembers = await notion_notion-get-users({
  query: "john"
});

console.log("Users found:", teamMembers.results.length);
teamMembers.results.forEach(user => {
  console.log(`- ${user.name} (${user.email})`);
});
```

## Error Handling Pattern

```typescript
async function safeNotion<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Invalid multi_select')) {
        console.error(`❌ ${context}: Invalid option value`);
        console.error('   Make sure the option exists in the database schema');
      } else if (error.message.includes('validation_error')) {
        console.error(`❌ ${context}: Validation error`);
        console.error('   Check property types match database schema');
      } else if (error.message.includes('not_found')) {
        console.error(`❌ ${context}: Resource not found`);
        console.error('   Verify the ID/URL is correct');
      } else {
        console.error(`❌ ${context}:`, error.message);
      }
    }
    return null;
  }
}

// Usage
const page = await safeNotion(
  () => notion_notion-fetch({id: "page-id"}),
  "Fetching page"
);

if (page) {
  console.log("Success:", page.title);
}
```

## Building Complex Documents Programmatically

```typescript
interface Section {
  title: string;
  content: string;
  subsections?: Section[];
  toggles?: Record<string, string>;
}

function buildMarkdown(sections: Section[], level = 1): string {
  let md = '';
  const heading = '#'.repeat(level);

  for (const section of sections) {
    md += `${heading} ${section.title}\n\n`;
    md += `${section.content}\n\n`;

    if (section.subsections) {
      md += buildMarkdown(section.subsections, level + 1);
    }

    if (section.toggles) {
      for (const [title, content] of Object.entries(section.toggles)) {
        md += `▶ ${title}\n`;
        md += content.split('\n').map(line => `\t${line}`).join('\n');
        md += '\n\n';
      }
    }
  }

  return md;
}

// Usage
const doc = buildMarkdown([
  {
    title: 'Project Overview',
    content: 'This project aims to...',
    toggles: {
      'Technical Stack': 'Frontend: Next.js\nBackend: Node.js\nDB: PostgreSQL'
    },
    subsections: [
      {
        title: 'Goals',
        content: '- Goal 1\n- Goal 2'
      }
    ]
  }
]);

await notion_notion-create-pages({
  pages: [{properties: {title: "My Document"}, content: doc}],
  parent: {page_id: "parent-id"}
});
```
