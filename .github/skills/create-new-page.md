# Skill: Create New Page

This skill provides step-by-step instructions for creating a new page in the Movies Tracker Next.js 16 App Router application.

## Prerequisites

- Next.js 16 project with App Router
- Understanding of Server Components vs Client Components
- Familiarity with internationalization (`[locale]` routing)

## When to Use This Skill

- Adding a new route to the application
- Creating a new feature page
- Building a new user-facing screen

## Step-by-Step Instructions

### 1. Determine Page Location

Choose the appropriate directory based on the page type:

```
src/app/[locale]/
├── page.tsx              # Home page
├── movie/
│   └── [id]/
│       └── page.tsx      # Dynamic route (movie details)
├── watchlist/
│   └── page.tsx          # Static route (watchlist)
└── [new-feature]/
    └── page.tsx          # Your new page
```

**Naming Convention**: Use `kebab-case` for directory names

### 2. Create Directory Structure

```bash
# For static route
mkdir -p src/app/[locale]/your-feature

# For dynamic route
mkdir -p src/app/[locale]/your-feature/[id]
```

### 3. Create the Page Component

Create `page.tsx` in the new directory:

```typescript
// src/app/[locale]/your-feature/page.tsx

import { getTranslations } from "next-intl/server";

// Define page metadata
export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations("YourFeature");
  
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

// Server Component (async allowed)
export default async function YourFeaturePage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // 1. Fetch data (if needed)
  const data = await fetchYourData(params.locale);
  
  // 2. Get translations
  const t = await getTranslations("YourFeature");
  
  // 3. Render page
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gradient mb-8">
        {t("heading")}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Content */}
      </div>
    </div>
  );
}
```

### 4. Add Data Fetching (if needed)

Create a data fetching function with caching:

```typescript
// src/lib/your-feature.ts

"use cache";

export async function fetchYourData(locale: string) {
  // Option A: Fetch from TMDB API
  const response = await fetch(
    `https://api.themoviedb.org/3/your-endpoint?language=${locale}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
      next: {
        tags: ["your-feature"],
        revalidate: 3600, // 1 hour
      },
    }
  );
  
  return response.json();
  
  // Option B: Fetch from database
  // import prisma from "./prisma";
  // const data = await prisma.yourModel.findMany({
  //   select: { id: true, name: true },
  // });
  // return data;
}
```

### 5. Create Server Actions (for mutations)

If the page needs mutations (forms, buttons, etc.):

```typescript
// src/lib/your-feature-actions.ts

"use server";

import { ensureUser } from "./actions";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "./prisma";

export async function yourAction(formData: FormData) {
  // 1. Authenticate user
  const user = await ensureUser();
  
  // 2. Validate input
  const name = formData.get("name") as string;
  if (!name) {
    return { success: false, error: "Name is required" };
  }
  
  // 3. Perform mutation
  try {
    await prisma.yourModel.create({
      data: {
        userId: user.id,
        name,
      },
    });
    
    // 4. Revalidate caches
    revalidateTag(`your-feature-${user.id}`);
    revalidatePath("/[locale]/your-feature");
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "An error occurred" };
  }
}
```

### 6. Add Client Components (if needed)

For interactive elements, create Client Components:

```typescript
// src/components/your-feature-form.tsx

"use client";

import { useState } from "react";
import { yourAction } from "@/lib/your-feature-actions";

export function YourFeatureForm() {
  const [pending, setPending] = useState(false);
  
  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await yourAction(formData);
    setPending(false);
    
    if (result.success) {
      // Handle success
    } else {
      // Handle error
    }
  }
  
  return (
    <form action={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        className="w-full px-4 py-3 glass rounded-lg"
        placeholder="Enter name..."
      />
      <button
        type="submit"
        disabled={pending}
        className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

### 7. Add Translations

Add translations to your i18n files:

```json
// messages/en.json
{
  "YourFeature": {
    "pageTitle": "Your Feature - Movies Tracker",
    "pageDescription": "Description of your feature",
    "heading": "Your Feature",
    "emptyState": "No items found"
  }
}

// messages/es.json
{
  "YourFeature": {
    "pageTitle": "Tu Característica - Movies Tracker",
    "pageDescription": "Descripción de tu característica",
    "heading": "Tu Característica",
    "emptyState": "No se encontraron elementos"
  }
}
```

### 8. Add Navigation Link

Update the navigation component:

```typescript
// src/components/navbar.tsx

<Link 
  href="/your-feature"
  className="text-foreground hover:text-accent transition-colors"
>
  {t("yourFeature")}
</Link>
```

### 9. Add Loading State (optional)

Create `loading.tsx` for better UX:

```typescript
// src/app/[locale]/your-feature/loading.tsx

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        <div className="h-12 bg-gray-800 rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 10. Add Error Boundary (optional)

Create `error.tsx` for error handling:

```typescript
// src/app/[locale]/your-feature/error.tsx

"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="glass rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Something went wrong!
        </h2>
        <p className="text-muted mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

## Checklist

Before considering the page complete:

- [ ] Page renders correctly in both light and dark modes
- [ ] Translations added for all locales (en, es, etc.)
- [ ] Data fetching includes proper caching directives
- [ ] Server Actions include authentication checks
- [ ] Client Components use "use client" directive
- [ ] Loading and error states implemented
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Navigation link added to navbar
- [ ] Page metadata defined for SEO
- [ ] Cache revalidation after mutations

## Common Patterns

### Protected Page (Requires Authentication)

```typescript
import { ensureUser } from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  try {
    const user = await ensureUser();
  } catch {
    redirect("/login");
  }
  
  return <div>Protected content for {user.email}</div>;
}
```

### Dynamic Route with Validation

```typescript
export default async function MoviePage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const movieId = Number(params.id);
  
  if (isNaN(movieId)) {
    notFound(); // Shows 404 page
  }
  
  const movie = await getMovieDetails(movieId, params.locale);
  
  if (!movie) {
    notFound();
  }
  
  return <div>{/* Render movie */}</div>;
}
```

### Page with Search Params

```typescript
export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { query?: string; page?: string };
}) {
  const query = searchParams?.query || "";
  const page = Number(searchParams?.page) || 1;
  
  const results = await searchMovies(query, page);
  
  return <div>{/* Render results */}</div>;
}
```

## Testing

Test the new page:

```bash
# Start development server
pnpm dev

# Visit your page
# http://localhost:3000/en/your-feature
# http://localhost:3000/es/your-feature

# Test different scenarios:
# - Load page without authentication (if protected)
# - Submit forms (if applicable)
# - Check responsive design
# - Verify translations
# - Test error states
```

## Related Skills

- `setup-prisma-model.md` - If page needs database models
- `debug-server-action.md` - If Server Actions aren't working

## References

- Architecture rules: `.agents/rules/architecture.md`
- Styling rules: `.agents/rules/styling.md`
- Caching rules: `.agents/rules/caching.md`
- Main configuration: `AGENTS.md`
