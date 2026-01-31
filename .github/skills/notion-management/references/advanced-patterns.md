# Advanced Notion Patterns

This document covers advanced patterns and optimization techniques for working with the Notion API in Node.js/JavaScript projects.

## Table of Contents
- [Batch Operations](#batch-operations)
- [Data Synchronization](#data-synchronization)
- [Database Relationships](#database-relationships)
- [Performance Optimization](#performance-optimization)
- [Error Recovery](#error-recovery)

## Batch Operations

### Creating Multiple Pages Efficiently

When creating many pages, combine them in a single call:

```typescript
const pages = await notion_notion-create-pages({
  pages: [
    {
      properties: {title: "Page 1", status: "TODO"},
      content: "Content 1"
    },
    {
      properties: {title: "Page 2", status: "TODO"},
      content: "Content 2"
    },
    {
      properties: {title: "Page 3", status: "TODO"},
      content: "Content 3"
    }
  ],
  parent: {data_source_id: "collection-id"}
});
```

**Limits**: Maximum 100 pages per call. For larger batches:

```typescript
const pages = []; // Array of 1000+ pages
const batchSize = 100;

for (let i = 0; i < pages.length; i += batchSize) {
  const batch = pages.slice(i, i + batchSize);
  await notion_notion-create-pages({
    pages: batch,
    parent: {data_source_id: "collection-id"}
  });
  // Add delay between batches to respect rate limits
  await new Promise(resolve => setTimeout(resolve, 1000));
}
```

### Updating Multiple Properties

For bulk updates across many pages:

```typescript
const pageIds = ["id1", "id2", "id3"];

for (const pageId of pageIds) {
  await notion_notion-update-page({
    page_id: pageId,
    command: "update_properties",
    properties: {
      status: "Completed",
      "date:Completed Date:start": new Date().toISOString().split('T')[0]
    }
  });
}
```

**Better approach**: Use database views with filters to identify pages, then update in parallel:

```typescript
// Fetch database to find pages matching criteria
const db = await notion_notion-fetch({id: "database-id"});

// Update multiple pages in parallel
await Promise.all(
  pageIds.map(id =>
    notion_notion-update-page({
      page_id: id,
      command: "update_properties",
      properties: {status: "Completed"}
    })
  )
);
```

## Data Synchronization

### Syncing External Data to Notion

Pattern for importing data from external APIs:

```typescript
// 1. Fetch existing data in Notion
const db = await notion_notion-fetch({id: "database-id"});
const existingTitles = new Set();

// Parse existing pages (would need to iterate through database view)

// 2. Fetch external data
const externalData = await fetchFromAPI();

// 3. Create new entries for data not in Notion
const newPages = externalData
  .filter(item => !existingTitles.has(item.name))
  .map(item => ({
    properties: {
      title: item.name,
      description: item.desc,
      "date:Created:start": item.created_date,
      "date:Created:is_datetime": 0
    },
    content: `# ${item.name}\n\n${item.details}`
  }));

if (newPages.length > 0) {
  await notion_notion-create-pages({
    pages: newPages,
    parent: {data_source_id: "collection-id"}
  });
}

// 4. Update existing entries (in batches)
for (const item of externalData) {
  const existingPage = await notion_notion-search({
    query: item.name
  });
  
  if (existingPage.results.length > 0) {
    await notion_notion-update-page({
      page_id: existingPage.results[0].id,
      command: "update_properties",
      properties: {
        status: item.status,
        "date:Updated:start": new Date().toISOString().split('T')[0]
      }
    });
  }
}
```

### Handling Incremental Updates

For large syncs, track last sync timestamp:

```typescript
const lastSyncTime = localStorage.getItem('notion_last_sync') || '2025-01-01';

// Fetch only recently modified external data
const recentData = await fetchFromAPI({
  modified_since: lastSyncTime
});

// Update or create in Notion
// ... sync logic ...

// Update last sync time
localStorage.setItem('notion_last_sync', new Date().toISOString());
```

## Database Relationships

### Understanding Data Sources in Multi-Source Databases

When a database has multiple data sources (collections), each can have different schemas:

```typescript
// Fetch database
const db = await notion_notion-fetch({id: "database-url"});

// Response shows:
// data-sources:
//   - collection://source1 (schema A)
//   - collection://source2 (schema B)
// views:
//   - Details view uses source1
//   - Gallery view uses source2

// When creating pages, always specify correct data_source_id:
await notion_notion-create-pages({
  pages: [{properties: {...}, content: "..."}],
  parent: {data_source_id: "source1-id"}  // Not database_id!
});
```

### Querying Relationships

To find related pages:

```typescript
// Search for pages with specific relationship
const results = await notion_notion-search({
  query: "project name",
  data_source_url: "collection://source-id"
});

// Filter results further by properties
const filtered = results.results.filter(page =>
  page.properties.status === "Active"
);
```

## Performance Optimization

### Caching Database Schemas

Database schemas don't change often—cache them:

```typescript
let cachedSchemas = new Map();

async function getDatabaseSchema(dbId) {
  if (cachedSchemas.has(dbId)) {
    return cachedSchemas.get(dbId);
  }
  
  const db = await notion_notion-fetch({id: dbId});
  const schema = db.schema;
  cachedSchemas.set(dbId, schema);
  return schema;
}
```

### Parallel Operations

When possible, run operations in parallel:

```typescript
// Good: Fetch multiple pages in parallel
const pageIds = ["id1", "id2", "id3"];
const pages = await Promise.all(
  pageIds.map(id => notion_notion-fetch({id}))
);

// Acceptable: Small sequential updates
// When order matters or updating related pages
```

### Reducing API Calls

Combine operations when possible:

```typescript
// ❌ Bad: 3 separate calls
await notion_notion-update-page({...}); // Update properties
await notion_notion-update-page({...}); // Update content

// ✅ Better: Plan updates, combine where possible
const updates = [
  {command: "update_properties", properties: {...}},
  {command: "replace_content", new_str: "..."}
];

// Note: If both needed, must be two calls, but no delay between them
```

## Error Recovery

### Retry Logic with Exponential Backoff

```typescript
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
await withRetry(() =>
  notion_notion-create-pages({pages: [...], parent: {...}})
);
```

### Handling Rate Limits

Notion has rate limits. Implement throttling:

```typescript
class NotionThrottler {
  constructor(requestsPerSecond = 3) {
    this.requestsPerSecond = requestsPerSecond;
    this.lastRequestTime = 0;
  }
  
  async throttle() {
    const now = Date.now();
    const minInterval = 1000 / this.requestsPerSecond;
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve =>
        setTimeout(resolve, minInterval - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }
}

// Usage
const throttler = new NotionThrottler(3); // 3 requests per second

for (const page of pages) {
  await throttler.throttle();
  await notion_notion-create-pages({...});
}
```

### Validation Before Operations

Always validate data before sending to Notion:

```typescript
function validatePageProperties(properties, schema) {
  for (const [key, value] of Object.entries(properties)) {
    const propertySchema = schema[key];
    
    if (!propertySchema) {
      throw new Error(`Property "${key}" not in database schema`);
    }
    
    // Validate type-specific constraints
    if (propertySchema.type === 'select' && value) {
      const validOptions = propertySchema.options.map(o => o.name);
      if (!validOptions.includes(value)) {
        throw new Error(
          `Invalid option "${value}". Valid: ${validOptions.join(', ')}`
        );
      }
    }
    
    if (propertySchema.type === 'checkbox' && value) {
      if (!['__YES__', '__NO__'].includes(value)) {
        throw new Error('Checkbox must be "__YES__" or "__NO__"');
      }
    }
  }
}
```

## Complex Content Management

### Building Rich Documents Programmatically

```typescript
function buildDocument(sections) {
  let content = '';
  
  for (const section of sections) {
    content += `# ${section.title}\n\n`;
    
    if (section.description) {
      content += `${section.description}\n\n`;
    }
    
    if (section.items) {
      for (const item of section.items) {
        content += `- **${item.name}**: ${item.description}\n`;
      }
      content += '\n';
    }
    
    if (section.subsections) {
      for (const sub of section.subsections) {
        content += `## ${sub.title}\n\n`;
        content += `${sub.content}\n\n`;
      }
    }
  }
  
  return content;
}

// Usage
const content = buildDocument([
  {
    title: "Overview",
    description: "Project overview",
    items: [
      {name: "Goal", description: "Main project goal"},
      {name: "Timeline", description: "Q1 2025"}
    ]
  },
  {
    title: "Details",
    subsections: [
      {title: "Architecture", content: "Detailed architecture..."}
    ]
  }
]);

await notion_notion-create-pages({
  pages: [{properties: {title: "Project"}, content}],
  parent: {data_source_id: "..."}
});
```

### Managing Toggle Sections

```typescript
function createToggle(title, content) {
  return `▶ ${title}\n\t${content.split('\n').join('\n\t')}`;
}

// Usage
const toggles = [
  createToggle("Setup Instructions", "1. Install\n2. Configure\n3. Run"),
  createToggle("Configuration", "Key: value\nOther: setting"),
  createToggle("Troubleshooting", "Problem: Solution")
];

const content = `# Documentation\n\n${toggles.join('\n\n')}`;
```
