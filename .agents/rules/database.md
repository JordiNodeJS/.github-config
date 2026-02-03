# Database Rules

This file contains database design patterns, Prisma ORM usage guidelines, and data modeling rules for the Movies Tracker project.

## Overview

Movies Tracker uses **Neon Serverless Postgres** as the database with **Prisma ORM** for type-safe database access. The database architecture emphasizes denormalization for performance and serverless-optimized patterns.

## Technology Stack

- **Database**: Neon Serverless Postgres
- **ORM**: Prisma (latest version)
- **Adapter**: `@prisma/adapter-neon` for serverless compatibility
- **Connection**: Pooled connections via Neon's serverless driver

## Prisma Client Configuration

### Singleton Pattern

**Always** use the Prisma client singleton from `src/lib/prisma.ts`:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

### Usage Pattern

```typescript
// Good ✓
import prisma from "@/lib/prisma";

const users = await prisma.user.findMany();

// Bad ✗
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient(); // Creates new connection
```

## Schema Design Principles

### 1. Denormalization for Performance

Store frequently accessed data directly in related models to minimize API calls and joins.

**Example:**
```prisma
model Watchlist {
  id          String   @id @default(cuid())
  userId      String
  movieId     Int
  
  // Denormalized fields from TMDB
  title       String
  posterPath  String?
  voteAverage Float?
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  
  @@unique([userId, movieId])
  @@index([userId])
}
```

**Why denormalize?**
- Reduces TMDB API calls
- Faster query performance (no joins with external API)
- Data available even if TMDB is down
- Historical preservation (even if TMDB data changes)

### 2. ID Generation Strategy

**User-Related Models**: Use `cuid()` for security and uniqueness

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}
```

**External IDs**: Use native types when referencing external services

```prisma
model Watchlist {
  id      String @id @default(cuid())
  movieId Int    // TMDB movie ID (their system)
}
```

**Why cuid() for users?**
- Prevents enumeration attacks (vs. auto-increment)
- Globally unique identifiers
- URL-safe and sortable
- Better for distributed systems

### 3. Relationships and Cascading

**Always define proper relations with cascade behavior:**

```prisma
model User {
  id        String      @id @default(cuid())
  watchlist Watchlist[]
}

model Watchlist {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Cascade Rules:**
- `onDelete: Cascade` - Delete child records when parent is deleted
- `onUpdate: Cascade` - Update child records when parent ID changes
- Use `SetNull` only when child can exist without parent

### 4. Indexes for Performance

**Index fields used in WHERE clauses and JOINs:**

```prisma
model Watchlist {
  userId  String
  movieId Int
  
  @@unique([userId, movieId])  // Prevents duplicates
  @@index([userId])             // Fast user queries
  @@index([movieId])            // Fast movie queries
}
```

**Index Guidelines:**
- Index foreign keys
- Index frequently queried fields
- Use composite indexes for multi-column queries
- Use unique indexes to enforce constraints

## Query Patterns

### 1. Select Only Required Fields

**Always use `select` to fetch only needed data:**

```typescript
// Good ✓
const movies = await prisma.watchlist.findMany({
  where: { userId },
  select: {
    id: true,
    movieId: true,
    title: true,
    posterPath: true,
  },
});

// Bad ✗
const movies = await prisma.watchlist.findMany({
  where: { userId },
}); // Fetches all fields unnecessarily
```

### 2. Use Include for Relations

**Fetch related data with `include`:**

```typescript
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    watchlist: {
      select: {
        movieId: true,
        title: true,
        posterPath: true,
      },
    },
  },
});
```

### 3. Pagination for Large Datasets

**Use `skip` and `take` for pagination:**

```typescript
const PAGE_SIZE = 20;

const movies = await prisma.watchlist.findMany({
  where: { userId },
  skip: page * PAGE_SIZE,
  take: PAGE_SIZE,
  orderBy: { createdAt: "desc" },
});
```

### 4. Counting Records

**Use `count` for efficient counting:**

```typescript
// Good ✓
const count = await prisma.watchlist.count({
  where: { userId },
});

// Bad ✗
const items = await prisma.watchlist.findMany({ where: { userId } });
const count = items.length; // Fetches all records
```

### 5. Transactions for Multi-Step Operations

**Use transactions for atomic operations:**

```typescript
await prisma.$transaction(async (tx) => {
  // Create user
  const user = await tx.user.create({
    data: { email, password: hashedPassword },
  });

  // Create default watchlist
  await tx.watchlist.create({
    data: {
      userId: user.id,
      movieId: 0,
      title: "Welcome",
    },
  });
});
```

## Database Migrations

### Development Workflow

```bash
# 1. Make changes to prisma/schema.prisma

# 2. Sync with database (development)
pnpm db:push

# 3. Generate Prisma Client
pnpm prisma generate

# 4. Open Prisma Studio to inspect data
pnpm db:studio
```

### Production Workflow

```bash
# 1. Create migration
pnpm prisma migrate dev --name description_of_change

# 2. Apply migration to production
pnpm prisma migrate deploy
```

### Migration Best Practices

- **Small, incremental changes** - One logical change per migration
- **Descriptive names** - Use clear, action-oriented migration names
- **Test migrations** - Always test on staging before production
- **Backup data** - Backup before destructive migrations
- **Rollback plan** - Have a rollback strategy for each migration

## Error Handling

### Connection Errors (Neon Serverless)

Neon connections can fail during cold starts or scaling:

```typescript
async function fetchWithRetry<T>(
  operation: () => Promise<T>,
  retries = 3
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && error.code === "P1001") {
      // Connection error - retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchWithRetry(operation, retries - 1);
    }
    throw error;
  }
}

// Usage
const users = await fetchWithRetry(() =>
  prisma.user.findMany({ where: { email } })
);
```

### Common Prisma Errors

```typescript
try {
  await prisma.user.create({
    data: { email, password },
  });
} catch (error) {
  // Unique constraint violation
  if (error.code === "P2002") {
    throw new Error("Email already exists");
  }
  
  // Foreign key constraint violation
  if (error.code === "P2003") {
    throw new Error("Related record not found");
  }
  
  // Record not found
  if (error.code === "P2025") {
    throw new Error("Record not found");
  }
  
  throw error;
}
```

## Data Validation

### Server-Side Validation

**Always validate data before database operations:**

```typescript
"use server";

import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function createUser(formData: FormData) {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  // Validate
  const validated = userSchema.parse(data);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: validated.email,
      password: await hashPassword(validated.password),
    },
  });

  return user;
}
```

### Database-Level Constraints

Use Prisma schema constraints as the last line of defense:

```prisma
model User {
  email    String @unique
  password String
  
  // Database will enforce uniqueness
  @@index([email])
}
```

## Performance Optimization

### 1. Connection Pooling

Neon adapter automatically handles connection pooling. Configure pool size in production:

```typescript
const pool = new Pool({
  connectionString,
  max: 10, // Maximum connections
  idleTimeoutMillis: 30000,
});
```

### 2. Query Optimization

**Use `select` to reduce data transfer:**

```typescript
// Fetches only 3 fields
const users = await prisma.user.findMany({
  select: { id: true, email: true, createdAt: true },
});
```

**Use `where` to filter at database level:**

```typescript
// Good ✓
const activeUsers = await prisma.user.findMany({
  where: { isActive: true },
});

// Bad ✗
const allUsers = await prisma.user.findMany();
const activeUsers = allUsers.filter(u => u.isActive);
```

### 3. Batch Operations

**Use `createMany` for bulk inserts:**

```typescript
await prisma.watchlist.createMany({
  data: movies.map(movie => ({
    userId,
    movieId: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
  })),
  skipDuplicates: true,
});
```

### 4. Caching Strategy

Combine database queries with Next.js caching:

```typescript
"use cache";

export async function getUserWatchlist(userId: string) {
  const watchlist = await prisma.watchlist.findMany({
    where: { userId },
    select: {
      movieId: true,
      title: true,
      posterPath: true,
    },
  });

  return watchlist;
}

// Revalidate after mutations
revalidateTag(`watchlist-${userId}`);
```

## Security Best Practices

### 1. Never Trust Client Input

```typescript
// Bad ✗
export async function deleteUser(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
}

// Good ✓
export async function deleteUser() {
  const user = await ensureUser(); // Verify authentication
  await prisma.user.delete({ where: { id: user.id } });
}
```

### 2. Sanitize User Input

```typescript
import { sanitize } from "string-sanitizer";

export async function searchMovies(query: string) {
  const sanitized = sanitize(query);
  
  const results = await prisma.watchlist.findMany({
    where: {
      title: {
        contains: sanitized,
        mode: "insensitive",
      },
    },
  });
  
  return results;
}
```

### 3. Use Parameterized Queries

Prisma automatically uses parameterized queries, but avoid raw SQL when possible:

```typescript
// Good ✓
const users = await prisma.user.findMany({
  where: { email: userEmail },
});

// Avoid if possible
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userEmail}
`;
```

## Common Pitfalls

### ❌ Don't: Create multiple Prisma instances

```typescript
// BAD
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
```

### ✅ Do: Use singleton instance

```typescript
// GOOD
import prisma from "@/lib/prisma";
```

### ❌ Don't: Fetch all fields unnecessarily

```typescript
// BAD
const users = await prisma.user.findMany();
```

### ✅ Do: Select only required fields

```typescript
// GOOD
const users = await prisma.user.findMany({
  select: { id: true, email: true },
});
```

### ❌ Don't: Use auto-increment for user IDs

```prisma
// BAD
model User {
  id Int @id @default(autoincrement())
}
```

### ✅ Do: Use cuid() for security

```prisma
// GOOD
model User {
  id String @id @default(cuid())
}
```

### ❌ Don't: Forget cascade deletes

```prisma
// BAD
model Watchlist {
  user User @relation(fields: [userId], references: [id])
}
```

### ✅ Do: Define cascade behavior

```prisma
// GOOD
model Watchlist {
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Environment Variables

```bash
# .env.local
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

**Production Configuration:**
- Use Neon connection string from dashboard
- Enable SSL in production
- Configure connection pooling
- Set up read replicas if needed

## Prisma Studio

Visual database browser for development:

```bash
pnpm db:studio
```

Access at `http://localhost:5555` to:
- Browse data
- Edit records
- Test queries
- Inspect schema

---

**References:**
- Main configuration: `AGENTS.md`
- Architecture rules: `.agents/rules/architecture.md`
- Prisma schema: `prisma/schema.prisma`
- Prisma docs: https://www.prisma.io/docs