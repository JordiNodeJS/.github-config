# Notion API Troubleshooting Guide

Solutions for common errors and issues when working with Notion API.

## Table of Contents
- [Property Validation Errors](#property-validation-errors)
- [Database Schema Issues](#database-schema-issues)
- [Content and Markdown Issues](#content-and-markdown-issues)
- [Permission and Access Errors](#permission-and-access-errors)
- [Performance and Rate Limits](#performance-and-rate-limits)

## Property Validation Errors

### "Invalid multi_select value"

**Error message:**
```
Invalid multi_select value for property "Tags": "Next.js,TypeScript,Prisma". 
Value must be one of the following: "PRD", "Post", ...
```

**Causes:**
1. Option name spelled wrong or case mismatch
2. Passing multiple options as comma-separated string (API doesn't support this)
3. Trying to pass an array instead of string

**Solutions:**

```typescript
// ❌ WRONG: Trying multiple tags at once
properties: {
  Tags: "Next.js,TypeScript,Prisma"  // Don't use commas
}

// ❌ WRONG: Using array
properties: {
  Tags: ["Next.js", "TypeScript"]  // Don't use arrays
}

// ✅ CORRECT: Single tag as string
properties: {
  Tags: "Next.js"
}

// For multiple tags: Create page with one, then update with others
// Or create multiple pages with different tags
```

**Prevention:**
1. Fetch database first to see exact option names:
   ```typescript
   const db = await notion_notion-fetch({id: "database-id"});
   // Check db.dataSources[0].schema.Tags.options
   ```

2. Use exact names from schema (case-sensitive)
3. Pass single option at a time

---

### "Invalid input" / Validation error

**Error message:**
```
Invalid input for property "Due Date": expected format YYYY-MM-DD
```

**Common causes:**
1. Wrong format for date properties (missing expanded keys)
2. Property type mismatch (e.g., passing string to number)
3. Unknown property name not in schema

**Solutions:**

#### Date properties must use expanded format:
```typescript
// ❌ WRONG: Trying to set date as simple property
properties: {
  "Due Date": "2025-03-15"  // Wrong!
}

// ✅ CORRECT: Use expanded format with three keys
properties: {
  "date:Due Date:start": "2025-03-15",
  "date:Due Date:end": null,
  "date:Due Date:is_datetime": 0  // 0 for date, 1 for datetime
}

// For datetime:
properties: {
  "date:Due Date:start": "2025-03-15T14:30:00",
  "date:Due Date:is_datetime": 1
}
```

#### Check property types:
```typescript
// ❌ WRONG: Number as string
properties: {
  Priority: "1"  // String, but should be number
}

// ✅ CORRECT: Actual number
properties: {
  Priority: 1  // JavaScript number
}

// ❌ WRONG: Wrong type for select
properties: {
  Status: ["In Progress"]  // Array, but should be string
}

// ✅ CORRECT: String for select
properties: {
  Status: "In Progress"
}
```

#### Special property name handling:
```typescript
// ❌ WRONG: Using "id" or "url" directly
properties: {
  id: "123",
  url: "https://example.com"
}

// ✅ CORRECT: Prefix with "userDefined:"
properties: {
  "userDefined:id": "123",
  "userDefined:URL": "https://example.com"
}
```

---

### Checkbox validation error

**Error message:**
```
Invalid value for checkbox property "Is Active": expected "__YES__" or "__NO__"
```

**Solutions:**
```typescript
// ❌ WRONG: Various incorrect formats
properties: {
  "Is Active": true,           // Boolean
  "Is Active": "true",         // String
  "Is Active": "yes",          // Wrong string
  "Is Active": 1               // Number
}

// ✅ CORRECT: Use exact string values
properties: {
  "Is Active": "__YES__"   // Checked
}

properties: {
  "Is Active": "__NO__"    // Unchecked
}

// ✅ Also correct: null/undefined for empty
properties: {
  "Is Active": null        // Leave empty
}
```

---

## Database Schema Issues

### "Property not found in schema"

**Error message:**
```
Property "ProjectID" not in database schema
```

**Causes:**
1. Typo in property name
2. Using different property name than database defines
3. Property exists but was not included in fetch

**Solutions:**

```typescript
// First, always fetch to see exact property names
const db = await notion_notion-fetch({id: "database-id"});
console.log("Properties:", Object.keys(db.dataSources[0].schema));

// Then use exact names (case-sensitive)
// If schema has "Project ID", use exactly that:
properties: {
  "Project ID": "value"  // Exact match
}
```

---

### Wrong data_source_id vs database_id

**Error message:**
```
Cannot create page with database_id when database has multiple data sources
```

**Causes:**
1. Database has multiple "data sources" (collections)
2. Using `database_id` instead of `data_source_id` in parent
3. Using wrong data source ID

**Solutions:**

```typescript
// Fetch database to see data sources
const db = await notion_notion-fetch({id: "database-url"});

// Response shows:
// data-sources:
//   - collection://source1-id
//   - collection://source2-id

// ❌ WRONG: Using database_id for multi-source database
parent: {database_id: "database-id"}

// ✅ CORRECT: Use data_source_id
parent: {data_source_id: "source1-id"}

// For single-source databases, either works, but prefer data_source_id
```

---

## Content and Markdown Issues

### Toggle/Collapsible sections not working

**Problem:**
```
▶ My toggle
This content should be hidden
But it's showing normally
```

**Causes:**
1. Missing indentation on hidden content
2. Wrong character (not the actual toggle arrow)
3. Spaces instead of tabs

**Solutions:**

```typescript
// ❌ WRONG: No indentation
const content = `▶ Collapsed
Content here`;

// ❌ WRONG: Spaces for indentation (inconsistent)
const content = `▶ Collapsed
  Content line 1
  Content line 2`;

// ✅ CORRECT: Tab indentation
const content = `▶ Collapsed
\tContent line 1
\tContent line 2`;

// ✅ CORRECT: Build with proper indentation
function createToggle(title: string, body: string) {
  const indented = body
    .split('\n')
    .map(line => '\t' + line)
    .join('\n');
  return `▶ ${title}\n${indented}`;
}

const toggle = createToggle("Resources", "Budget: $X\nTeam: N people");
// Output: "▶ Resources\n\tBudget: $X\n\tTeam: N people"
```

---

### Links and special characters not rendering

**Solutions:**

```typescript
// ✅ Standard markdown links work
const content = `[Click here](https://example.com)`;

// ✅ Code blocks with backticks
const content = `\`\`\`typescript
const x = 1;
\`\`\``;

// ✅ Tables work
const content = `| Column 1 | Column 2 |
|----------|----------|
| Value 1  | Value 2  |`;

// ⚠️ Some HTML tags don't work - use markdown instead
// ❌ <a href="...">link</a>  // Won't work
// ✅ [link](url)             // Works

// ❌ <strong>text</strong>   // Won't work
// ✅ **text**                // Works
```

---

## Permission and Access Errors

### "Unauthorized" or "Not found"

**Error message:**
```
401 Unauthorized
or
Page not found
```

**Causes:**
1. Notion integration doesn't have permission to the page/database
2. Page/database has been deleted
3. Wrong ID or corrupted ID
4. Integration token is invalid

**Solutions:**

```typescript
// 1. Verify integration is shared with the resource
// In Notion: Open database → Settings → Share → Add integration

// 2. Verify ID format
// IDs are UUIDs, can have or without dashes:
// ✅ 238f4dc3b46280a5bda5c2a661bd7d1e
// ✅ 238f4dc3-b462-80a5-bda5-c2a661bd7d1e

// 3. If using URL, make sure it's complete
const pageUrl = "https://www.notion.so/page-title-238f4dc3b46280a5bda5c2a661bd7d1e";
const pageId = "238f4dc3b46280a5bda5c2a661bd7d1e";

// Both work:
await notion_notion-fetch({id: pageUrl});
await notion_notion-fetch({id: pageId});
```

---

## Performance and Rate Limits

### Rate limiting errors

**Error message:**
```
429 Too Many Requests
or
Rate limit exceeded
```

**Causes:**
1. Making too many requests per second
2. Not adding delays between batch operations

**Solutions:**

```typescript
// Implement throttling
async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Add delay between requests
for (const pageId of pageIds) {
  await notion_notion-fetch({id: pageId});
  await delay(100);  // 100ms between requests
}

// For batch operations, add delay between batches
for (let i = 0; i < pages.length; i += batchSize) {
  const batch = pages.slice(i, i + batchSize);
  await notion_notion-create-pages({pages: batch, parent: {...}});
  
  if (i + batchSize < pages.length) {
    await delay(1000);  // 1 second between batches
  }
}

// Rule of thumb:
// - Sequential single requests: 100-200ms delay
// - Batch operations: 1-2 seconds delay
```

---

### Timeout or slow responses

**Problem:**
```
Request timeout or very slow response
```

**Causes:**
1. Database has very large content
2. Network issues
3. Notion service temporarily slow

**Solutions:**

```typescript
// Set reasonable timeout expectations
const pageWithHugecontent = await notion_notion-fetch({
  id: "page-with-lots-of-content"
  // API might take 5-10 seconds
});

// For large content operations, break into smaller chunks
// Instead of: update entire page at once
// Do: update sections separately
await notion_notion-update-page({
  page_id: pageId,
  command: "insert_content_after",
  selection_with_ellipsis: "## Section...",
  new_str: "New section content"  // Smaller update
});

// Monitor performance
console.time("notion-fetch");
const page = await notion_notion-fetch({id: pageId});
console.timeEnd("notion-fetch");
```

---

## Debugging Workflow

When you encounter an error:

1. **Read the error message carefully** - It usually tells you exactly what's wrong
2. **Check the schema** - Fetch the database/page to understand structure
3. **Validate types** - Use the validation script to catch issues early:
   ```bash
   pnpm dlx tsx scripts/validate-properties.ts <db-id> '{"Title":"Value"}'
   ```
4. **Check examples** - See [examples.md](examples.md) for similar operations
5. **Test with minimal case** - Try simplest version first, then add complexity
6. **Check Notion documentation** - For latest API changes

---

## Quick Reference: Common Fixes

| Error | Fix |
|-------|-----|
| `Invalid multi_select` | Use exact option name from schema, as single string |
| `Invalid input` | Check property types, use expanded format for dates |
| `Not found` | Verify ID, ensure integration has permission |
| `Validation error` | Fetch database schema first, match property names exactly |
| `Checkbox error` | Use `"__YES__"` or `"__NO__"` only |
| `Toggle not showing` | Indent toggle content with tabs |
| `Rate limit` | Add 100-200ms delay between requests |
| `Property not in schema` | Check exact property name (case-sensitive) |
