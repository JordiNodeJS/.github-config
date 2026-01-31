# Movies Tracker - AI Coding Instructions

- Utiliza `pnpm dlx kill-port <port>` para liberar puertos ocupados durante el desarrollo.
- Utiliza para correr tsx `pnpm dlx tsx <file>` en lugar de `npx <file>`.

## Project Overview

- **Stack**: Next.js 16 (App Router), Prisma ORM, Neon Serverless Postgres, TMDB API, Tailwind CSS 4
- **Architecture**: Server-first approach. Data fetching in Server Components; mutations in Server Actions
- **Package Manager**: `pnpm` (v10+)

## Big Picture Architecture

### Major Components

1. **Frontend**: Next.js 16 App Router with React Server Components
2. **Backend**: Server Actions for mutations, API routes for external integrations
3. **Database**: Neon Serverless Postgres with Prisma ORM
4. **External API**: TMDB API integration for movie data
5. **Authentication**: JWT-based auth with cookie storage

### Data Flow

```
User → Next.js App Router → Server Components → TMDB API/Prisma → Database
                          ↓
                     Server Actions (mutations)
```

### Service Boundaries

- **User Service**: Authentication, profile management
- **Movie Service**: TMDB integration, movie data caching
- **Watchlist Service**: User-specific movie tracking
- **Recommendation Service**: Personalized movie suggestions

## Critical Developer Workflows

### Build Process

```bash
# Development server
pnpm dev

# Production build
pnpm build  # Runs prisma generate && next build

# Database sync
pnpm db:push
```

### Testing

```bash
# Linting
pnpm lint

# Type checking
pnpm type-check
```

### Debugging

- Use `console.log` in Server Components (visible in terminal)
- Use browser devtools for Client Components
- Check Neon database logs for Prisma queries

## Project-Specific Conventions

### Caching Strategy (Next.js 16)

- Use `"use cache"` directive in fetch functions
- Custom cache profiles in `next.config.ts`: `trending`, `movie`, `search`, `genres`
- Revalidation: `revalidatePath()` and `revalidateTag()` in Server Actions
- Example tags: `"recommendations"`, `"movie-${movieId}"`

### Database Patterns

- **Denormalization**: Store `title`, `posterPath`, `voteAverage` in related models
- **Prisma Client**: Always use `src/lib/prisma.ts` instance
- **ID Generation**: Use `cuid()` for all user-related models
- **Neon Connection**: Configured via `prisma/adapter-neon`

### Authentication System

#### JWT Authentication Flow

```
1. User submits login form → `login()` in [`src/lib/auth-actions.ts`](src/lib/auth-actions.ts)
2. Password verified using scrypt hash from [`src/lib/auth-utils.ts`](src/lib/auth-utils.ts)
3. JWT token created with `signJWT()` using HS256 algorithm
4. Token stored in `auth_token` cookie (httpOnly, secure, 7-day expiry)
5. Subsequent requests use `ensureUser()` from [`src/lib/actions.ts`](src/lib/actions.ts)
6. User ID extracted from JWT payload for database operations
```

#### Key Authentication Files

- [`src/lib/auth-actions.ts`](src/lib/auth-actions.ts): Login/logout/register functions
- [`src/lib/auth-utils.ts`](src/lib/auth-utils.ts): Password hashing and JWT utilities
- [`src/lib/actions.ts`](src/lib/actions.ts): `ensureUser()` middleware for Server Actions

#### JWT Implementation Details

- **Algorithm**: HS256 with SHA-256
- **Secret**: `JWT_SECRET` environment variable
- **Token Structure**: `header.body.signature` (base64url encoded)
- **Payload**: Contains `userId`, `email`, and `iat` (issued at timestamp)
- **Validation**: Uses `timingSafeEqual` to prevent timing attacks

#### Password Security

- **Hashing**: scrypt with random 16-byte salt
- **Storage**: `hash.salt` format in database
- **Verification**: Constant-time comparison to prevent timing attacks

#### Session Management

- **Cookie**: `auth_token` (httpOnly, secure in production)
- **Expiry**: 7 days from creation
- **Logout**: Deletes cookie and redirects to home

#### Usage in Server Actions

```typescript
// Example: Protected Server Action
"use server";

import { ensureUser } from "@/lib/actions";

export async function protectedAction() {
  const user = await ensureUser(); // Throws if unauthorized
  // User is authenticated, proceed with operation
  await prisma.someOperation({ where: { userId: user.id } });
}
```

#### Common Authentication Patterns

1. **Registration**: Hash password → Create user → Redirect to login
2. **Login**: Verify credentials → Create JWT → Set cookie → Redirect
3. **Protected Routes**: Call `ensureUser()` → Check user existence → Proceed
4. **Logout**: Delete cookie → Redirect to home

#### Error Handling

- Throw `Error("Unauthorized")` for authentication failures
- Returns 401 status automatically in Next.js
- User-friendly messages displayed in UI

#### Security Best Practices

- Always use `ensureUser()` in Server Actions
- Never expose JWT secret in client code
- Use `httpOnly` and `secure` flags for cookies
- Rotate `JWT_SECRET` in production
- Use scrypt for password hashing (better than bcrypt for this use case)

### TMDB API Integration

- All TMDB calls go through `src/lib/tmdb.ts`
- Mock data used when `TMDB_ACCESS_TOKEN` missing
- Always pass `locale` parameter for internationalization
- Cache responses using Next.js caching directives

### Styling System

- **Theme**: "Avant-Garde" (minimalist, high contrast, glassmorphism)
- **Utilities**: `.glass`, `.glass-hover`, `.text-gradient`
- **Colors**: `--color-background`, `--color-accent`
- **Icons**: `lucide-react` for all icons

### Internationalization

- Framework: `next-intl` with `[locale]` routing
- Server Components: `getTranslations()`
- Client Components: `useTranslations()`
- TMDB API: Always include `language` parameter

## Integration Points

### External Dependencies

1. **TMDB API**: Movie data, images, recommendations
2. **Neon Postgres**: Database storage via Prisma
3. **NextAuth**: Authentication (JWT)
4. **Tailwind CSS**: Styling framework

### Cross-Component Communication

- **Server Actions**: Shared mutations across components
- **Context API**: User session and theme context
- **URL Search Params**: Client-side state management

## Key Files Reference

### Core Architecture

- [`prisma/schema.prisma`](prisma/schema.prisma): Database schema and models
- [`src/lib/prisma.ts`](src/lib/prisma.ts): Prisma client configuration
- [`src/lib/tmdb.ts`](src/lib/tmdb.ts): TMDB API integration layer
- [`src/lib/actions.ts`](src/lib/actions.ts): Server Actions and auth utilities

### UI Components

- [`src/components/navbar.tsx`](src/components/navbar.tsx): Main navigation
- [`src/components/movie-card.tsx`](src/components/movie-card.tsx): Movie display component
- [`src/components/theme-toggle.tsx`](src/components/theme-toggle.tsx): Theme switching

### Pages

- [`src/app/[locale]/page.tsx`](src/app/[locale]/page.tsx): Home page
- [`src/app/[locale]/movie/[id]/page.tsx`](src/app/[locale]/movie/[id]/page.tsx): Movie details
- [`src/app/[locale]/watchlist/page.tsx`](src/app/[locale]/watchlist/page.tsx): User watchlist

## Development Best Practices

### Environment Variables

- Use `.env.local` for sensitive data
- Prefix custom vars with `NEXT_PUBLIC_` for client-side access
- Required vars: `TMDB_ACCESS_TOKEN`, `DATABASE_URL`, `JWT_SECRET`

### Error Handling

- Use try/catch in Server Actions
- Return user-friendly error messages
- Log errors to console for debugging

### Performance

- Use Next.js caching for TMDB calls
- Denormalize data to minimize API calls
- Use Prisma's `select` for partial data fetching

### Code Organization

- Keep Server Components in `src/app`
- Keep Client Components in `src/components`
- Keep utility functions in `src/lib`
- Keep hooks in `src/hooks`

## Common Pitfalls

1. **Authentication**: Always call `ensureUser()` in Server Actions
2. **Caching**: Don't forget `"use cache"` directive for TMDB calls
3. **Internationalization**: Always pass `locale` to TMDB API
4. **Database**: Use `cuid()` for IDs, not auto-increment
5. **Styling**: Use Tailwind classes, not inline styles

## Getting Started for AI Agents

1. **Understand the architecture**: Review the big picture diagram
2. **Check existing patterns**: Look at key files for examples
3. **Use the right tools**: Prisma for DB, Server Actions for mutations
4. **Follow conventions**: Caching, auth, internationalization
5. **Test locally**: Use mock data when TMDB token not available

# Production Deployment

🌐 **Live Demo**: [https://movies-trackers.vercel.app/](https://movies-trackers.vercel.app/)

- Deploys automatically on push to main branch via Vercel
