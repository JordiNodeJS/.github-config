# Architecture Rules

This file contains architectural guidelines and patterns for the Movies Tracker project.

## Overview

Movies Tracker follows a **server-first architecture** using Next.js 16 App Router with React Server Components as the foundation.

## Core Architectural Principles

### 1. Server-First Approach

- **Default to Server Components**: All components should be Server Components unless they require client-side interactivity
- **Data Fetching**: Perform data fetching in Server Components, close to the data source
- **Mutations**: Handle all data mutations through Server Actions
- **Client Boundary**: Mark the client boundary explicitly with `"use client"` directive

### 2. Component Types

#### Server Components (Default)

```typescript
// No directive needed - Server Component by default
export default async function MovieList() {
  const movies = await getTrendingMovies();
  return <div>{/* render movies */}</div>;
}
```

**Use Server Components for:**
- Data fetching from APIs or databases
- Accessing backend resources
- Keeping sensitive information on the server (API keys, tokens)
- Large dependencies that don't need client-side execution

#### Client Components (Explicit)

```typescript
"use client";

import { useState } from "react";

export default function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Use Client Components for:**
- Interactive elements (onClick, onChange, etc.)
- React hooks (useState, useEffect, useContext)
- Browser APIs (localStorage, window, document)
- Event listeners

### 3. Data Flow Pattern

```
User Interaction
    ↓
Client Component (triggers action)
    ↓
Server Action (processes mutation)
    ↓
Database/API (persists changes)
    ↓
Cache Revalidation (updates UI)
    ↓
Server Component Re-render (fresh data)
```

## Service Boundaries

The application is organized into logical service boundaries:

### User Service

**Responsibility**: User authentication and profile management

**Key Files:**
- `src/lib/auth-actions.ts` - Login, logout, register
- `src/lib/auth-utils.ts` - JWT and password utilities
- `src/lib/actions.ts` - `ensureUser()` middleware

**Operations:**
- User registration with password hashing
- JWT-based authentication
- Session management via cookies
- Profile data retrieval

### Movie Service

**Responsibility**: TMDB API integration and movie data caching

**Key Files:**
- `src/lib/tmdb.ts` - TMDB API client
- `src/app/[locale]/movie/[id]/page.tsx` - Movie details display

**Operations:**
- Fetch trending movies
- Get movie details by ID
- Search movies by title
- Retrieve genre lists
- Cache TMDB responses

### Watchlist Service

**Responsibility**: User-specific movie tracking

**Key Files:**
- `src/app/[locale]/watchlist/page.tsx` - Watchlist page
- Database: `Watchlist` model in Prisma schema

**Operations:**
- Add movies to user watchlist
- Remove movies from watchlist
- Retrieve user's watchlist
- Check if movie is in watchlist

### Recommendation Service

**Responsibility**: Personalized movie suggestions

**Operations:**
- Generate recommendations based on user preferences
- Leverage TMDB recommendation API
- Cache recommendations per user

## Data Layer Architecture

### Prisma ORM

- **Client Location**: `src/lib/prisma.ts` (singleton instance)
- **Schema**: `prisma/schema.prisma`
- **Connection**: Neon Serverless Postgres via `@prisma/adapter-neon`

**Pattern:**
```typescript
import prisma from "@/lib/prisma";

// Always use select for specific fields
const movies = await prisma.movie.findMany({
  select: {
    id: true,
    title: true,
    posterPath: true,
  },
});
```

### Database Design Principles

1. **Denormalization**: Store frequently accessed data locally
   - Store `title`, `posterPath`, `voteAverage` in related models
   - Reduces API calls to TMDB
   - Improves query performance

2. **ID Generation**: Use `cuid()` for user-related models
   - Prevents enumeration attacks
   - Globally unique identifiers
   - No auto-increment for user data

3. **Relationships**:
   - User → Watchlist (one-to-many)
   - Watchlist → Movie (denormalized data)

## API Integration Architecture

### TMDB API

**Centralized Access Pattern:**

All TMDB calls must go through `src/lib/tmdb.ts` for:
- Consistent error handling
- Centralized caching configuration
- Mock data fallback for development
- Locale parameter management

**Example:**
```typescript
// Good ✓
import { getMovieDetails } from "@/lib/tmdb";
const movie = await getMovieDetails(movieId, locale);

// Bad ✗
const response = await fetch(`https://api.themoviedb.org/3/movie/${id}`);
```

### External API Guidelines

- Never expose API keys in client code
- Always handle API errors gracefully
- Implement fallback/mock data for development
- Cache responses using Next.js cache directives

## Caching Architecture

### Next.js 16 Caching Strategy

**Cache Profiles** (defined in `next.config.ts`):
- `trending` - Short-lived (trending content)
- `movie` - Long-lived (static movie details)
- `search` - Medium-lived (search results)
- `genres` - Long-lived (genre metadata)

**Implementation:**
```typescript
"use cache";

export async function getTrendingMovies(locale: string) {
  const response = await fetch(/* TMDB API */);
  return response.json();
}
```

**Revalidation:**
```typescript
"use server";

export async function addToWatchlist(movieId: number) {
  const user = await ensureUser();
  
  // Perform mutation
  await prisma.watchlist.create({/* ... */});
  
  // Revalidate caches
  revalidateTag(`watchlist-${user.id}`);
  revalidatePath(`/[locale]/watchlist`);
}
```

## Routing Architecture

### App Router Structure

```
src/app/
├── [locale]/                    # Internationalization wrapper
│   ├── page.tsx                # Home page (trending movies)
│   ├── movie/
│   │   └── [id]/
│   │       └── page.tsx        # Movie details
│   ├── watchlist/
│   │   └── page.tsx            # User watchlist
│   ├── login/
│   │   └── page.tsx            # Login page
│   └── register/
│       └── page.tsx            # Registration page
```

### Page Component Pattern

```typescript
// Server Component with async data fetching
export default async function Page({ params }: { params: { id: string } }) {
  const movie = await getMovieDetails(Number(params.id));
  
  return (
    <div>
      {/* Server Component content */}
      <ClientComponent data={movie} />
    </div>
  );
}
```

## Authentication Architecture

### JWT-Based Authentication

**Flow:**
1. User credentials submitted via form action
2. Server Action validates credentials
3. JWT token generated and signed
4. Token stored in httpOnly cookie
5. Subsequent requests validated via `ensureUser()`

**Implementation:**
```typescript
// Protected Server Action pattern
"use server";

import { ensureUser } from "@/lib/actions";

export async function protectedAction() {
  const user = await ensureUser(); // Throws if unauthorized
  // Proceed with authenticated operation
}
```

## Error Handling Architecture

### Server-Side Errors

- Use `error.tsx` files for route-level error boundaries
- Throw meaningful errors in Server Actions
- Log errors to console for debugging
- Return user-friendly messages to client

### Client-Side Errors

- Implement error boundaries for Client Components
- Provide recovery actions when possible
- Display fallback UI during errors

## Performance Architecture

### Optimization Strategies

1. **Component Splitting**: Keep Server and Client Components separated
2. **Data Fetching**: Fetch data as close to usage as possible
3. **Streaming**: Leverage React Suspense for progressive rendering
4. **Image Optimization**: Use Next.js Image component
5. **Code Splitting**: Automatic with App Router

## File Organization

```
src/
├── app/                    # App Router pages and layouts
│   └── [locale]/          # Internationalized routes
├── components/            # Shared UI components
├── lib/                   # Utility functions and clients
│   ├── prisma.ts         # Database client
│   ├── tmdb.ts           # TMDB API client
│   ├── actions.ts        # Server Actions
│   ├── auth-actions.ts   # Auth Server Actions
│   └── auth-utils.ts     # Auth utilities
└── hooks/                 # Custom React hooks (client-side)
```

## Anti-Patterns to Avoid

1. **❌ Using Client Components by default**
   - ✅ Default to Server Components, opt-in to client

2. **❌ Fetching data in Client Components**
   - ✅ Fetch in Server Components, pass as props

3. **❌ Direct database access outside Prisma client**
   - ✅ Always use `src/lib/prisma.ts` instance

4. **❌ Multiple TMDB API clients**
   - ✅ Use centralized `src/lib/tmdb.ts`

5. **❌ Inline styles or CSS modules**
   - ✅ Use Tailwind CSS classes exclusively

6. **❌ Storing auth tokens in localStorage**
   - ✅ Use httpOnly cookies for JWT tokens

## Scalability Considerations

- **Monorepo Support**: Structure allows for multiple sub-applications
- **Service Isolation**: Clear boundaries enable future microservices migration
- **Cache Strategy**: Granular invalidation supports high traffic
- **Database**: Neon Serverless scales automatically
- **Deployment**: Vercel edge network for global performance

---

**References:**
- Main configuration: `AGENTS.md`
- Authentication rules: `.agents/rules/authentication.md`
- Database rules: `.agents/rules/database.md`
- Caching rules: `.agents/rules/caching.md`
