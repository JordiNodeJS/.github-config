# Movies Tracker - OpenCode Project Rules

This file contains project-specific rules and guidelines for OpenCode AI coding assistant working on the Movies Tracker project.

## Quick Commands

```bash
# Kill occupied port
pnpm dlx kill-port <port>

# Run TypeScript files
pnpm dlx tsx <file>

# Development server
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint

# Database operations
pnpm db:push
pnpm db:studio
```

## Project Overview

**Technology Stack:**
- Framework: Next.js 16 (App Router)
- Database: Neon Serverless Postgres
- ORM: Prisma
- External API: TMDB (The Movie Database)
- Styling: Tailwind CSS 4
- Package Manager: pnpm v10+
- Deployment: Vercel

**Architecture Philosophy:**
- Server-first approach with React Server Components
- Server Actions for all mutations
- JWT-based authentication with httpOnly cookies
- Aggressive caching strategy for TMDB API calls
- Denormalized database design for performance

## Core Architecture

### Component Structure

```
User Interaction
    ↓
Next.js App Router
    ↓
Server Components (data fetching) → TMDB API / Prisma
    ↓
Server Actions (mutations) → Database
```

### Service Boundaries

1. **User Service**: Authentication, profile management
   - Files: `src/lib/auth-actions.ts`, `src/lib/auth-utils.ts`
   
2. **Movie Service**: TMDB integration, caching
   - Files: `src/lib/tmdb.ts`
   
3. **Watchlist Service**: User movie tracking
   - Database: Watchlist model
   
4. **Recommendation Service**: Personalized suggestions
   - Leverages TMDB API

## Code Style Guidelines

### TypeScript

- Use strict mode
- Prefer type inference
- Use `interface` for object shapes
- Use `type` for unions/primitives
- Avoid `any` - use `unknown` if truly unknown

### React Patterns

**Default to Server Components:**
```typescript
// Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

**Use Client Components sparingly:**
```typescript
"use client";

import { useState } from "react";

export default function Interactive() {
  const [state, setState] = useState(0);
  return <button onClick={() => setState(state + 1)}>{state}</button>;
}
```

### File Naming

- Components: `kebab-case.tsx`
- Component names: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE` (true constants) or `camelCase` (config)

## Next.js 16 Caching

### Cache Directive Usage

```typescript
"use cache";

export async function getTrendingMovies(locale: string) {
  const response = await fetch(/* TMDB API */, {
    next: { 
      tags: ["trending"],
      revalidate: 300, // 5 minutes
    },
  });
  return response.json();
}
```

### Cache Profiles

Defined in `next.config.ts`:
- `trending`: 5 min stale, 10 min revalidate
- `movie`: 1 hour stale, 2 hours revalidate
- `search`: 10 min stale, 30 min revalidate
- `genres`: 24 hours stale, 48 hours revalidate

### Revalidation After Mutations

```typescript
"use server";

import { revalidateTag, revalidatePath } from "next/cache";

export async function addToWatchlist(movieId: number) {
  const user = await ensureUser();
  await prisma.watchlist.create({/* ... */});
  
  // Always revalidate after mutations
  revalidateTag(`watchlist-${user.id}`);
  revalidatePath(`/[locale]/watchlist`);
}
```

## Database Patterns

### Prisma Client

**Always use singleton instance:**
```typescript
import prisma from "@/lib/prisma";

const users = await prisma.user.findMany({
  select: { id: true, email: true },
});
```

### Design Principles

1. **Denormalization**: Store `title`, `posterPath`, `voteAverage` in related models
2. **ID Generation**: Use `cuid()` for user-related models
3. **Select Fields**: Always use `select` to fetch only needed data
4. **Transactions**: Use for multi-step operations

```typescript
// Good ✓
const movies = await prisma.watchlist.findMany({
  where: { userId },
  select: {
    id: true,
    movieId: true,
    title: true,
  },
});

// Bad ✗
const movies = await prisma.watchlist.findMany({ where: { userId } });
```

## Authentication System

### JWT Flow

1. User login → `login()` in `src/lib/auth-actions.ts`
2. Password verified with scrypt hash
3. JWT created with HS256 algorithm
4. Token stored in `auth_token` httpOnly cookie (7 days)
5. Protected routes use `ensureUser()` from `src/lib/actions.ts`

### Protected Server Actions

```typescript
"use server";

import { ensureUser } from "@/lib/actions";

export async function protectedAction() {
  const user = await ensureUser(); // Throws if unauthorized
  // Proceed with authenticated operation
  await prisma.someOperation({ where: { userId: user.id } });
}
```

### Security Best Practices

- Never expose JWT secret in client code
- Always use `ensureUser()` in protected Server Actions
- Use httpOnly and secure flags for cookies
- Use scrypt for password hashing (constant-time comparison)
- Rotate JWT_SECRET in production

## TMDB API Integration

### Centralized Access

All TMDB calls go through `src/lib/tmdb.ts`:

```typescript
import { getMovieDetails } from "@/lib/tmdb";

const movie = await getMovieDetails(movieId, locale);
```

### Best Practices

- Always pass `locale` parameter for i18n
- Use mock data when `TMDB_ACCESS_TOKEN` is missing
- Cache responses with Next.js directives
- Handle errors gracefully with fallbacks

## Styling System

### Tailwind CSS 4

**Theme: "Avant-Garde"**
- Minimalist design
- High contrast
- Glassmorphism effects
- Smooth transitions

### Custom Utilities

```typescript
// Glass effect
<div className="glass glass-hover rounded-xl p-6">
  Content
</div>

// Gradient text
<h1 className="text-gradient text-4xl font-bold">
  Title
</h1>
```

### Component Patterns

```typescript
// Primary button
<button className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90">
  Action
</button>

// Input
<input className="w-full px-4 py-3 glass rounded-lg focus:ring-2 focus:ring-accent" />
```

### Icons

Use `lucide-react` exclusively:

```typescript
import { Star, Heart, Play } from "lucide-react";

<Heart className="w-5 h-5 text-red-500" />
```

## Internationalization

### Framework: next-intl

**Server Components:**
```typescript
import { getTranslations } from "next-intl/server";

const t = await getTranslations("HomePage");
return <h1>{t("title")}</h1>;
```

**Client Components:**
```typescript
"use client";
import { useTranslations } from "next-intl";

const t = useTranslations("Component");
return <button>{t("action")}</button>;
```

## File Structure

```
src/
├── app/[locale]/          # App Router pages
│   ├── page.tsx          # Home page
│   ├── movie/[id]/       # Movie details
│   └── watchlist/        # User watchlist
├── components/           # UI components
├── lib/                  # Utilities and clients
│   ├── prisma.ts        # Database client
│   ├── tmdb.ts          # TMDB API client
│   ├── actions.ts       # Server Actions
│   ├── auth-actions.ts  # Auth Server Actions
│   └── auth-utils.ts    # Auth utilities
└── hooks/               # React hooks (client)
```

## Environment Variables

### Required Variables

```bash
# .env.local
TMDB_ACCESS_TOKEN=your-tmdb-token
DATABASE_URL=postgresql://...
JWT_SECRET=min-32-characters-secret
```

### Best Practices

- Never commit `.env.local`
- Use `NEXT_PUBLIC_` prefix for client-side vars
- Store production vars in Vercel dashboard
- Generate strong secrets: `openssl rand -base64 32`

## Common Pitfalls

1. **Forgetting `ensureUser()`** - Always call in protected Server Actions
2. **Missing `"use cache"`** - Add to TMDB fetch functions
3. **No locale parameter** - Always pass to TMDB API
4. **Using auto-increment IDs** - Use `cuid()` for user data
5. **Inline styles** - Use Tailwind classes only
6. **Client Components by default** - Server Components should be default

## Development Workflow

### Building Features

1. Create page in `src/app/[locale]/your-feature/`
2. Add data fetching with cache directives
3. Create Server Actions for mutations
4. Add Client Components for interactivity
5. Update translations
6. Add navigation links
7. Test responsive design

### Debugging

- Server Components: `console.log` (visible in terminal)
- Client Components: Browser DevTools
- Database: Check Neon logs, use Prisma Studio
- Cache: Check `x-nextjs-cache` headers

## Testing Checklist

- [ ] TypeScript type check passes (`pnpm type-check`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Responsive design works (mobile/tablet/desktop)
- [ ] Dark/light mode both work
- [ ] Translations complete for all locales
- [ ] Authentication flow works
- [ ] Cache revalidation after mutations
- [ ] Error states handled gracefully

## Deployment

**Platform**: Vercel  
**Process**: Automatic on push to main  
**Build Command**: `pnpm build`  
**Live URL**: https://movies-trackers.vercel.app/

### Pre-Deployment

- Set environment variables in Vercel dashboard
- Apply database migrations
- Test build locally: `pnpm build`

## Related Configuration Files

- `AGENTS.md` - Universal agent instructions (main reference)
- `.agents/` - Modular rules by domain
- `.trae/rules/project_rules.md` - TRAE-specific format
- `.github/copilot-instructions.md` - GitHub Copilot format

---

**Note**: This configuration follows the AGENTS.md standard and is compatible with OpenCode AI assistant. For the most comprehensive documentation, refer to `AGENTS.md` in the project root.