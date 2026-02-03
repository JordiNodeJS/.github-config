# Authentication Rules

This file contains authentication and authorization guidelines for the Movies Tracker project.

## Overview

Movies Tracker uses a **custom JWT-based authentication system** with secure cookie storage. This approach provides stateless authentication without relying on third-party auth services.

## Authentication Flow

### Complete User Journey

```
Registration Flow:
1. User submits registration form → register() Server Action
2. Password hashed with scrypt (random 16-byte salt)
3. User record created in database (hash.salt format)
4. Redirect to login page

Login Flow:
1. User submits login form → login() Server Action
2. Credentials validated against database
3. Password verified using constant-time comparison
4. JWT token generated and signed with HS256
5. Token stored in httpOnly cookie (7-day expiry)
6. Redirect to home page

Protected Operation:
1. Server Action calls ensureUser()
2. JWT token extracted from cookies
3. Token signature verified
4. User ID extracted from payload
5. User record fetched from database
6. Operation proceeds with authenticated user

Logout Flow:
1. User triggers logout → logout() Server Action
2. auth_token cookie deleted
3. Redirect to home page
```

## Key Authentication Files

### `src/lib/auth-actions.ts`

Contains all authentication Server Actions:
- `register(formData: FormData)` - User registration
- `login(formData: FormData)` - User login
- `logout()` - User logout

**Pattern:**
```typescript
"use server";

import { hashPassword, signJWT } from "./auth-utils";
import prisma from "./prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate credentials
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  // Verify password
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) throw new Error("Invalid credentials");

  // Create JWT
  const token = await signJWT({ userId: user.id, email: user.email });

  // Store in cookie
  cookies().set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  });

  redirect("/");
}
```

### `src/lib/auth-utils.ts`

Contains cryptographic utilities:
- `hashPassword(password: string)` - Hash password with scrypt
- `verifyPassword(password: string, hash: string)` - Verify password
- `signJWT(payload: JWTPayload)` - Create and sign JWT token
- `verifyJWT(token: string)` - Verify and decode JWT token

**Implementation Details:**
```typescript
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Password Hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${(derivedKey as Buffer).toString("hex")}.${salt}`;
}

// Password Verification (constant-time)
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const [hashedPassword, salt] = hash.split(".");
  const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  return timingSafeEqual(hashedPasswordBuf, derivedKey as Buffer);
}

// JWT Implementation
export async function signJWT(payload: JWTPayload): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedBody = base64urlEncode(JSON.stringify(body));
  const signature = await createSignature(encodedHeader, encodedBody);

  return `${encodedHeader}.${encodedBody}.${signature}`;
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  const [encodedHeader, encodedBody, providedSignature] = token.split(".");
  
  // Verify signature
  const expectedSignature = await createSignature(encodedHeader, encodedBody);
  if (!timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature))) {
    throw new Error("Invalid token signature");
  }

  // Decode payload
  const payload = JSON.parse(base64urlDecode(encodedBody));
  return payload;
}
```

### `src/lib/actions.ts`

Contains the `ensureUser()` middleware function used to protect Server Actions:

```typescript
import { cookies } from "next/headers";
import { verifyJWT } from "./auth-utils";
import prisma from "./prisma";

export async function ensureUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  try {
    const payload = await verifyJWT(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new Error("Unauthorized");
    }

    return user;
  } catch (error) {
    throw new Error("Unauthorized");
  }
}
```

## JWT Implementation Details

### Token Structure

```
header.body.signature
```

**Header (base64url encoded):**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Body/Payload (base64url encoded):**
```json
{
  "userId": "clx1234567890",
  "email": "user@example.com",
  "iat": 1704067200
}
```

**Signature:**
- Algorithm: HMAC-SHA256
- Secret: `JWT_SECRET` environment variable
- Input: `base64url(header).base64url(body)`

### Security Features

1. **Constant-Time Comparison**: Uses `timingSafeEqual` to prevent timing attacks
2. **Secure Secret**: Minimum 32 characters, stored in environment variables
3. **httpOnly Cookies**: Prevents JavaScript access to tokens
4. **Secure Flag**: HTTPS-only in production
5. **SameSite Protection**: Set to "lax" to prevent CSRF

## Password Security

### Hashing Algorithm

- **Algorithm**: scrypt (preferred over bcrypt for this use case)
- **Salt**: Random 16-byte salt per password
- **Key Length**: 64 bytes
- **Storage Format**: `hash.salt` (both hex-encoded)

### Why scrypt?

- Memory-hard algorithm (resistant to hardware attacks)
- Adjustable computational cost
- Built into Node.js crypto module (no dependencies)
- Industry-standard for password hashing

### Password Requirements

Implement these on the client-side validation:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (optional but recommended)

## Session Management

### Cookie Configuration

```typescript
cookies().set("auth_token", token, {
  httpOnly: true,              // Prevents XSS attacks
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  maxAge: 60 * 60 * 24 * 7,   // 7 days in seconds
  sameSite: "lax",            // CSRF protection
  path: "/",                  // Available site-wide
});
```

### Cookie Attributes Explained

- **httpOnly**: Cookie cannot be accessed via JavaScript (prevents XSS)
- **secure**: Cookie only sent over HTTPS (production only)
- **maxAge**: Cookie expires after 7 days
- **sameSite**: "lax" allows cookies on top-level navigation
- **path**: "/" makes cookie available across entire site

## Protected Server Actions Pattern

### Basic Pattern

```typescript
"use server";

import { ensureUser } from "@/lib/actions";
import prisma from "@/lib/prisma";

export async function addToWatchlist(movieId: number) {
  // 1. Authenticate user
  const user = await ensureUser(); // Throws if unauthorized

  // 2. Perform operation with user context
  const watchlistItem = await prisma.watchlist.create({
    data: {
      userId: user.id,
      movieId,
      title: "Movie Title",
      posterPath: "/path.jpg",
      voteAverage: 8.5,
    },
  });

  // 3. Revalidate caches
  revalidateTag(`watchlist-${user.id}`);
  revalidatePath(`/[locale]/watchlist`);

  return watchlistItem;
}
```

### Advanced Pattern (with error handling)

```typescript
"use server";

import { ensureUser } from "@/lib/actions";
import prisma from "@/lib/prisma";

export async function removeFromWatchlist(movieId: number) {
  try {
    const user = await ensureUser();

    const deleted = await prisma.watchlist.deleteMany({
      where: {
        userId: user.id,
        movieId,
      },
    });

    if (deleted.count === 0) {
      return { success: false, error: "Movie not in watchlist" };
    }

    revalidateTag(`watchlist-${user.id}`);
    revalidatePath(`/[locale]/watchlist`);

    return { success: true };
  } catch (error) {
    if (error.message === "Unauthorized") {
      return { success: false, error: "Please log in" };
    }
    return { success: false, error: "An error occurred" };
  }
}
```

## Environment Variables

### Required Variables

```bash
# .env.local
JWT_SECRET=your-super-secret-key-min-32-characters-long
```

### Security Best Practices

1. **Never commit** `.env.local` to version control
2. **Generate strong secrets**: Use `openssl rand -base64 32`
3. **Rotate secrets** in production periodically
4. **Different secrets** for dev/staging/prod environments
5. **Store in Vercel** dashboard for production deployment

## Authorization Patterns

### Route Protection (Server Component)

```typescript
// app/[locale]/watchlist/page.tsx
import { ensureUser } from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function WatchlistPage() {
  try {
    const user = await ensureUser();
  } catch {
    redirect("/login");
  }

  // Render protected content
  return <div>Watchlist for {user.email}</div>;
}
```

### Conditional Rendering

```typescript
// components/navbar.tsx
import { cookies } from "next/headers";

export default async function Navbar() {
  const token = cookies().get("auth_token")?.value;
  const isAuthenticated = !!token;

  return (
    <nav>
      {isAuthenticated ? (
        <>
          <Link href="/watchlist">My Watchlist</Link>
          <LogoutButton />
        </>
      ) : (
        <>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
```

## Common Authentication Pitfalls

### ❌ Don't: Store tokens in localStorage

```typescript
// BAD - Vulnerable to XSS attacks
localStorage.setItem("token", jwtToken);
```

### ✅ Do: Use httpOnly cookies

```typescript
// GOOD - Protected from XSS
cookies().set("auth_token", token, { httpOnly: true });
```

### ❌ Don't: Expose JWT secret in client code

```typescript
// BAD - Never do this
const secret = process.env.NEXT_PUBLIC_JWT_SECRET;
```

### ✅ Do: Keep secret server-side only

```typescript
// GOOD - Server-side only
const secret = process.env.JWT_SECRET; // No NEXT_PUBLIC_ prefix
```

### ❌ Don't: Use simple string comparison for passwords

```typescript
// BAD - Vulnerable to timing attacks
if (hashedPassword === providedHash) { /* ... */ }
```

### ✅ Do: Use constant-time comparison

```typescript
// GOOD - Prevents timing attacks
import { timingSafeEqual } from "crypto";
if (timingSafeEqual(Buffer.from(hash1), Buffer.from(hash2))) { /* ... */ }
```

### ❌ Don't: Forget to handle unauthorized errors

```typescript
// BAD - No error handling
export async function protectedAction() {
  const user = await ensureUser(); // What if this throws?
  await doSomething();
}
```

### ✅ Do: Implement proper error handling

```typescript
// GOOD - Graceful error handling
export async function protectedAction() {
  try {
    const user = await ensureUser();
    await doSomething();
    return { success: true };
  } catch (error) {
    if (error.message === "Unauthorized") {
      return { success: false, error: "Please log in" };
    }
    return { success: false, error: "An error occurred" };
  }
}
```

## Testing Authentication

### Manual Testing Checklist

- [ ] Registration creates user with hashed password
- [ ] Login sets auth_token cookie
- [ ] Protected routes redirect when not authenticated
- [ ] Protected Server Actions throw when not authenticated
- [ ] Logout clears auth_token cookie
- [ ] JWT tokens expire after 7 days
- [ ] Password verification works correctly
- [ ] Invalid tokens are rejected

### Development Tips

- Use browser DevTools → Application → Cookies to inspect auth_token
- Check cookie flags (HttpOnly, Secure, SameSite)
- Verify token expiration time
- Test with expired/invalid tokens

## Migration Considerations

If moving to a third-party auth service (NextAuth, Clerk, etc.):

1. Keep `ensureUser()` interface the same
2. Swap JWT verification with provider's session check
3. Update cookie handling to match provider
4. Migrate user records to new schema
5. Update all auth imports

---

**References:**
- Main configuration: `AGENTS.md`
- Architecture rules: `.agents/rules/architecture.md`
- JWT specification: [RFC 7519](https://tools.ietf.org/html/rfc7519)
- scrypt: [RFC 7914](https://tools.ietf.org/html/rfc7914)