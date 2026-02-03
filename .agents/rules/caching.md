# Caching Rules

This file contains caching strategies, cache invalidation patterns, and Next.js 16 cache directive usage for the Movies Tracker project.

## Overview

Movies Tracker uses **Next.js 16's enhanced caching system** with custom cache profiles to optimize performance. The caching strategy balances data freshness with API rate limits and user experience.

## Next.js 16 Caching System

### Cache Directive

Use the `"use cache"` directive at the function level to enable caching:

```typescript
"use cache";

export async function getTrendingMovies(locale: string) {
  const response = await fetch(/* TMDB API */);
  return response.json();
}
```

### Cache Profiles

Defined in `next.config.ts`, custom cache profiles control cache behavior:

```typescript
// next.config.ts
const config = {
  experimental: {
    cacheProfiles: {
      trending: {
        staleTime: 300,      // 5 minutes
        revalidateTime: 600, // 10 minutes
      },
      movie: {
        staleTime: 3600,     // 1 hour
        revalidateTime: 7200, // 2 hours
      },
      search: {
        staleTime: 600,      // 10 minutes
        revalidateTime: 1800, // 30 minutes
      },
      genres: {
        staleTime: 86400,    // 24 hours
        revalidateTime: 172800, // 48 hours
      },
    },
  },
};
```

## Cache Profile Usage

### Trending Movies (Short-Lived)

**Profile**: `trending`
**Use Case**: Frequently changing content
**TTL**: 5 minutes stale, 10 minutes revalidate

```typescript
"use cache";

export async function getTrendingMovies(locale: string) {
  const response = await fetch(
    `https://api.themoviedb.org/3/trending/movie/week?language=${locale}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: { tags: ["trending"] },
    }
  );
  
  return response.json();
}
```

### Movie Details (Long-Lived)

**Profile**: `movie`
**Use Case**: Static content that rarely changes
**TTL**: 1 hour stale, 2 hours revalidate

```typescript
"use cache";

export async function getMovieDetails(movieId: number, locale: string) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?language=${locale}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: { tags: [`movie-${movieId}`] },
    }
  );
  
  return response.json();
}
```

### Search Results (Medium-Lived)

**Profile**: `search`
**Use Case**: User search queries
**TTL**: 10 minutes stale, 30 minutes revalidate

```typescript
"use cache";

export async function searchMovies(query: string, locale: string) {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=${locale}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: { tags: [`search-${query}`] },
    }
  );
  
  return response.json();
}
```

### Genres (Very Long-Lived)

**Profile**: `genres`
**Use Case**: Rarely changing metadata
**TTL**: 24 hours stale, 48 hours revalidate

```typescript
"use cache";

export async function getGenres(locale: string) {
  const response = await fetch(
    `https://api.themoviedb.org/3/genre/movie/list?language=${locale}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: { tags: ["genres"] },
    }
  );
  
  return response.json();
}
```

## Cache Tags

### Standard Tags

Use consistent tag naming for cache invalidation:

- `"trending"` - Trending movies list
- `"movie-${movieId}"` - Individual movie data
- `"search-${query}"` - Search results for specific query
- `"genres"` - Genre list
- `"recommendations"` - User recommendations
- `"watchlist-${userId}"` - User-specific watchlist

### Tag Examples

```typescript
// Fetch with tag
const response = await fetch(url, {
  next: { tags: [`movie-${movieId}`, "movies"] },
});

// Revalidate by tag
revalidateTag(`movie-${movieId}`);
```

## Cache Revalidation

### After Mutations (Server Actions)

Always revalidate affected caches after data mutations:

```typescript
"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { ensureUser } from "@/lib/actions";
import prisma from "@/lib/prisma";

export async function addToWatchlist(movieId: number, movieData: any) {
  const user = await ensureUser();

  // Perform mutation
  await prisma.watchlist.create({
    data: {
      userId: user.id,
      movieId,
      title: movieData.title,
      posterPath: movieData.poster_path,
      voteAverage: movieData.vote_average,
    },
  });

  // Revalidate caches
  revalidateTag(`watchlist-${user.id}`);
  revalidatePath(`/[locale]/watchlist`);
  
  return { success: true };
}
```

### revalidateTag vs revalidatePath

**revalidateTag**: Granular cache invalidation by tag
```typescript
// Invalidates only caches with this specific tag
revalidateTag(`movie-${movieId}`);
revalidateTag(`watchlist-${userId}`);
```

**revalidatePath**: Invalidates all caches for a route
```typescript
// Invalidates entire page cache
revalidatePath(`/[locale]/watchlist`);
revalidatePath(`/[locale]/movie/[id]`, "page");
```

**Best Practice**: Use both for comprehensive invalidation
```typescript
// Tag for data cache, path for page cache
revalidateTag(`watchlist-${userId}`);
revalidatePath(`/[locale]/watchlist`);
```

## Server Action Patterns

### Basic Pattern with Revalidation

```typescript
"use server";

import { revalidateTag, revalidatePath } from "next/cache";

export async function removeFromWatchlist(movieId: number) {
  const user = await ensureUser();

  await prisma.watchlist.deleteMany({
    where: {
      userId: user.id,
      movieId,
    },
  });

  // Revalidate user's watchlist
  revalidateTag(`watchlist-${user.id}`);
  revalidatePath(`/[locale]/watchlist`);
  
  return { success: true };
}
```

### Advanced Pattern with Multiple Tags

```typescript
"use server";

export async function updateMovieRating(movieId: number, rating: number) {
  const user = await ensureUser();

  await prisma.rating.upsert({
    where: {
      userId_movieId: {
        userId: user.id,
        movieId,
      },
    },
    update: { rating },
    create: {
      userId: user.id,
      movieId,
      rating,
    },
  });

  // Revalidate multiple related caches
  revalidateTag(`movie-${movieId}`);
  revalidateTag(`ratings-${user.id}`);
  revalidateTag("recommendations");
  revalidatePath(`/[locale]/movie/${movieId}`);
  
  return { success: true };
}
```

## TMDB API Caching

### Centralized Caching in src/lib/tmdb.ts

All TMDB functions should include cache directives:

```typescript
// src/lib/tmdb.ts

"use cache";

export async function getTrendingMovies(locale: string = "en") {
  const response = await fetch(
    `https://api.themoviedb.org/3/trending/movie/week?language=${locale}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: {
        tags: ["trending", `trending-${locale}`],
        revalidate: 300, // 5 minutes
      },
    }
  );

  if (!response.ok) {
    return getMockTrendingMovies(); // Fallback
  }

  return response.json();
}

"use cache";

export async function getMovieDetails(id: number, locale: string = "en") {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?language=${locale}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: {
        tags: [`movie-${id}`, `movie-${id}-${locale}`],
        revalidate: 3600, // 1 hour
      },
    }
  );

  if (!response.ok) {
    return getMockMovieDetails(); // Fallback
  }

  return response.json();
}
```

### Per-Locale Caching

Cache different language versions separately:

```typescript
"use cache";

export async function getMoviesByGenre(genreId: number, locale: string) {
  const response = await fetch(
    `https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&language=${locale}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: {
        tags: [`genre-${genreId}`, `genre-${genreId}-${locale}`],
        revalidate: 600, // 10 minutes
      },
    }
  );

  return response.json();
}
```

## Database Query Caching

### Combining Prisma with Next.js Cache

```typescript
"use cache";

export async function getUserWatchlist(userId: string) {
  const watchlist = await prisma.watchlist.findMany({
    where: { userId },
    select: {
      id: true,
      movieId: true,
      title: true,
      posterPath: true,
      voteAverage: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return watchlist;
}

// Revalidate after mutations
export async function addToWatchlistAction(movieId: number) {
  "use server";
  
  const user = await ensureUser();
  await prisma.watchlist.create({/* ... */});
  
  revalidateTag(`watchlist-${user.id}`);
}
```

## Cache Debugging

### Development Tools

Enable cache logging in development:

```typescript
// next.config.ts
const config = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};
```

### Console Logging

Add cache indicators to your functions:

```typescript
"use cache";

export async function getMovieDetails(movieId: number, locale: string) {
  console.log(`[CACHE] Fetching movie ${movieId} for locale ${locale}`);
  
  const response = await fetch(/* ... */);
  const data = await response.json();
  
  console.log(`[CACHE] Movie ${movieId} fetched successfully`);
  return data;
}
```

### Cache Headers

Check cache status in browser DevTools Network tab:
- `x-nextjs-cache: HIT` - Served from cache
- `x-nextjs-cache: MISS` - Fresh fetch
- `x-nextjs-cache: STALE` - Stale data, revalidating

## Common Pitfalls

### ❌ Don't: Forget cache directive

```typescript
// BAD - No caching
export async function getTrendingMovies() {
  const response = await fetch(/* ... */);
  return response.json();
}
```

### ✅ Do: Add "use cache" directive

```typescript
// GOOD - Cached
"use cache";

export async function getTrendingMovies() {
  const response = await fetch(/* ... */);
  return response.json();
}
```

### ❌ Don't: Forget to revalidate after mutations

```typescript
// BAD - Cache not updated
export async function addToWatchlist(movieId: number) {
  await prisma.watchlist.create({/* ... */});
  // Missing revalidation!
}
```

### ✅ Do: Revalidate affected caches

```typescript
// GOOD - Cache updated
export async function addToWatchlist(movieId: number) {
  const user = await ensureUser();
  await prisma.watchlist.create({/* ... */});
  
  revalidateTag(`watchlist-${user.id}`);
  revalidatePath(`/[locale]/watchlist`);
}
```

### ❌ Don't: Use overly broad tags

```typescript
// BAD - Invalidates too much
revalidateTag("movies");
```

### ✅ Do: Use specific tags

```typescript
// GOOD - Granular invalidation
revalidateTag(`movie-${movieId}`);
revalidateTag(`watchlist-${userId}`);
```

## Cache Strategy Summary

| Data Type | Profile | Stale Time | Revalidate Time | Tags |
|-----------|---------|------------|-----------------|------|
| Trending Movies | trending | 5 min | 10 min | `trending`, `trending-${locale}` |
| Movie Details | movie | 1 hour | 2 hours | `movie-${id}`, `movie-${id}-${locale}` |
| Search Results | search | 10 min | 30 min | `search-${query}` |
| Genres | genres | 24 hours | 48 hours | `genres`, `genres-${locale}` |
| User Watchlist | custom | On demand | On mutation | `watchlist-${userId}` |
| Recommendations | custom | 1 hour | On mutation | `recommendations`, `recommendations-${userId}` |

## Best Practices

1. **Always use cache directive** for TMDB API calls
2. **Tag everything** for granular invalidation
3. **Revalidate after mutations** to keep UI fresh
4. **Use both tag and path** revalidation for comprehensive updates
5. **Cache per locale** for internationalized content
6. **Log cache operations** during development
7. **Monitor cache hit rates** in production
8. **Balance freshness vs. API limits** with appropriate TTLs

---

**References:**
- Main configuration: `AGENTS.md`
- Architecture rules: `.agents/rules/architecture.md`
- TMDB integration: `src/lib/tmdb.ts`
- Next.js caching: https://nextjs.org/docs/app/building-your-application/caching