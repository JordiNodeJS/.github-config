# API Integration Rules

This file contains guidelines for integrating external APIs, specifically TMDB (The Movie Database) API, in the Movies Tracker project.

## Overview

Movies Tracker integrates with the **TMDB API** for movie data. All API calls are centralized, cached, and include fallback mechanisms for resilience.

## TMDB API Configuration

### Access Token

Stored in environment variable:

```bash
# .env.local
TMDB_ACCESS_TOKEN=your-bearer-token-here
```

### Base URLs

```typescript
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";
```

### Image Sizes

- **Poster**: `w500` (cards), `original` (details)
- **Backdrop**: `w1280` (hero), `original` (full)
- **Profile**: `w185` (avatars)

## Centralized API Client

### Location

All TMDB calls go through `src/lib/tmdb.ts` - NEVER call TMDB directly from components.

### Pattern

```typescript
// src/lib/tmdb.ts

"use cache";

export async function getTrendingMovies(locale: string = "en") {
  const response = await fetch(
    `${TMDB_BASE_URL}/trending/movie/week?language=${locale}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      next: {
        tags: ["trending", `trending-${locale}`],
        revalidate: 300, // 5 minutes
      },
    }
  );

  if (!response.ok) {
    console.error("TMDB API error:", response.statusText);
    return getMockTrendingMovies();
  }

  const data = await response.json();
  return data.results;
}
```

## API Functions

### Trending Movies

```typescript
"use cache";

export async function getTrendingMovies(locale: string) {
  const response = await fetch(
    `${TMDB_BASE_URL}/trending/movie/week?language=${locale}`,
    {
      headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
      next: { tags: ["trending"], revalidate: 300 },
    }
  );
  
  if (!response.ok) return getMockTrendingMovies();
  return response.json();
}
```

### Movie Details

```typescript
"use cache";

export async function getMovieDetails(id: number, locale: string) {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${id}?language=${locale}&append_to_response=credits,videos,recommendations`,
    {
      headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
      next: { tags: [`movie-${id}`], revalidate: 3600 },
    }
  );
  
  if (!response.ok) return getMockMovieDetails();
  return response.json();
}
```

### Search Movies

```typescript
"use cache";

export async function searchMovies(query: string, locale: string, page: number = 1) {
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=${locale}&page=${page}`,
    {
      headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
      next: { tags: [`search-${query}`], revalidate: 600 },
    }
  );
  
  if (!response.ok) return { results: [] };
  return response.json();
}
```

### Discover Movies by Genre

```typescript
"use cache";

export async function getMoviesByGenre(genreId: number, locale: string) {
  const response = await fetch(
    `${TMDB_BASE_URL}/discover/movie?with_genres=${genreId}&language=${locale}&sort_by=popularity.desc`,
    {
      headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
      next: { tags: [`genre-${genreId}`], revalidate: 600 },
    }
  );
  
  if (!response.ok) return { results: [] };
  return response.json();
}
```

### Get Genres

```typescript
"use cache";

export async function getGenres(locale: string) {
  const response = await fetch(
    `${TMDB_BASE_URL}/genre/movie/list?language=${locale}`,
    {
      headers: { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` },
      next: { tags: ["genres"], revalidate: 86400 }, // 24 hours
    }
  );
  
  if (!response.ok) return getMockGenres();
  return response.json();
}
```

## Internationalization

### Always Pass Locale

```typescript
// Good ✓
const movies = await getTrendingMovies(locale);

// Bad ✗
const movies = await getTrendingMovies(); // Missing locale
```

### Supported Locales

TMDB supports many locales. Common ones for this project:
- `en-US` - English (United States)
- `es-ES` - Spanish (Spain)
- `es-MX` - Spanish (Mexico)
- `fr-FR` - French (France)
- `de-DE` - German (Germany)

### Locale Format

Use ISO 639-1 (language) + ISO 3166-1 (country):

```typescript
const locale = `${language}-${country.toUpperCase()}`;
// Example: "en-US", "es-ES"
```

## Error Handling

### Pattern

```typescript
"use cache";

export async function getMovieDetails(id: number, locale: string) {
  try {
    const response = await fetch(/* ... */);
    
    if (!response.ok) {
      console.error(`TMDB API error: ${response.status} ${response.statusText}`);
      return getMockMovieDetails();
    }
    
    return await response.json();
  } catch (error) {
    console.error("TMDB API exception:", error);
    return getMockMovieDetails();
  }
}
```

### Error Types

1. **Network Errors**: Connection failures, timeouts
2. **HTTP Errors**: 401 (unauthorized), 404 (not found), 429 (rate limit)
3. **Parse Errors**: Invalid JSON response
4. **Missing Token**: `TMDB_ACCESS_TOKEN` not configured

### Fallback Strategy

Always provide mock data as fallback:

```typescript
function getMockTrendingMovies() {
  return [
    {
      id: 1,
      title: "Example Movie",
      poster_path: "/example.jpg",
      vote_average: 8.5,
      overview: "This is mock data for development.",
    },
  ];
}
```

## Caching Strategy

### Cache Directives

Use Next.js 16 `"use cache"` directive:

```typescript
"use cache";

export async function getTrendingMovies(locale: string) {
  // Function is automatically cached
}
```

### Revalidation Times

| Endpoint | Revalidate | Reason |
|----------|------------|--------|
| Trending | 300s (5 min) | Frequently changing |
| Movie Details | 3600s (1 hour) | Relatively static |
| Search | 600s (10 min) | Medium freshness |
| Genres | 86400s (24 hours) | Rarely changes |
| Recommendations | 3600s (1 hour) | Personalized |

### Cache Tags

Tag all requests for granular invalidation:

```typescript
next: {
  tags: [`movie-${id}`, `movie-${id}-${locale}`],
  revalidate: 3600,
}
```

## Rate Limiting

### TMDB Limits

- **Free Tier**: 40 requests per 10 seconds
- **Paid Tier**: Higher limits (check TMDB documentation)

### Mitigation Strategies

1. **Aggressive Caching**: Use Next.js cache to minimize requests
2. **Denormalization**: Store movie data in database
3. **Pagination**: Limit results per request
4. **Debouncing**: Debounce search inputs

### Rate Limit Handling

```typescript
if (response.status === 429) {
  const retryAfter = response.headers.get("Retry-After");
  console.warn(`Rate limited. Retry after ${retryAfter}s`);
  return getCachedData() || getMockData();
}
```

## Image Handling

### Get Image URL

```typescript
export function getTMDBImageUrl(
  path: string | null, 
  size: "w500" | "original" = "w500"
): string {
  if (!path) return "/placeholder.jpg";
  return `${TMDB_IMAGE_BASE_URL}${size}${path}`;
}
```

### Usage in Components

```typescript
import { getTMDBImageUrl } from "@/lib/tmdb";

<img 
  src={getTMDBImageUrl(movie.poster_path, "w500")} 
  alt={movie.title}
  className="w-full h-64 object-cover"
/>
```

### Placeholder Images

Always provide fallback for missing images:

```typescript
const imageUrl = movie.poster_path 
  ? getTMDBImageUrl(movie.poster_path, "w500")
  : "/placeholder-poster.jpg";
```

## Data Transformation

### TMDB to App Format

Transform TMDB responses to match app's data model:

```typescript
interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  overview: string;
  release_date: string;
}

interface AppMovie {
  id: number;
  title: string;
  posterPath: string;
  voteAverage: number;
  overview: string;
  releaseYear: number;
}

function transformMovie(tmdbMovie: TMDBMovie): AppMovie {
  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    posterPath: getTMDBImageUrl(tmdbMovie.poster_path),
    voteAverage: Math.round(tmdbMovie.vote_average * 10) / 10,
    overview: tmdbMovie.overview,
    releaseYear: new Date(tmdbMovie.release_date).getFullYear(),
  };
}
```

## Testing Without Token

### Mock Data

Provide comprehensive mock data for development:

```typescript
export function getMockTrendingMovies() {
  return [
    {
      id: 1,
      title: "The Shawshank Redemption",
      poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      vote_average: 8.7,
      overview: "Two imprisoned men bond over years...",
      release_date: "1994-09-23",
    },
    // Add more mock movies
  ];
}
```

### Environment Check

```typescript
const hasToken = !!process.env.TMDB_ACCESS_TOKEN;

if (!hasToken && process.env.NODE_ENV === "development") {
  console.warn("⚠️  TMDB_ACCESS_TOKEN not found. Using mock data.");
}
```

## Common Pitfalls

### ❌ Don't: Call TMDB directly from components

```typescript
// BAD
export default async function Page() {
  const response = await fetch("https://api.themoviedb.org/3/...");
  // ...
}
```

### ✅ Do: Use centralized client

```typescript
// GOOD
import { getTrendingMovies } from "@/lib/tmdb";

export default async function Page() {
  const movies = await getTrendingMovies(locale);
  // ...
}
```

### ❌ Don't: Forget locale parameter

```typescript
// BAD
const movies = await searchMovies("action");
```

### ✅ Do: Always pass locale

```typescript
// GOOD
const movies = await searchMovies("action", locale);
```

### ❌ Don't: Expose API token in client

```typescript
// BAD - Never do this
const token = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;
```

### ✅ Do: Keep token server-side only

```typescript
// GOOD
const token = process.env.TMDB_ACCESS_TOKEN; // No NEXT_PUBLIC_ prefix
```

### ❌ Don't: Skip error handling

```typescript
// BAD
const response = await fetch(url);
return response.json(); // What if it fails?
```

### ✅ Do: Handle errors gracefully

```typescript
// GOOD
try {
  const response = await fetch(url);
  if (!response.ok) return getMockData();
  return response.json();
} catch {
  return getMockData();
}
```

## Security Best Practices

1. **Never commit** API tokens to version control
2. **Use environment variables** for all secrets
3. **Validate responses** before using data
4. **Sanitize user input** in search queries
5. **Rate limit** user-triggered API calls
6. **Log errors** but not sensitive data

## Performance Optimization

1. **Cache aggressively** with appropriate TTLs
2. **Denormalize data** in database for frequently accessed movies
3. **Paginate results** to avoid large payloads
4. **Lazy load images** with Next.js Image component
5. **Prefetch** popular movies during build time

---

**References:**
- Main configuration: `AGENTS.md`
- Caching rules: `.agents/rules/caching.md`
- TMDB client: `src/lib/tmdb.ts`
- TMDB API Documentation: https://developers.themoviedb.org/3