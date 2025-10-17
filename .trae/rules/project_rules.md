# MMW Hubix - Project Rules & Quality Assurance

## 📚 Documentation
For detailed guides, see:
- **[CONTRIBUTING.md](../../CONTRIBUTING.md)** - Development workflow & testing procedures
- **[docs/](../../docs/)** - API, Notifications, Permissions, Settings documentation
- **[README.md](../../README.md)** - Project overview

## Tech Stack
- Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Prisma ORM: MySQL (production) / SQLite (dev with `npm run dev:sqlite`)
- NextAuth.js: **USERNAME-based auth** (NOT email)
- Zod validation, React Hook Form, Recharts, React Data Grid

## Key Conventions
- **Files**: Components `kebab-case.tsx`, Pages `page.tsx`, API [route.ts](cci:7://file:///c:/Users/user/Documents/IT%20perfect/mmw-hubix/app/api/dashboard/profile/route.ts:0:0-0:0), Hooks `use-*.ts` 
- **Components**: Server Components default, add `"use client"` only when needed (state/effects)
- **Imports**: `@/components/*`, `@/lib/*`, `@/hooks/*`, `@/app/*` 
- **Styling**: Tailwind only, use `cn()` from `lib/utils.ts`, no inline styles

## Auth & Roles
- **Roles**: ADMIN (full access) / HELPER (dashboard) / GUEST (read-only)
- **Server**: Use `auth()` in pages, `requireAuth(["ADMIN"])` in API routes
- **Always validate permissions server-side**

## Database Models
- **User**: username-based auth, roles, permissions, activity tracking
- **Article**: CMS system with slug, content, status, featured images
- **Announcement**: Club events with attendees, location, scheduling
- **TrainingResource**: Videos, text, files with categories and difficulty
- **PublicEvent/InternalEvent**: Calendar system with attendees
- **Activity/Task**: Team management with assignments and priorities
- **Resource**: External links organized by category
- **SiteSetting**: Database-backed configuration system
- **Notification**: Real-time notifications with priority levels

## Core Features
- **Articles CMS**: Full content management with drafts, publishing, SEO
- **Announcements**: Club event management with RSVP system
- **Training Library**: Multi-format resources (video/text/file) with search
- **Calendar System**: Public and internal events with attendee management
- **AI Chat Assistant**: Conversational support for campus navigation
- **File Uploads**: Secure document/image/video handling with validation
- **Activity Management**: Task assignment and team coordination
- **Resource Hub**: Curated external links with click tracking
- **User Profile & Settings**: Personal profile management with password change functionality
- **Notification System**: Real-time notifications with role targeting

## Database
- Use singleton: `import { prisma } from "@/lib/prisma"` 
- Primary keys: `cuid()` for cross-DB compatibility
- MySQL types: `@db.Text`, `@db.VarChar(2048)`, `@db.VarChar(255)`, `@db.LongText` 
- Keep `schema.prisma` and `schema.sqlite.prisma` in sync
- Use proper indexes for performance: `@@index([status, publishedAt])` 

## API Patterns
```typescript
import { requireAuth } from "@/lib/auth-middleware"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await requireAuth(["ADMIN"])
  try {
    const data = await prisma.model.findMany()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Message" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await requireAuth(["ADMIN"])
  try {
    const body = await req.json()
    // Validate with Zod schema
    const data = await prisma.model.create({ data: body })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Message" }, { status: 500 })
  }
}
```

## Security & Validation
- **Input Validation**: Use Zod schemas for all API endpoints
- **File Uploads**: Validate file types, sizes, and signatures
- **CSRF Protection**: Implement CSRF tokens for state-changing operations
- **Rate Limiting**: Prevent abuse with request throttling
- **SQL Injection**: Use Prisma parameterized queries only
- **XSS Prevention**: Sanitize all user-generated content

## File Organization
```
app/
├── admin/           # Admin console pages
├── api/            # API routes
│   ├── admin/      # Admin-only endpoints
│   ├── public/     # Public endpoints
│   └── dashboard/  # Authenticated user endpoints
├── articles/       # Article pages
└── dashboard/      # User dashboard pages

components/
├── admin/          # Admin management components
├── auth/           # Authentication components
├── dashboard/      # Dashboard components
└── ui/             # Base UI components (shadcn/ui)

docs/               # Documentation (API, Notifications, Permissions, Settings)
hooks/              # Custom React hooks
lib/                # Utilities, validation, database
```

## Critical Rules
- ❌ NO email auth (use username)
- ❌ NO `any` types without reason
- ❌ NO Prisma in client components
- ❌ NO skipping auth checks in API routes
- ❌ NO direct database queries (use Prisma)
- ❌ NO hardcoded credentials (use environment variables)
- ❌ NO function exports from API route files (use utility files instead)
- ✅ Always validate input server-side with Zod
- ✅ Handle errors with try/catch
- ✅ Use TypeScript strict mode
- ✅ Implement proper error boundaries
- ✅ Use semantic HTML and ARIA labels
- ✅ Test all API endpoints with proper auth

## 🚨 MANDATORY BUG CHECKING PROCEDURES

### Before Any Major Change:
1. **Create Feature Branch**: `git checkout -b feature/your-feature-name` 
2. **Document Changes**: Update README.md if adding new features
3. **Follow Testing Protocol**: Complete all checks below

### After Any Major Change - MANDATORY CHECKS:

#### 1. **Build Verification** 🔨
```bash
# Navigate to project directory
cd "C:\Users\user\Documents\IT perfect\mmw-hubix"

# Test production build
npx next build

# Expected: ✅ SUCCESS with no errors
# If FAILED: Fix all compilation errors before proceeding
```

#### 2. **Linting Check** 🔍
```bash
# Run ESLint on all modified files
npx next lint

# Check specific files if needed
npx eslint [file-paths]

# Expected: ✅ NO ERRORS
# If ERRORS: Fix all linting issues
```

#### 3. **TypeScript Validation** 📝
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Expected: ✅ NO TYPE ERRORS
# If ERRORS: Fix all type issues
```

#### 4. **Development Server Test** 🖥️
```bash
# Start development server
npm run dev

# Expected: ✅ Server starts without errors
# Test: Navigate to http://localhost:3000
# Verify: All pages load correctly
```

#### 5. **API Endpoint Testing** 🔌
```bash
# Test all new/modified API endpoints
# Use browser dev tools or Postman
# Verify: Proper authentication, validation, error handling
```

#### 6. **Authentication Flow Test** 🔐
```bash
# Test login/logout functionality
# Test password changes (if applicable)
# Test role-based access control
# Verify: All auth flows work correctly
```

#### 7. **Database Schema Check** 🗄️
```bash
# If database changes made:
npm run db:migrate

# Verify: No migration errors
# Test: CRUD operations work correctly
```

#### 8. **Cross-Browser Testing** 🌐
- Test in Chrome, Firefox, Safari, Edge
- Verify responsive design on mobile/tablet
- Check for console errors

#### 9. **Performance Check** ⚡
```bash
# Build and check bundle sizes
npx next build

# Verify: No significant bundle size increases
# Check: Page load times are acceptable
```

#### 10. **Security Validation** 🛡️
- Verify all inputs are validated
- Check authentication on protected routes
- Test for XSS/injection vulnerabilities
- Verify file upload security (if applicable)

### 🚨 CRITICAL FAILURE CONDITIONS

**STOP DEPLOYMENT IF ANY OF THESE OCCUR:**
- ❌ Build fails with compilation errors
- ❌ TypeScript type errors
- ❌ ESLint errors
- ❌ Authentication broken
- ❌ Database migration failures
- ❌ API endpoints returning 500 errors
- ❌ Critical functionality not working

### 📋 Pre-Deployment Checklist

Before merging to main branch:
- [ ] All mandatory checks completed ✅
- [ ] Build passes without errors ✅
- [ ] No linting errors ✅
- [ ] No TypeScript errors ✅
- [ ] All new features tested ✅
- [ ] Documentation updated ✅
- [ ] README.md updated (if new features) ✅
- [ ] Security review completed ✅
- [ ] Performance impact assessed ✅

### 🔧 Common Bug Prevention Rules

1. **API Route Files**: Never export helper functions - use utility files in `/lib/` 
2. **Import Paths**: Always use `@/` prefix for internal imports
3. **Authentication**: Always check user permissions server-side
4. **Error Handling**: Wrap all async operations in try/catch
5. **Type Safety**: Avoid `any` types, use proper TypeScript interfaces
6. **Database**: Use Prisma for all database operations
7. **Validation**: Use Zod schemas for all API inputs
8. **Testing**: Test all user flows after changes

### 📊 Quality Metrics

**Target Metrics:**
- Build time: < 30 seconds
- Bundle size increase: < 10% per feature
- Page load time: < 3 seconds
- Zero critical security vulnerabilities
- Zero TypeScript errors
- Zero ESLint errors

### 🚀 Deployment Protocol

1. **Complete all mandatory checks**
2. **Create pull request with detailed description**
3. **Request code review**
4. **Merge only after approval**
5. **Monitor deployment for errors**
6. **Update documentation if needed**

---

## 📝 Change Log Template

When making major changes, document:

```markdown
## [Feature Name] - [Date]

### Changes Made:
- [List of changes]

### Files Modified:
- [List of files]

### Testing Completed:
- [ ] Build verification
- [ ] Linting check
- [ ] TypeScript validation
- [ ] Development server test
- [ ] API endpoint testing
- [ ] Authentication flow test
- [ ] Database schema check
- [ ] Cross-browser testing
- [ ] Performance check
- [ ] Security validation

### Breaking Changes:
- [List any breaking changes]

### Documentation Updates:
- [List documentation changes]
```

---
**Remember**: Quality over speed. A bug-free deployment is better than a fast deployment with issues.

If there is an important update, update the [README.md](../../README.md) and relevant docs in [/docs](cci:7://file:///c:/Users/user/Documents/IT%20perfect/mmw-hubix/docs:0:0-0:0).
---