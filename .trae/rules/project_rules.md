# Movies Tracker - TRAE Project Rules

This file contains project-specific rules for TRAE AI coding assistant.

## Quick Reference

- Use `pnpm dlx kill-port <port>` to free occupied ports during development
- Use `pnpm dlx tsx <file>` instead of `npx <file>` to run TypeScript files

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Neon Serverless Postgres with Prisma ORM
- **External API**: TMDB (The Movie Database) API
- **Styling**: Tailwind CSS 4
- **Package Manager**: pnpm (v10+)
- **Deployment**: Vercel

## Project Architecture

### Core Principles

1. **Server-First Architecture**: Prioritize Server Components for data fetching
2. **Server Actions for Mutations**: All data mutations through Server Actions
3. **JWT Authentication**: Custom JWT implementation with cookie-based sessions
4. **API Integration**: TMDB API for movie data with caching strategy

### Component Structure

```
Frontend (Next.js App Router with RSC)
    ↓
Server Components (Data Fetching) → TMDB API / Prisma
    ↓
Server Actions (Mutations) → Database (Neon Postgres)
```

### Service Boundaries

- **User Service**: Authentication, profile management
- **Movie Service**: TMDB integration, movie data caching
- **Watchlist Service**: User-specific movie tracking
- **Recommendation Service**: Personalized movie suggestions

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Production build
pnpm build  # Automatically runs prisma generate

# Type checking
pnpm type-check

# Linting
pnpm lint

# Database operations
pnpm db:push      # Sync Prisma schema with database
pnpm db:studio    # Open Prisma Studio GUI
```

## Code Style Guidelines

### TypeScript

- Enable strict mode
- Prefer type inference over explicit types where reasonable
- Use `interface` for object shapes
- Use `type` for unions, intersections, and primitives
- Avoid `any` type; use `unknown` if type is truly unknown

### React Patterns

- **Default to Server Components**: Use Client Components only when necessary
- **"use client" directive**: Required for interactivity, hooks, browser APIs
- **"use server" directive**: Required for Server Actions
- **Async components**: Allowed and encouraged in Server Components
- **Error boundaries**: Implement using `error.tsx` files

### File Naming

- Component files: `kebab-case.tsx`
- Component names: `PascalCase`
- Function names: `camelCase`
- Constants: `UPPER_SNAKE_CASE` for true constants
- Config objects: `camelCase`

### Import Organization

1. External dependencies (React, Next.js, third-party)
2. Internal absolute imports (@/...)
3. Relative imports (../, ./)
4. Type imports (keep separate or use `import type`)

## Next.js 16 Caching Strategy

### Cache Directive Usage

- Use `"use cache"` directive at the top of fetch functions
- Custom cache profiles defined in `next.config.ts`:
  - `trending`: Short-lived cache for trending movies
  - `movie`: Long-lived cache for movie details
  - `search`: Medium-lived cache for search results
  - `genres`: Long-lived cache for genre lists

### Cache Revalidation

- Use `revalidatePath()` in Server Actions after mutations
- Use `revalidateTag()` for granular cache invalidation
- Standard tags:
  - `"recommendations"` - User-specific recommendations
  - `"movie-${movieId}"` - Individual movie data
  - `"watchlist-${userId}"` - User watchlist

### Example

```typescript
"use cache"
export async function getTrendingMovies(locale: string) {
  const response = await fetch(/* ... */);
  return response.json();
}

// In Server Action
"use server"
export async function addToWatchlist(movieId: number) {
  // ... mutation logic
  revalidateTag(`watchlist-${userId}`);
  revalidatePath(`/[locale]/watchlist`);
}
```

## Database Patterns (Prisma + Neon)

### Core Principles

1. **Denormalization**: Store frequently accessed data (`title`, `posterPath`, `voteAverage`) directly in related models
2. **Single Prisma Instance**: Always import from `src/lib/prisma.ts`
3. **ID Generation**: Use `cuid()` for all user-related models
4. **Neon Adapter**: Connection configured via `@prisma/adapter-neon`

### Best Practices

- Use `select` to fetch only required fields
- Leverage Prisma's type safety
- Use transactions for multi-step operations
- Handle connection errors gracefully (Neon serverless scaling)

### Example Pattern

```typescript
import prisma from "@/lib/prisma";

// Good: Select only needed fields
const movies = await prisma.movie.findMany({
  select: {
    id: true,
    title: true,
    posterPath: true,
  },
});

// Bad: Fetching all fields
const movies = await prisma.movie.findMany();
```

## Authentication System

### JWT Flow

1. User submits login → `login()` in `src/lib/auth-actions.ts`
2. Password verified using scrypt hash from `src/lib/auth-utils.ts`
3. JWT token created with `signJWT()` (HS256 algorithm)
4. Token stored in `auth_token` cookie (httpOnly, secure, 7-day expiry)
5. Protected routes use `ensureUser()` from `src/lib/actions.ts`
6. User ID extracted from JWT payload for database operations

### Key Files

- `src/lib/auth-actions.ts`: Login/logout/register Server Actions
- `src/lib/auth-utils.ts`: Password hashing, JWT sign/verify utilities
- `src/lib/actions.ts`: `ensureUser()` middleware for protected actions

### Security Implementation

- **Algorithm**: HS256 with SHA-256
- **Secret**: `JWT_SECRET` environment variable (never commit!)
- **Token Structure**: `header.body.signature` (base64url encoded)
- **Payload**: `{ userId, email, iat }`
- **Validation**: `timingSafeEqual` prevents timing attacks
- **Password Hashing**: scrypt with random 16-byte salt
- **Storage Format**: `hash.salt` in database

### Protected Server Action Pattern

```typescript
"use server";

import { ensureUser } from "@/lib/actions";

export async function protectedAction() {
  const user = await ensureUser(); // Throws if unauthorized
  // User is authenticated - proceed with operation
  await prisma.someOperation({ where: { userId: user.id } });
}
```

### Session Management

- Cookie name: `auth_token`
- Flags: `httpOnly`, `secure` (production only)
- Expiry: 7 days from creation
- Logout: Delete cookie + redirect to home

## TMDB API Integration

### Core Principles

- **Centralized Access**: All TMDB calls through `src/lib/tmdb.ts`
- **Mock Fallback**: Mock data when `TMDB_ACCESS_TOKEN` is missing
- **Internationalization**: Always pass `locale` parameter
- **Caching**: Use Next.js cache directives for responses

### API Configuration

- Access token stored in `TMDB_ACCESS_TOKEN` environment variable
- Base URL: `https://api.themoviedb.org/3`
- Image base URL: `https://image.tmdb.org/t/p/`
- Always include `language` parameter for i18n support

### Example Implementation

```typescript
export async function getMovieDetails(id: number, locale: string) {
  "use cache";
  
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?language=${locale}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
    }
  );
  
  return response.json();
}
```

## Styling System

### Theme: "Avant-Garde"

- Minimalist design language
- High contrast color palette
- Glassmorphism effects
- Smooth transitions and animations

### Tailwind CSS 4

- **Approach**: Utility-first, no inline styles
- **Custom Utilities**: `.glass`, `.glass-hover`, `.text-gradient`
- **CSS Variables**: `--color-background`, `--color-accent`
- **Icons**: `lucide-react` library exclusively

### Best Practices

- Use Tailwind classes only, avoid inline `style` attributes
- Leverage dark mode with `dark:` prefix
- Use custom utilities for complex effects
- Keep component styles co-located

## Internationalization (i18n)

### Framework: next-intl

- **Routing**: `[locale]` dynamic segment in App Router
- **Server Components**: `getTranslations()` function
- **Client Components**: `useTranslations()` hook
- **TMDB API**: Always include `language` parameter matching locale

### Usage Pattern

```typescript
// Server Component
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations("HomePage");
  return <h1>{t("title")}</h1>;
}

// Client Component
"use client";
import { useTranslations } from "next-intl";

export default function Component() {
  const t = useTranslations("Component");
  return <button>{t("action")}</button>;
}
```

## File Structure Reference

### Core Architecture

- `prisma/schema.prisma` - Database schema and models
- `src/lib/prisma.ts` - Prisma client singleton
- `src/lib/tmdb.ts` - TMDB API integration layer
- `src/lib/actions.ts` - Server Actions and auth utilities

### UI Components

- `src/components/navbar.tsx` - Main navigation
- `src/components/movie-card.tsx` - Movie display card
- `src/components/theme-toggle.tsx` - Dark/light mode toggle

### Pages (App Router)

- `src/app/[locale]/page.tsx` - Home page (trending movies)
- `src/app/[locale]/movie/[id]/page.tsx` - Movie details page
- `src/app/[locale]/watchlist/page.tsx` - User watchlist page

## Environment Variables

### Required Variables

- `TMDB_ACCESS_TOKEN` - TMDB API access token
- `DATABASE_URL` - Neon Postgres connection string
- `JWT_SECRET` - Secret key for JWT signing (min 32 characters)

### Configuration

- Store in `.env.local` for local development (never commit!)
- Prefix with `NEXT_PUBLIC_` for client-side access
- Set in Vercel dashboard for production

## Error Handling

### Server Actions

- Wrap operations in try/catch blocks
- Return user-friendly error messages
- Log errors to console for debugging
- Throw `Error("Unauthorized")` for auth failures (Next.js returns 401)

### Error Boundaries

- Use `error.tsx` files for route-level error handling
- Provide fallback UI with recovery options
- Log errors for monitoring

## Performance Guidelines

### Data Fetching

- Use Next.js cache directives for TMDB calls
- Denormalize data to minimize roundtrips
- Use Prisma `select` for partial fetches
- Implement pagination for large lists

### Component Optimization

- Keep Server Components as default
- Use Client Components sparingly
- Lazy load heavy components
- Optimize images with Next.js Image component

## Common Pitfalls to Avoid

1. **Forgetting ensureUser()** - Always call in protected Server Actions
2. **Missing cache directive** - Add `"use cache"` to TMDB fetches
3. **Locale parameter** - Always pass to TMDB API calls
4. **ID generation** - Use `cuid()`, not auto-increment for user data
5. **Inline styles** - Use Tailwind classes exclusively
6. **Client Components** - Don't default to "use client" unnecessarily

## Testing Guidelines

### Type Safety

- Run `pnpm type-check` before committing
- Fix TypeScript errors, don't use `@ts-ignore`
- Ensure Prisma types are generated

### Linting

- Run `pnpm lint` regularly
- Follow ESLint recommendations
- Use Prettier for consistent formatting

### Manual Testing

- Test authentication flow (register, login, logout)
- Verify internationalization across locales
- Check responsive design on mobile/desktop
- Test with and without TMDB token (mock fallback)

## Deployment (Vercel)

### Automatic Deployment

- Pushes to `main` branch trigger automatic deployment
- Build command: `pnpm build`
- Environment variables configured in Vercel dashboard
- Production URL: https://movies-trackers.vercel.app/

### Pre-Deployment Checklist

- [ ] All TypeScript errors resolved
- [ ] Linting passes
- [ ] Environment variables set in Vercel
- [ ] Database migrations applied
- [ ] TMDB API token configured

## Getting Started for TRAE

1. Review the architecture diagram above
2. Examine key files in `src/lib/` for patterns
3. Use Prisma for database operations
4. Use Server Actions for mutations
5. Follow caching, auth, and i18n conventions
6. Test with mock data if TMDB token unavailable

---

**Note**: This configuration is specific to TRAE. For universal agent instructions, see `AGENTS.md` in the project root.