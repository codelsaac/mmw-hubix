# MMW Hubix - Project Rules

## Tech Stack
- Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Prisma ORM: MySQL
- NextAuth.js: **USERNAME-based auth** (NOT email)
- Zod validation, React Hook Form, Recharts, React Data Grid

## Key Conventions
- **Files**: Components `kebab-case.tsx`, Pages `page.tsx`, API `route.ts`, Hooks `use-*.ts`
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

## Core Features
- **Articles CMS**: Full content management with drafts, publishing, SEO
- **Announcements**: Club event management with RSVP system
- **Training Library**: Multi-format resources (video/text/file) with search
- **Calendar System**: Public and internal events with attendee management
- **AI Chat Assistant**: Conversational support for campus navigation
- **File Uploads**: Secure document/image/video handling with validation
- **Activity Management**: Task assignment and team coordination
- **Resource Hub**: Curated external links with click tracking

## Database
- Use singleton: `import { prisma } from "@/lib/prisma"`
- Primary keys: `cuid()` for cross-DB compatibility
- MySQL types: `@db.Text`, `@db.VarChar(2048)`, `@db.VarChar(255)`, `@db.LongText`
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
- ✅ Always validate input server-side with Zod
- ✅ Handle errors with try/catch
- ✅ Use TypeScript strict mode
- ✅ Implement proper error boundaries
- ✅ Use semantic HTML and ARIA labels
- ✅ Test all API endpoints with proper auth
- If there is an important update, update the [text](../../README.md).