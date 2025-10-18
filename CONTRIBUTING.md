# Contributing to MMW Hubix

Thank you for contributing to MMW Hubix! This guide will help you understand our development workflow and quality standards.

## 📋 Table of Contents

- [Development Setup](#development-setup)
- [Code Quality Standards](#code-quality-standards)
- [Testing Requirements](#testing-requirements)
- [Deployment Checklist](#deployment-checklist)
- [Common Patterns](#common-patterns)

## 🚀 Development Setup

### Prerequisites

- Node.js 18+ and npm
- MySQL 8+
- Git

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-org/mmw-hubix.git
cd mmw-hubix

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your MySQL database credentials

# Prepare database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run quality-check    # Run all quality checks
npm run pre-deploy       # Full deployment check
```

## 📐 Code Quality Standards

### TypeScript

- ✅ **Strict mode enabled** - No implicit any
- ✅ **Proper types** - Define interfaces for all data structures
- ✅ **No `any` types** - Use proper typing or `unknown`
- ✅ **Import paths** - Always use `@/` prefix for internal imports

```typescript
// ✅ GOOD
import { prisma } from "@/lib/prisma"
import type { User } from "@/types/auth"

// ❌ BAD
import { prisma } from "../../../lib/prisma"
const user: any = await getUser()
```

### API Routes

- ✅ **Authentication required** - Use `requireAuthAPI()` or `requirePermission()`
- ✅ **No function exports** - Keep helpers in `/lib/` utilities
- ✅ **Error handling** - Wrap all async operations in try/catch
- ✅ **Input validation** - Use Zod schemas for all inputs

```typescript
// ✅ GOOD
import { requireAuthAPI } from "@/lib/auth-server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const user = await requireAuthAPI(["ADMIN"])
  
  try {
    const body = await req.json()
    // Validate with Zod
    const data = await prisma.model.create({ data: body })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Message" }, { status: 500 })
  }
}

// ❌ BAD - Don't export helpers from API routes
export function helperFunction() { ... }
```

### Database

- ✅ **Use Prisma only** - No raw SQL queries
- ✅ **Schema managed in** `prisma/schema.prisma`
- ✅ **Type annotations** - Use MySQL types: `@db.Text`, `@db.VarChar(2048)`
- ✅ **Indexes** - Add indexes for frequently queried fields

```prisma
model Article {
  id        String   @id @default(cuid())
  title     String   @db.VarChar(255)
  content   String   @db.LongText
  slug      String   @unique
  
  @@index([status, publishedAt])
}
```

### React Components

- ✅ **Server Components default** - Only add `"use client"` when needed
- ✅ **Tailwind only** - No inline styles, use `cn()` utility
- ✅ **Accessibility** - Include ARIA labels, semantic HTML
- ✅ **Error boundaries** - Wrap async operations in error handling

```tsx
// ✅ Server Component (default)
export default async function Page() {
  const data = await fetchData()
  return <div>{data.title}</div>
}

// ✅ Client Component (when needed)
"use client"
import { useState } from "react"

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

## 🧪 Testing Requirements

### Before Any Major Change

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Run quality checks**
   ```bash
   npm run quality-check
   ```

### After Any Major Change - MANDATORY

#### 1. Automated Checks

```bash
# Run all critical checks
npm run quality-check

# Expected: ✅ All checks passed
```

#### 2. Build Verification

```bash
npx next build

# Expected: ✅ Compiled successfully
# Check: No TypeScript errors, bundle size reasonable
```

#### 3. TypeScript Validation

```bash
npx tsc --noEmit

# Expected: ✅ No type errors
```

#### 4. Development Server Test

```bash
npm run dev

# Expected: ✅ Server starts without errors
# Test: Navigate to http://localhost:3000
# Verify: All pages load correctly
```

#### 5. Manual Testing Checklist

- [ ] **API Endpoints** - Test all new/modified endpoints
- [ ] **Authentication** - Login/logout/password changes work
- [ ] **Database** - CRUD operations function correctly
- [ ] **Cross-Browser** - Test in Chrome, Firefox, Safari, Edge
- [ ] **Mobile** - Verify responsive design
- [ ] **Security** - Input validation and auth checks in place

### Database Migration Testing

If you modified the Prisma schema:

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Apply schema changes
npx prisma db push

# 3. Verify migrations
npx prisma studio

# 4. Test CRUD operations
```

## 🚨 Deployment Checklist

### Pre-Deployment - ALL Required ✅

- [ ] ✅ **Quality check passed**: `npm run quality-check`
- [ ] ✅ **Build successful**: `npx next build`
- [ ] ✅ **No TypeScript errors**: `npx tsc --noEmit`
- [ ] ✅ **No ESLint errors**: `npx next lint`
- [ ] ✅ **All tests passed**: Manual testing complete
- [ ] ✅ **Documentation updated**: README/docs updated if needed
- [ ] ✅ **Database migrated**: Schema changes applied
- [ ] ✅ **Security review**: Auth/validation/permissions checked
- [ ] ✅ **Performance check**: Bundle size acceptable

### Critical Failure Conditions

**STOP DEPLOYMENT IF ANY OF THESE OCCUR:**

- ❌ Build fails with compilation errors
- ❌ TypeScript type errors
- ❌ Authentication broken
- ❌ Database migration failures
- ❌ API endpoints returning 500 errors
- ❌ Critical functionality not working

### Quality Metrics Targets

- **Build time**: < 30 seconds
- **Bundle size increase**: < 10% per feature
- **Page load time**: < 3 seconds
- **Zero critical security vulnerabilities**
- **Zero TypeScript errors**
- **Zero ESLint errors**

## 🎨 Common Patterns

### Authentication Pattern

```typescript
// Server Component (Page)
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    redirect("/unauthorized")
  }
  return <div>Admin Content</div>
}

// API Route
import { requireAuthAPI } from "@/lib/auth-server"

export async function GET(req: Request) {
  const user = await requireAuthAPI(["ADMIN"])
  // User is authenticated and has ADMIN role
}
```

### Error Handling Pattern

```typescript
// API Route
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = await someAsyncOperation(body)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    logger.error('Operation failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Client Component
"use client"
import { toast } from "sonner"

async function handleSubmit() {
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed')
    }
    
    toast.success("Success!")
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Failed")
  }
}
```

### Form Validation Pattern

```typescript
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const formSchema = z.object({
  title: z.string().min(1, "Title required").max(100),
  email: z.string().email("Invalid email"),
  age: z.number().min(0).max(120)
})

export function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", email: "", age: 0 }
  })
  
  const onSubmit = form.handleSubmit(async (data) => {
    // Submit validated data
  })
  
  return <form onSubmit={onSubmit}>...</form>
}
```

## 📚 Additional Resources

- **API Documentation**: See [docs/API.md](./docs/API.md)
- **Permission System**: See [docs/DYNAMIC_PERMISSIONS.md](./docs/DYNAMIC_PERMISSIONS.md)
- **Notification System**: See [docs/NOTIFICATIONS.md](./docs/NOTIFICATIONS.md)
- **Settings System**: See [docs/SETTINGS_IMPLEMENTATION.md](./docs/SETTINGS_IMPLEMENTATION.md)
- **Project Rules**: See [.windsurf/rules/rule.md](./.windsurf/rules/rule.md)

## 🤝 Pull Request Process

1. Create feature branch from `main`
2. Make changes following code quality standards
3. Run all quality checks
4. Update documentation if needed
5. Create pull request with description
6. Request code review
7. Address review feedback
8. Merge after approval

## 📝 Commit Message Format

```
feat: Add user profile page
fix: Resolve login redirect issue
docs: Update API documentation
refactor: Simplify auth middleware
test: Add unit tests for auth service
```

## ❓ Getting Help

If you encounter issues:
1. Check this documentation
2. Review error messages carefully
3. Search existing issues on GitHub
4. Ask in team chat/discussion
5. Create a new issue with details

---

**Remember**: Quality over speed. A bug-free deployment is better than a fast deployment with issues.
