# Styling Rules

This file contains styling guidelines, Tailwind CSS 4 usage patterns, and design system rules for the Movies Tracker project.

## Overview

Movies Tracker uses **Tailwind CSS 4** with a custom "Avant-Garde" theme featuring minimalist design, high contrast, and glassmorphism effects.

## Design Philosophy

### Avant-Garde Theme

**Core Principles:**
- **Minimalism**: Clean layouts with generous whitespace
- **High Contrast**: Bold color differences for readability
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Smooth Transitions**: Subtle animations for better UX
- **Typography**: Clear hierarchy with modern fonts

## Tailwind CSS 4

### Utility-First Approach

**Always use Tailwind utility classes, never inline styles:**

```typescript
// Good ✓
<div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
  <h1 className="text-2xl font-bold text-white">Movies</h1>
</div>

// Bad ✗
<div style={{ display: "flex", padding: "1rem", background: "#111" }}>
  <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Movies</h1>
</div>
```

### Configuration

Tailwind configuration is in `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        accent: "var(--color-accent)",
      },
    },
  },
  plugins: [],
};
```

## Custom Utilities

### Glass Effect

Apply glassmorphism to containers:

```typescript
// CSS (in globals.css)
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-hover {
  transition: all 0.3s ease;
}

.glass-hover:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

// Usage
<div className="glass glass-hover rounded-xl p-6">
  <h2>Card Content</h2>
</div>
```

### Text Gradient

Create gradient text effects:

```typescript
// CSS (in globals.css)
.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

// Usage
<h1 className="text-gradient text-4xl font-bold">
  Movies Tracker
</h1>
```

## CSS Variables

### Color System

Define colors using CSS custom properties:

```css
/* globals.css */
:root {
  --color-background: #0a0a0a;
  --color-foreground: #ffffff;
  --color-accent: #667eea;
  --color-muted: #6b7280;
}

.dark {
  --color-background: #0a0a0a;
  --color-foreground: #ffffff;
  --color-accent: #667eea;
}

.light {
  --color-background: #ffffff;
  --color-foreground: #0a0a0a;
  --color-accent: #4f46e5;
}
```

### Usage in Components

```typescript
<div className="bg-background text-foreground">
  <button className="bg-accent hover:bg-accent/90">
    Click Me
  </button>
</div>
```

## Component Styling Patterns

### Card Components

```typescript
export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <div className="glass glass-hover rounded-xl overflow-hidden transition-transform hover:scale-105">
      <img 
        src={movie.posterPath} 
        alt={movie.title}
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-foreground">
          {movie.title}
        </h3>
        <p className="text-sm text-muted mt-2">
          Rating: {movie.voteAverage}
        </p>
      </div>
    </div>
  );
}
```

### Button Components

```typescript
// Primary Button
<button className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors">
  Add to Watchlist
</button>

// Secondary Button
<button className="px-6 py-3 glass glass-hover text-foreground rounded-lg font-medium">
  Learn More
</button>

// Ghost Button
<button className="px-6 py-3 text-accent hover:bg-accent/10 rounded-lg font-medium transition-colors">
  Cancel
</button>
```

### Input Components

```typescript
<input 
  type="text"
  className="w-full px-4 py-3 glass rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
  placeholder="Search movies..."
/>
```

### Navigation

```typescript
<nav className="glass border-b border-white/10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-bold text-gradient">
          Movies
        </Link>
        <div className="flex gap-4">
          <Link 
            href="/trending" 
            className="text-foreground hover:text-accent transition-colors"
          >
            Trending
          </Link>
          <Link 
            href="/watchlist" 
            className="text-foreground hover:text-accent transition-colors"
          >
            Watchlist
          </Link>
        </div>
      </div>
    </div>
  </div>
</nav>
```

## Dark Mode

### Implementation

Use Tailwind's dark mode with class strategy:

```typescript
// ThemeProvider context
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<{
  theme: "light" | "dark";
  toggleTheme: () => void;
}>({ theme: "dark", toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

### Dark Mode Utilities

```typescript
// Light/Dark mode variants
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <p className="text-gray-600 dark:text-gray-400">
    This text adapts to theme
  </p>
</div>
```

## Icons

### Lucide React

Use `lucide-react` exclusively for icons:

```typescript
import { Star, Heart, Play, ChevronRight } from "lucide-react";

export function MovieActions() {
  return (
    <div className="flex gap-2">
      <button className="p-2 glass glass-hover rounded-full">
        <Heart className="w-5 h-5 text-red-500" />
      </button>
      <button className="p-2 glass glass-hover rounded-full">
        <Star className="w-5 h-5 text-yellow-500" />
      </button>
      <button className="p-2 bg-accent hover:bg-accent/90 rounded-full transition-colors">
        <Play className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
```

### Icon Sizing

```typescript
// Small
<Star className="w-4 h-4" />

// Medium (default)
<Star className="w-5 h-5" />

// Large
<Star className="w-6 h-6" />

// Extra Large
<Star className="w-8 h-8" />
```

## Responsive Design

### Mobile-First Approach

Always start with mobile styles, then add larger breakpoints:

```typescript
<div className="
  flex flex-col          // Mobile: stack vertically
  sm:flex-row           // Small screens: horizontal
  gap-4                 // Mobile gap
  sm:gap-6              // Larger gap on small screens
  p-4                   // Mobile padding
  lg:p-8                // Larger padding on large screens
">
  <div className="
    w-full               // Mobile: full width
    sm:w-1/2             // Small screens: half width
    lg:w-1/3             // Large screens: one third
  ">
    Content
  </div>
</div>
```

### Breakpoints

```typescript
// Tailwind default breakpoints:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px

<div className="
  grid 
  grid-cols-1          // Mobile: 1 column
  sm:grid-cols-2       // Small: 2 columns
  md:grid-cols-3       // Medium: 3 columns
  lg:grid-cols-4       // Large: 4 columns
  gap-4
">
  {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
</div>
```

## Animations & Transitions

### Transition Utilities

```typescript
// Duration
<button className="transition-colors duration-200">Fast</button>
<button className="transition-colors duration-300">Normal</button>
<button className="transition-colors duration-500">Slow</button>

// Timing Functions
<button className="transition-all ease-in">Ease In</button>
<button className="transition-all ease-out">Ease Out</button>
<button className="transition-all ease-in-out">Ease In Out</button>

// Multiple Properties
<button className="transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
  Hover Me
</button>
```

### Hover Effects

```typescript
// Scale
<div className="hover:scale-105 transition-transform">Scale on hover</div>

// Shadow
<div className="hover:shadow-2xl transition-shadow">Shadow on hover</div>

// Opacity
<div className="opacity-80 hover:opacity-100 transition-opacity">Fade in</div>

// Background
<div className="bg-gray-800 hover:bg-gray-700 transition-colors">BG change</div>
```

## Layout Patterns

### Container

```typescript
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content constrained to max width with responsive padding */}
</div>
```

### Grid Layouts

```typescript
// Auto-fit responsive grid
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Fixed columns with responsive breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Flexbox Layouts

```typescript
// Centered content
<div className="flex items-center justify-center min-h-screen">
  <div>Centered Content</div>
</div>

// Space between
<div className="flex items-center justify-between p-4">
  <div>Left</div>
  <div>Right</div>
</div>

// Column with gap
<div className="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Common Pitfalls

### ❌ Don't: Use inline styles

```typescript
// BAD
<div style={{ padding: "1rem", backgroundColor: "#111" }}>
  Content
</div>
```

### ✅ Do: Use Tailwind classes

```typescript
// GOOD
<div className="p-4 bg-gray-900">
  Content
</div>
```

### ❌ Don't: Mix CSS modules with Tailwind

```typescript
// BAD
import styles from "./component.module.css";

<div className={`${styles.container} flex items-center`}>
  Mixed approaches
</div>
```

### ✅ Do: Use Tailwind exclusively

```typescript
// GOOD
<div className="flex items-center p-4 bg-gray-900 rounded-lg">
  Consistent approach
</div>
```

### ❌ Don't: Forget responsive design

```typescript
// BAD - Fixed width, not responsive
<div className="w-96">
  Content
</div>
```

### ✅ Do: Use responsive utilities

```typescript
// GOOD - Responsive width
<div className="w-full md:w-96">
  Content
</div>
```

### ❌ Don't: Hardcode colors

```typescript
// BAD
<div className="bg-[#667eea]">
  Content
</div>
```

### ✅ Do: Use CSS variables

```typescript
// GOOD
<div className="bg-accent">
  Content
</div>
```

## Accessibility

### Focus States

Always include visible focus states:

```typescript
<button className="
  px-4 py-2 
  bg-accent 
  rounded-lg
  focus:outline-none 
  focus:ring-2 
  focus:ring-accent 
  focus:ring-offset-2 
  focus:ring-offset-background
">
  Accessible Button
</button>
```

### Color Contrast

Ensure sufficient contrast for readability:

```typescript
// Good contrast
<div className="bg-gray-900 text-white">High contrast</div>

// Poor contrast (avoid)
<div className="bg-gray-800 text-gray-700">Low contrast</div>
```

### Screen Reader Text

```typescript
<button className="p-2 glass rounded-full" aria-label="Add to favorites">
  <Heart className="w-5 h-5" />
  <span className="sr-only">Add to favorites</span>
</button>
```

## Performance

### Purge Unused Styles

Tailwind automatically purges unused styles in production. Ensure all class names are complete strings:

```typescript
// Good ✓
const buttonClass = isActive ? "bg-accent" : "bg-gray-800";

// Bad ✗ (won't be detected by purge)
const buttonClass = `bg-${color}-800`;
```

### Avoid Dynamic Class Names

```typescript
// Bad ✗ - Dynamic classes won't be purged correctly
<div className={`text-${color}-500`}>Text</div>

// Good ✓ - Use conditional logic
<div className={color === "red" ? "text-red-500" : "text-blue-500"}>
  Text
</div>
```

## Style Guide Summary

| Element | Classes | Purpose |
|---------|---------|---------|
| Glass Container | `glass glass-hover rounded-xl` | Glassmorphism effect |
| Primary Button | `px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90` | Main actions |
| Card | `glass rounded-xl overflow-hidden hover:scale-105 transition-transform` | Content cards |
| Input | `glass rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent` | Form inputs |
| Gradient Text | `text-gradient` | Hero headings |

---

**References:**
- Main configuration: `AGENTS.md`
- Architecture rules: `.agents/rules/architecture.md`
- Tailwind CSS: https://tailwindcss.com/docs
- Lucide Icons: https://lucide.dev/