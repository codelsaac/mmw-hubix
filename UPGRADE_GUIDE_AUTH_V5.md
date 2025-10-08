# 🔐 Upgrade Guide: NextAuth v4 → Auth.js v5

## ⚠️ Why Upgrade?

**Your Current Version:** `next-auth@4.24.10`  
**Recommended Version:** `next-auth@5.x` (Auth.js)

### Benefits:
- ✅ **Better Next.js 15 support** - Native App Router integration
- ✅ **Full TypeScript support** - No more type gymnastics
- ✅ **React Server Components** - Use `auth()` directly in RSC
- ✅ **Improved security** - Better session handling
- ✅ **Active development** - v4 is maintenance-only

### Risks of Not Upgrading:
- ⚠️ No new features or improvements
- ⚠️ Potential compatibility issues with Next.js 15+
- ⚠️ Missing security patches (only critical bugs fixed in v4)
- ⚠️ Outdated documentation and community support

**Migration Effort:** 🟡 Medium (2-4 hours)  
**Risk Level:** 🟡 Low-Medium (well-documented migration path)

---

## 🚀 Step-by-Step Upgrade Process

### Phase 1: Preparation (30 min)

#### 1. Backup Current Code
```bash
git checkout -b upgrade/auth-v5
git commit -am "Backup before Auth.js v5 upgrade"
```

#### 2. Review Current Setup
Your current auth setup:
- `auth.ts` - Auth configuration with demo accounts
- `app/api/auth/[...nextauth]/route.ts` - Auth API route
- Various protected routes using `getServerSession()`

#### 3. Read Official Migration Guide
```bash
# Official guide
open https://authjs.dev/getting-started/migrating-to-v5
```

---

### Phase 2: Installation (15 min)

#### 1. Update Dependencies
```bash
# Remove old version
npm uninstall next-auth

# Install v5 (check if stable or beta)
npm install next-auth@beta @auth/prisma-adapter@latest

# Or if v5 is stable:
# npm install next-auth@latest @auth/prisma-adapter@latest
```

#### 2. Update `package.json`
Your new dependencies should look like:
```json
{
  "dependencies": {
    "@auth/prisma-adapter": "^3.x.x",  // Updated
    "next-auth": "^5.x.x",              // Updated
    // ... rest stays the same
  }
}
```

---

### Phase 3: Code Migration (1-2 hours)

#### 1. Create New Auth Config

**Before (`auth.ts`):**
```typescript
import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  // ... config
}

export default NextAuth(authOptions)
```

**After (`auth.config.ts`):**
```typescript
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authConfig = {
  providers: [
    CredentialsProvider({
      // ... same credentials config
    })
  ],
  callbacks: {
    // Updated callback signatures
  },
  // ... rest of config
} satisfies NextAuthConfig

export default authConfig
```

#### 2. Create Auth Instance (`auth.ts`)

**New file structure:**
```typescript
// auth.ts
import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { UserRole } from "@/lib/permissions"

const DEMO_ACCOUNTS = [
  // ... your existing demo accounts
]

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      if (token.username && session.user) {
        session.user.username = token.username as string
      }
      if (token.role && session.user) {
        session.user.role = token.role as string
      }
      if (token.department && session.user) {
        session.user.department = token.department as string
      }
      if (token.description && session.user) {
        session.user.description = token.description as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username
        token.role = user.role
        token.department = user.department
        token.description = user.description
      }
      return token
    },
  },
})
```

#### 3. Update Auth Route Handler

**Before (`app/api/auth/[...nextauth]/route.ts`):**
```typescript
import NextAuth from "next-auth"
import { authOptions } from "@/auth"

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**After (`app/api/auth/[...nextauth]/route.ts`):**
```typescript
import { handlers } from "@/auth"

export const { GET, POST } = handlers
```

✅ **Much simpler!**

#### 4. Update Protected Route Checks

**Before:**
```typescript
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  // ... rest of code
}
```

**After:**
```typescript
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  // ... rest of code
}
```

✅ **No more passing authOptions everywhere!**

#### 5. Update Client Components

**Before:**
```typescript
import { useSession } from "next-auth/react"

export function Component() {
  const { data: session, status } = useSession()
  // ... rest
}
```

**After:**
```typescript
// Same! No changes needed
import { useSession } from "next-auth/react"

export function Component() {
  const { data: session, status } = useSession()
  // ... rest
}
```

✅ **Client hooks stay the same!**

#### 6. Update Middleware (if you have any)

**Before:**
```typescript
import { getToken } from "next-auth/jwt"

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  // ...
}
```

**After:**
```typescript
import { auth } from "@/auth"

export default auth((req) => {
  // req.auth contains session data
  if (!req.auth && req.nextUrl.pathname !== "/login") {
    return Response.redirect(new URL("/login", req.url))
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
```

---

### Phase 4: Type Definitions (30 min)

#### Update `types/next-auth.d.ts`

**Before:**
```typescript
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username?: string
      role?: string
      // ...
    }
  }
}
```

**After:**
```typescript
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username?: string
      role?: string
      department?: string
      description?: string
    } & DefaultSession["user"]
  }

  interface User {
    username?: string
    role?: string
    department?: string
    description?: string
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    username?: string
    role?: string
    department?: string
    description?: string
  }
}
```

---

### Phase 5: Testing (30-60 min)

#### 1. Test Authentication Flow
```bash
npm run dev
```

**Test Cases:**
- ✅ Login with admin account
- ✅ Login with helper account
- ✅ Login with guest account
- ✅ Logout
- ✅ Access protected routes when logged in
- ✅ Redirect when not logged in
- ✅ Session persistence across page refresh

#### 2. Test API Routes
- ✅ `/api/admin/*` routes require admin role
- ✅ `/api/dashboard/*` routes require authentication
- ✅ Public routes work without auth

#### 3. Test Components
- ✅ User menu displays correct user info
- ✅ Role-based navigation works
- ✅ Protected components render correctly

---

### Phase 6: Deployment (15 min)

#### 1. Update Environment Variables
Ensure `NEXTAUTH_SECRET` is set in production:
```bash
# Generate new secret (optional but recommended)
openssl rand -base64 32
```

#### 2. Deploy & Verify
```bash
npm run build
npm start

# Or deploy to Vercel/Netlify
git push origin upgrade/auth-v5
```

---

## 🎯 Quick Reference: Key Changes

| What | Before (v4) | After (v5) |
|------|-------------|------------|
| **Config Export** | `authOptions: NextAuthOptions` | `NextAuth({ ... })` returns helpers |
| **Get Session** | `getServerSession(authOptions)` | `auth()` |
| **API Route** | `NextAuth(authOptions)` handler | `handlers` from auth |
| **Middleware** | `getToken()` | `auth()` with request |
| **Types** | Import from `next-auth` | Also from `@auth/core/*` |

---

## 🐛 Common Issues & Solutions

### Issue 1: TypeScript Errors
**Problem:** `Type 'X' is not assignable to type 'Y'`  
**Solution:** Update type definitions in `types/next-auth.d.ts`

### Issue 2: Session Not Persisting
**Problem:** User gets logged out immediately  
**Solution:** Check `NEXTAUTH_SECRET` environment variable

### Issue 3: Callback URL Issues
**Problem:** Redirects not working  
**Solution:** Update `NEXTAUTH_URL` in production

### Issue 4: Build Errors
**Problem:** `Cannot find module 'next-auth'`  
**Solution:** Delete `node_modules`, `package-lock.json`, reinstall

---

## 📚 Additional Resources

- [Auth.js Documentation](https://authjs.dev)
- [Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [Next.js 15 + Auth.js Examples](https://github.com/nextauthjs/next-auth/tree/main/apps/examples/nextjs)

---

## ✅ Checklist

- [ ] Backup current code (git branch)
- [ ] Update dependencies
- [ ] Create new auth config
- [ ] Update auth route handler
- [ ] Replace `getServerSession` with `auth()`
- [ ] Update type definitions
- [ ] Test all authentication flows
- [ ] Test protected routes
- [ ] Update environment variables
- [ ] Build & deploy
- [ ] Verify in production

---

**Estimated Total Time:** 2-4 hours  
**Difficulty:** Medium  
**Recommended:** ✅ Yes, definitely worth it

Once complete, merge the branch and enjoy better authentication! 🎉
