# Neon Database Management Skill

<!--
╔══════════════════════════════════════════════════════════════════════════════╗
║                           ⚙️ PROJECT CONFIGURATION                           ║
║                                                                              ║
║  Customize these values for your project before using this skill:           ║
╚══════════════════════════════════════════════════════════════════════════════╝
-->

## Project Configuration

```yaml
# ─────────────────────────────────────────────────────────────────────────────
# REQUIRED: Set these values for your project
# ─────────────────────────────────────────────────────────────────────────────

PROJECT_NAME: "The Simpsons API" # Your project's display name
PROJECT_SLUG: "thesimpsonsapi" # URL-friendly identifier (lowercase, no spaces)
DB_SCHEMA: "the_simpson" # PostgreSQL schema name
NEON_PROJECT_ID: "wispy-poetry-52762475" # Neon project ID (from dashboard)

# ─────────────────────────────────────────────────────────────────────────────
# OPTIONAL: Customize paths if your project structure differs
# ─────────────────────────────────────────────────────────────────────────────

DB_CONFIG_PATH: "app/_lib/db.ts" # Database connection file
DB_SCHEMA_PATH: "app/_lib/db-schema.ts" # Schema constants file
DB_UTILS_PATH: "app/_lib/db-utils.ts" # Query utilities file
DB_TYPES_PATH: "app/_lib/db-types.ts" # TypeScript types file
REPOSITORIES_PATH: "app/_lib/repositories.ts" # Data access layer
SERVER_ACTIONS_PATH: "app/_actions" # Server actions directory

# ─────────────────────────────────────────────────────────────────────────────
# TABLES: Define your project's tables (add/remove as needed)
# ─────────────────────────────────────────────────────────────────────────────

TABLES:
  # Core data tables (synced from external source)
  - characters
  - episodes
  - locations

  # User data tables
  - users
  - user_episode_progress
  - character_follows
  - character_comments
  - character_favorites
  - trivia_facts
  - diary_entries
  - quote_collections
  - collection_quotes
```

---

## Description

Comprehensive knowledge and utilities for managing Neon PostgreSQL database in **{{PROJECT_NAME}}**. This skill encapsulates the complete database configuration, schema management, query patterns, and verification processes specific to this application's Neon setup.

## Context

**{{PROJECT_NAME}}** uses **Neon** as its serverless PostgreSQL database provider with a specific architecture designed for optimal performance in serverless environments (Vercel).

### Key Configuration

- **Provider:** Neon (Serverless PostgreSQL)
- **Schema:** `{{DB_SCHEMA}}`
- **Connection Strategy:** HTTP-based queries via `poolQueryViaFetch = true`
- **Pattern:** Fully qualified table names (schema.table)
- **Centralization:** All schema configuration in `{{DB_SCHEMA_PATH}}`

## Architecture Overview

### Connection Flow

```
Next.js App → @neondatabase/serverless → Neon PostgreSQL
            ↓                           ↓
    poolQueryViaFetch = true      Schema: {{DB_SCHEMA}}
    HTTP Direct Connection        Tables: {{TABLES}}
```

### Critical Files

| File                           | Purpose                                    |
| ------------------------------ | ------------------------------------------ |
| `{{DB_CONFIG_PATH}}`           | Pool configuration with HTTP fetch enabled |
| `{{DB_SCHEMA_PATH}}`           | ⭐ Centralized schema and table constants  |
| `{{DB_UTILS_PATH}}`            | Query utilities with validation & logging  |
| `{{REPOSITORIES_PATH}}`        | Data access layer with type-safe queries   |
| `{{SERVER_ACTIONS_PATH}}/*.ts` | Server actions for mutations               |

## The Critical Problem We Solved

### The Issue

When using Neon with `poolQueryViaFetch = true` (HTTP mode), the driver **ignores session parameters** like `search_path` passed in the connection URL. This caused queries to fail silently in production because PostgreSQL couldn't find tables in the `{{DB_SCHEMA}}` schema.

### The Solution

Use **fully qualified table names** in ALL queries:

```typescript
// ❌ WRONG (depends on search_path, breaks in HTTP mode)
SELECT * FROM characters

// ✅ CORRECT (explicit schema, works everywhere)
SELECT * FROM {{DB_SCHEMA}}.characters
```

### Our Implementation

Instead of hardcoding `{{DB_SCHEMA}}.` everywhere, we centralized it:

```typescript
// {{DB_SCHEMA_PATH}}
export const DB_SCHEMA = "{{DB_SCHEMA}}" as const;

export const TABLES = {
  characters: `${DB_SCHEMA}.characters`,
  episodes: `${DB_SCHEMA}.episodes`,
  users: `${DB_SCHEMA}.users`,
  // ... add your project's tables
} as const;

// Usage in queries
import { TABLES } from "@/{{DB_SCHEMA_PATH}}";
await query(`SELECT * FROM ${TABLES.characters}`);
```

## Database Schema Structure

> **Note:** The tables below are examples from {{PROJECT_NAME}}. Customize the `TABLES` section in the Project Configuration above to match your project's actual tables.

### Core Tables (Synced from External Source)

```sql
{{DB_SCHEMA}}.characters      -- Character data
{{DB_SCHEMA}}.episodes        -- Episode catalog
{{DB_SCHEMA}}.locations       -- Location data
```

### User Data Tables

```sql
{{DB_SCHEMA}}.users                   -- User accounts
{{DB_SCHEMA}}.user_episode_progress   -- User progress tracking
{{DB_SCHEMA}}.character_follows       -- Following relationships
{{DB_SCHEMA}}.character_comments      -- User comments
{{DB_SCHEMA}}.character_favorites     -- Favorites
{{DB_SCHEMA}}.trivia_facts            -- Community trivia
{{DB_SCHEMA}}.diary_entries           -- User diary
{{DB_SCHEMA}}.quote_collections       -- Quote collections
{{DB_SCHEMA}}.collection_quotes       -- Quotes in collections
```

## Best Practices

### 1. Always Use TABLES Constants

```typescript
// ✅ GOOD
import { TABLES } from "@/{{DB_SCHEMA_PATH.replace('.ts', '')}}";
await pool.query(`SELECT * FROM ${TABLES.characters} WHERE id = $1`, [id]);

// ❌ BAD
await pool.query(`SELECT * FROM {{DB_SCHEMA}}.characters WHERE id = $1`, [id]);

// ❌ WORSE
await pool.query(`SELECT * FROM characters WHERE id = $1`, [id]);
```

### 2. Use Type-Safe Repositories

```typescript
// ✅ GOOD - Use existing repositories
import { findCharacterById } from "@/{{REPOSITORIES_PATH.replace('.ts', '')}}";
const character = await findCharacterById(1);

// ⚠️ Only if repository doesn't exist
import { queryOne } from "@/{{DB_UTILS_PATH.replace('.ts', '')}}";
import { TABLES } from "@/{{DB_SCHEMA_PATH.replace('.ts', '')}}";
const result = await queryOne(
  `SELECT * FROM ${TABLES.characters} WHERE id = $1`,
  [1],
);
```

### 3. Server Actions Pattern

```typescript
"use server";

import { execute } from "@/{{DB_UTILS_PATH.replace('.ts', '')}}";
import { TABLES } from "@/{{DB_SCHEMA_PATH.replace('.ts', '')}}";
import { getCurrentUser } from "@/app/_lib/auth";
import { revalidatePath } from "next/cache";

export async function myAction(data: SomeData) {
  const user = await getCurrentUser();

  await execute(
    `INSERT INTO ${TABLES.my_table} (user_id, field) VALUES ($1, $2)`,
    [user.id, data.field],
  );

  revalidatePath("/my-page");
}
```

### 4. Query Utilities

```typescript
// Read queries
import { query, queryOne } from "@/{{DB_UTILS_PATH.replace('.ts', '')}}";

// Multiple rows
const characters = await query<DBCharacter>(
  `SELECT * FROM ${TABLES.characters} LIMIT 10`,
);

// Single row (returns null if not found)
const character = await queryOne<DBCharacter>(
  `SELECT * FROM ${TABLES.characters} WHERE id = $1`,
  [1],
);

// Write operations
import { execute } from "@/{{DB_UTILS_PATH.replace('.ts', '')}}";

const rowCount = await execute(
  `DELETE FROM ${TABLES.diary_entries} WHERE id = $1`,
  [entryId],
);
```

## Development Features

### Automatic Validation (Development Only)

The system automatically validates queries in development:

```typescript
// This will trigger a warning in dev console:
await query(`SELECT * FROM users`); // ⚠️ Unqualified table name

// This is correct:
await query(`SELECT * FROM ${TABLES.users}`); // ✅ No warning
```

### Query Logging (Development Only)

All queries are logged with params for easy debugging:

```console
✅ Query executed: {
  sql: 'SELECT * FROM the_simpson.characters WHERE id = $1',
  params: [1]
}
```

Error logging includes context:

```console
❌ Query failed: {
  sql: 'SELECT * FROM the_simpson.invalid_table',
  params: [],
  error: 'relation "the_simpson.invalid_table" does not exist'
}
```

## Verification Process

### Quick Configuration Check (No Database Connection Required)

Run the verification script to ensure code is properly configured:

```bash
node .github/skills/neon-database-management/check-db-config.js
```

This checks:

- ✅ All required files exist
- ✅ Schema is correctly configured (`{{DB_SCHEMA}}`)
- ✅ All Server Actions import and use TABLES
- ✅ repositories.ts uses TABLES
- ✅ No hardcoded schema references
- ✅ Validation and logging functions are present

### Full Database Verification (Requires DATABASE_URL)

For runtime verification with actual database connection:

```bash
pnpm dlx tsx scripts/verify-db.ts
```

This checks:

- ✅ Connection to Neon
- ✅ Schema `{{DB_SCHEMA}}` exists
- ✅ All expected tables present
- ✅ Sample queries work
- ✅ Row counts for critical tables

## Common Tasks

### Adding a New Table

1. **Update db-schema.ts:**

   ```typescript
   // {{DB_SCHEMA_PATH}}
   export const TABLES = {
     // ... existing tables
     myNewTable: table("my_new_table"),
   } as const;
   ```

2. **Create type in db-types.ts:**

   ```typescript
   // {{DB_TYPES_PATH}}
   export interface DBMyNewTable extends QueryResultRow {
     id: number;
     field1: string;
     created_at: Date;
   }
   ```

3. **Add repository functions:**
   ```typescript
   // {{REPOSITORIES_PATH}}
   export async function findMyNewTableData(): Promise<DBMyNewTable[]> {
     return query<DBMyNewTable>(
       `SELECT * FROM ${TABLES.myNewTable} ORDER BY created_at DESC`,
     );
   }
   ```

### Changing the Schema Name

If you need to change from `{{DB_SCHEMA}}` to another schema:

1. Edit ONE line in `{{DB_SCHEMA_PATH}}`:

   ```typescript
   export const DB_SCHEMA = "new_schema_name" as const;
   ```

2. All queries automatically use the new schema!

### Debugging Query Issues

1. **Check development console** for validation warnings
2. **Review query logs** to see what SQL is being executed
3. **Run verification script** to ensure configuration is correct:
   ```bash
   node .github/skills/neon-database-management/check-db-config.js
   ```
4. **Verify Neon connection** if DATABASE_URL is available:
   ```bash
   pnpm dlx tsx scripts/verify-db.ts
   ```

## Migration Checklist

When creating new database operations:

- [ ] Import `TABLES` from `@/{{DB_SCHEMA_PATH.replace('.ts', '')}}`
- [ ] Use `${TABLES.tableName}` instead of hardcoding
- [ ] Use `query`, `queryOne`, or `execute` from `{{DB_UTILS_PATH.replace('.ts', '')}}`
- [ ] Add type for result using interfaces from `{{DB_TYPES_PATH}}`
- [ ] Test in development to see validation warnings
- [ ] Run `node .github/skills/neon-database-management/check-db-config.js`
- [ ] Verify no hardcoded `{{DB_SCHEMA}}.` in your code

## Neon-Specific Considerations

### Connection Pooling

```typescript
// ✅ CORRECT - Use pool.query() directly
const result = await pool.query(sql, params);

// ❌ AVOID - pool.connect() has overhead in serverless
const client = await pool.connect();
const result = await client.query(sql, params);
client.release();
```

### Environment Variables

```typescript
// Required in .env.local
DATABASE_URL=postgresql://user:pass@ep-xxx.us-west-2.aws.neon.tech/neondb?sslmode=require

// Optional (for reference)
NEXT_PUBLIC_NEON_PROJECT=project-id-here
```

### Performance Tips

- ✅ HTTP mode (`poolQueryViaFetch = true`) is fastest for Vercel
- ✅ Qualified table names avoid schema lookup overhead
- ✅ Use `pool.query()` for one-off queries
- ✅ Prepare statements are automatic in Neon
- ⚠️ Avoid `pool.connect()` unless you need transactions

## Troubleshooting

### Problem: "relation does not exist"

**Cause:** Unqualified table name or wrong schema
**Fix:**

```typescript
// Change this:
await query(`SELECT * FROM characters`);

// To this:
await query(`SELECT * FROM ${TABLES.characters}`);
```

### Problem: "Query works in dev but fails in production"

**Cause:** `search_path` ignored in HTTP mode
**Fix:** Always use qualified table names via `TABLES`

### Problem: "DATABASE_URL not defined"

**Cause:** Missing environment variable
**Fix:** Add to `.env.local`:

```
DATABASE_URL=your-neon-connection-string
```

### Problem: "Schema validation warnings"

**Cause:** Hardcoded table names detected
**Fix:** Run verification and update to use `TABLES`:

```bash
node .github/skills/neon-database-management/check-db-config.js
```

### Problem: "Connection timeout"

**Cause:** Cold start, network issues, or too many connections
**Fix:**

```typescript
// 1. Increase timeout in pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // 10 seconds
});

// 2. Use HTTP mode (already configured)
neonConfig.poolQueryViaFetch = true;

// 3. Check Neon dashboard for connection limits
// Free tier: 100 connections max
```

### Problem: "Too many connections"

**Cause:** Serverless functions opening many parallel connections
**Fix:**

```typescript
// Already solved by HTTP mode
neonConfig.poolQueryViaFetch = true;

// Each query is a stateless HTTP request
// No persistent connections needed
```

### Problem: "Permission denied for schema"

**Cause:** Role doesn't have access to schema
**Fix:** Via Neon MCP or SQL console:

```sql
GRANT USAGE ON SCHEMA {{DB_SCHEMA}} TO neondb_owner;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA {{DB_SCHEMA}} TO neondb_owner;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA {{DB_SCHEMA}} TO neondb_owner;
```

### Problem: "Column does not exist"

**Cause:** Schema drift between code and database
**Fix:**

```bash
# 1. Check actual schema
mcp_neon_describe_table_schema

# 2. Compare with type definition in db-types.ts

# 3. Run migration if needed
mcp_neon_run_sql with ALTER TABLE statement
```

### Problem: "Duplicate key violates unique constraint"

**Cause:** Trying to insert existing primary key
**Fix:**

```typescript
// Use UPSERT pattern
await execute(
  `INSERT INTO ${TABLES.characters} (id, name)
   VALUES ($1, $2)
   ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
  [id, name],
);
```

---

## Performance Tuning

### Query Optimization Best Practices

#### 1. Index Management

```sql
-- Check existing indexes
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = '{{DB_SCHEMA}}'
ORDER BY tablename, indexname;

-- Create index for frequent queries
CREATE INDEX CONCURRENTLY idx_characters_name
ON {{DB_SCHEMA}}.characters(name);

-- Create composite index for filtered queries
CREATE INDEX CONCURRENTLY idx_episodes_season_number
ON {{DB_SCHEMA}}.episodes(season, episode_number);

-- Partial index for common filter
CREATE INDEX CONCURRENTLY idx_users_active
ON {{DB_SCHEMA}}.users(id)
WHERE deleted_at IS NULL;
```

#### 2. Query Analysis

```typescript
// Use EXPLAIN ANALYZE for slow queries
// Via Neon MCP:
mcp_neon_explain_sql_statement({
  params: {
    projectId: "{{NEON_PROJECT_ID}}",
    sql: "SELECT * FROM {{DB_SCHEMA}}.characters WHERE name LIKE '%Simpson%'",
    analyze: true,
  },
});

// Look for:
// - Seq Scan (consider adding index)
// - High cost numbers
// - Rows estimate vs actual mismatch
// - Nested loops on large tables
```

#### 3. Connection Pool Optimization

```typescript
// Optimal pool settings for Vercel
import { Pool, neonConfig } from "@neondatabase/serverless";

neonConfig.poolQueryViaFetch = true; // HTTP mode - best for serverless

// No pool.connect() needed - each query is independent
// This avoids connection overhead in serverless
```

#### 4. Query Patterns for Performance

```typescript
// ❌ SLOW: N+1 queries
for (const char of characters) {
  const episodes = await query(
    `SELECT * FROM ${TABLES.episodes} WHERE character_id = $1`,
    [char.id],
  );
}

// ✅ FAST: Single query with JOIN
const data = await query(`
  SELECT c.*, e.title as episode_title
  FROM ${TABLES.characters} c
  LEFT JOIN ${TABLES.episodes} e ON e.character_id = c.id
`);

// ✅ FAST: Batch query
const characterIds = characters.map((c) => c.id);
const episodes = await query(
  `SELECT * FROM ${TABLES.episodes} WHERE character_id = ANY($1)`,
  [characterIds],
);
```

#### 5. Pagination Best Practices

```typescript
// ❌ SLOW for large offsets
await query(`SELECT * FROM ${TABLES.characters} LIMIT 20 OFFSET 10000`);

// ✅ FAST: Cursor-based pagination
await query(
  `
  SELECT * FROM ${TABLES.characters}
  WHERE id > $1
  ORDER BY id
  LIMIT 20
`,
  [lastSeenId],
);

// ✅ FAST: Keyset pagination for sorted results
await query(
  `
  SELECT * FROM ${TABLES.characters}
  WHERE (created_at, id) < ($1, $2)
  ORDER BY created_at DESC, id DESC
  LIMIT 20
`,
  [lastCreatedAt, lastId],
);
```

### Slow Query Detection

Use Neon MCP to identify slow queries:

```typescript
// List slow queries from pg_stat_statements
mcp_neon_list_slow_queries({
  params: {
    projectId: "{{NEON_PROJECT_ID}}",
    minExecutionTime: 100, // ms
    limit: 10,
  },
});
```

---

## Backup and Disaster Recovery

### Neon Branching for Backups

Neon's branching creates instant point-in-time copies:

```typescript
// Create backup branch before risky operation
mcp_neon_create_branch({
  params: {
    projectId: "{{NEON_PROJECT_ID}}",
    branchName: "backup-2026-01-14",
    parentBranchId: "main", // or specific branch ID
  },
});

// After verification, delete old backups
mcp_neon_delete_branch({
  params: {
    projectId: "{{NEON_PROJECT_ID}}",
    branchId: "backup-old-branch-id",
  },
});
```

### Point-in-Time Recovery

Neon supports PITR with branching:

```typescript
// Create branch from specific point in time
// (Check Neon dashboard for exact timestamp options)

// Via Neon Console:
// 1. Go to Branches
// 2. Create branch → From timestamp
// 3. Select the recovery point
```

### Data Export for Offsite Backup

```bash
# Export using pg_dump (requires psql installed)
pg_dump "$DATABASE_URL" --schema={{DB_SCHEMA}} --format=custom -f backup.dump

# Export to SQL
pg_dump "$DATABASE_URL" --schema={{DB_SCHEMA}} --format=plain -f backup.sql

# Export specific table
pg_dump "$DATABASE_URL" --table={{DB_SCHEMA}}.characters -f characters.sql
```

### Pre-Migration Backup Checklist

- [ ] Create backup branch in Neon
- [ ] Note current row counts for critical tables
- [ ] Document current schema state
- [ ] Test rollback procedure on branch
- [ ] Have connection string to backup branch ready

---

## Data Seeding and Fixtures

### Development Data Setup

```typescript
// scripts/seed.ts (or your preferred location)
import { execute, query } from "@/{{DB_UTILS_PATH.replace('.ts', '')}}";
import { TABLES } from "@/{{DB_SCHEMA_PATH.replace('.ts', '')}}";

export async function seedDatabase() {
  // Check if already seeded
  const existing = await query(`SELECT COUNT(*) FROM ${TABLES.characters}`);
  if (parseInt(existing[0].count) > 0) {
    console.log("Database already seeded");
    return;
  }

  // Seed your project's data
  const items = [
    { id: 1, name: "Item 1", description: "Description 1" },
    { id: 2, name: "Item 2", description: "Description 2" },
    // ... add your seed data
  ];

  for (const item of items) {
    await execute(
      `INSERT INTO ${TABLES.your_table} (id, name, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [item.id, item.name, item.description],
    );
  }

  console.log("Database seeded successfully");
}
```

### Fixture Files Pattern

```
scripts/
├── fixtures/
│   ├── table1.json
│   ├── table2.json
│   └── table3.json
├── seed.ts
└── reset-db.ts
```

**Example fixture (table1.json):**

```json
[
  {
    "id": 1,
    "name": "Item 1",
    "field": "value1"
  },
  {
    "id": 2,
    "name": "Item 2",
    "field": "value2"
  }
]
```

**seed.ts:**

```typescript
import { execute } from "@/{{DB_UTILS_PATH.replace('.ts', '')}}";
import { TABLES } from "@/{{DB_SCHEMA_PATH.replace('.ts', '')}}";
import table1Data from "./fixtures/table1.json";
import table2Data from "./fixtures/table2.json";

async function seed() {
  console.log("Starting database seed...");

  // Seed table1
  for (const item of table1Data) {
    await execute(
      `INSERT INTO ${TABLES.table1} (id, name, field)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         field = EXCLUDED.field`,
      [item.id, item.name, item.field],
    );
  }
  console.log(`✓ Seeded ${table1Data.length} items to table1`);

  // Add more tables as needed...

  console.log("Seed complete!");
}

seed().catch(console.error);
```

### Reset Database Script

```typescript
// scripts/reset-db.ts
import { execute } from "@/{{DB_UTILS_PATH.replace('.ts', '')}}";
import { TABLES, DB_SCHEMA } from "@/{{DB_SCHEMA_PATH.replace('.ts', '')}}";

async function resetDatabase() {
  console.log("⚠️  Resetting database...");

  // Truncate in order (respecting foreign keys)
  // IMPORTANT: Order matters - truncate dependent tables first
  const tablesToTruncate = [
    // Add your project's tables in dependency order
    // Child tables first, then parent tables
    TABLES.child_table,
    TABLES.parent_table,
  ];

  for (const table of tablesToTruncate) {
    await execute(`TRUNCATE ${table} CASCADE`);
    console.log(`✓ Truncated ${table}`);
  }

  console.log("Database reset complete!");
}

resetDatabase().catch(console.error);
```

### Running Seeds

```bash
# Seed development database
pnpm dlx tsx scripts/seed.ts

# Reset and reseed
pnpm dlx tsx scripts/reset-db.ts && pnpm dlx tsx scripts/seed.ts
```

---

## Query Examples by Table

> **Note:** These examples use table names from {{PROJECT_NAME}}. Replace with your actual table names defined in the `TABLES` configuration.

### Basic CRUD Operations

```typescript
import {
  query,
  queryOne,
  execute,
} from "@/{{DB_UTILS_PATH.replace('.ts', '')}}";
import { TABLES } from "@/{{DB_SCHEMA_PATH.replace('.ts', '')}}";

// Get all records
const items = await query(`SELECT * FROM ${TABLES.your_table} ORDER BY name`);

// Get by ID
const item = await queryOne(
  `SELECT * FROM ${TABLES.your_table} WHERE id = $1`,
  [1],
);

// Search with ILIKE
const results = await query(
  `SELECT * FROM ${TABLES.your_table} WHERE name ILIKE $1`,
  ["%search_term%"],
);

// Insert
await execute(
  `INSERT INTO ${TABLES.your_table} (name, field) VALUES ($1, $2)`,
  ["Name", "value"],
);

// Update
await execute(`UPDATE ${TABLES.your_table} SET name = $1 WHERE id = $2`, [
  "New Name",
  1,
]);

// Delete
await execute(`DELETE FROM ${TABLES.your_table} WHERE id = $1`, [1]);
```

### JOIN Queries

```typescript
// Get related data with JOIN
const withRelated = await query(
  `
  SELECT 
    t1.*,
    t2.name as related_name
  FROM ${TABLES.table1} t1
  LEFT JOIN ${TABLES.table2} t2 ON t2.table1_id = t1.id
  WHERE t1.user_id = $1
  ORDER BY t1.created_at DESC
`,
  [userId],
);

// Aggregation with GROUP BY
const withStats = await query(`
  SELECT 
    t1.*,
    COUNT(t2.id) as related_count
  FROM ${TABLES.table1} t1
  LEFT JOIN ${TABLES.table2} t2 ON t2.table1_id = t1.id
  GROUP BY t1.id
  ORDER BY related_count DESC
`);
```

### Upsert Pattern

```typescript
// Insert or update on conflict
await execute(
  `INSERT INTO ${TABLES.your_table} (id, name, field)
   VALUES ($1, $2, $3)
   ON CONFLICT (id) DO UPDATE SET
     name = EXCLUDED.name,
     field = EXCLUDED.field`,
  [id, name, field],
);
```

## When to Use This Skill

Use this skill when:

- ✅ Creating new database queries
- ✅ Adding new tables or schemas
- ✅ Debugging database connection issues
- ✅ Verifying database configuration
- ✅ Optimizing query performance
- ✅ Understanding why `search_path` doesn't work
- ✅ Migrating from hardcoded schemas to centralized config
- ✅ Setting up new developers on the project
- ✅ Before deploying to production
- ✅ Investigating production database errors

## Success Metrics

A properly configured Neon setup should have:

- ✅ 0 hardcoded schema references
- ✅ All queries using `TABLES.*`
- ✅ Validation warnings only in development
- ✅ Query logs for debugging
- ✅ Pass `check-db-config.js` verification
- ✅ All server actions importing `TABLES`
- ✅ Type-safe queries with `db-types.ts`

## References

- [Neon Documentation](https://neon.tech/docs)
- [Neon Serverless Driver](https://github.com/neondatabase/serverless)
- [docs/DEPLOYMENT_LESSONS.md](../../docs/DEPLOYMENT_LESSONS.md) - Project learnings
- [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) - System design
- [{{DB_SCHEMA_PATH}}](../../{{DB_SCHEMA_PATH}}) - Source of truth for schema

---

**Last Updated:** February 11, 2026  
**Maintained By:** Development Team  
**Status:** ✅ Production Ready  
**Project:** {{PROJECT_NAME}}
