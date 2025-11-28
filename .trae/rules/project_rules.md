## AI Assistant Mandate
- Act as the MMW Hubix pair programmer and obey this ruleset.
- Keep responses concise and token-efficient.
- Avoid unsolicited refactors, file churn, or structural rewrites.
- Enforce username-only authentication and server-side permission checks; never expose Prisma to client code.
- Always validate with Zod, run tests/quality checks, and update docs before calling work complete.
- Read the entire target file before editing and search for dependencies.
- Use project import aliases, Tailwind with `cn()`, and default to server components.
- Never commit secrets; rely on environment variables.
- Do not run destructive commands without explicit user approval.
- Use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.

# MMW Hubix – Project Rules

## Tech Stack Facts
- Next.js 15 App Router with TypeScript, Tailwind CSS, shadcn/ui.
- Prisma ORM (MySQL backend).
- NextAuth.js with username-based login only.
- Validation via Zod; forms use React Hook Form; charts via Recharts; tabular data via React Data Grid.

## File, Component & Import Conventions
- **Naming**: Components `kebab-case.tsx`, pages `page.tsx`, APIs `route.ts`, hooks `use-*.ts`.
- **Component Type**: Server Component by default; add `"use client"` only when state/effects are required.
- **Imports**: Use path aliases (`@/components/*`, `@/lib/*`, `@/hooks/*`, `@/app/*`).
- **Styling**: Tailwind only; compose classes with `cn()` from `@/lib/utils`.

## Auth & Roles
- Roles: `ADMIN` (full access), `HELPER` (IT Perfect management), `IT_PREFECT` (view-only resources).
- Server pages call `auth()`; API routes guard with `requireAuth([...roles])`.
- Always enforce permissions server-side; never rely on client checks alone.

## Core Database Models
- **User**: Username auth, role/permission metadata, activity tracking.
- **Article**: CMS entries with slug, content, status, featured media.
- **Announcement**: Club events covering schedule, attendees, and venue.
- **TrainingResource**: Video, text, and file content with categories/difficulty.
- **PublicEvent/InternalEvent**: Calendar entities with attendee lists.
- **Activity/Task**: Team assignments with priority management.
- **Resource**: Curated external links grouped by category.
- **Category**: Defines resource taxonomy with icons, colors, and ordering.
- **SiteSetting**: Central configuration store pulled from the database.

## Database Usage
- Use a Prisma singleton, prefer `cuid()` primary keys, size MySQL fields appropriately, and add required indexes.

## API Structure Expectations
- Wrap handlers in `requireAuth`, validate inputs with Zod, use `NextResponse.json`, and wrap logic in `try/catch` following existing patterns.

## Security & Validation Guarantees
- Validate all inbound data with Zod schemas.
- For uploads, enforce file type, size, and signature checks.
- Apply CSRF protection for any state-changing request.
- Rate-limit abusive endpoints.
- Rely on Prisma’s parameterised queries to prevent SQL injection.
- Sanitize user-generated output to block XSS.

## Pre-Work Checklist (run **before** coding)
1. **Read the code**: Load the entire target file with `read_file`, understand patterns, and note related modules.
2. **Search dependencies**: Use `grep_search` to locate every reference and confirm type signatures.
3. **Validate imports**: Confirm alias paths, existence of targets, and avoid circular dependencies.
4. **Check types**: Ensure TypeScript/Prisma types align; never introduce `any` as a shortcut.
5. **Respect conventions**: Follow naming, component, and API patterns exactly.

## Post-Work Checklist (run **after** coding)
1. **Test**: Use Playwright MCP for UI, authenticated calls for APIs, and inspect browser/terminal logs.
2. **Quality checks**: Run `npm run quality-check`; fix all TypeScript/ESLint/build issues.
3. **Docs**: Update README/docs if the change touches API, DB, Auth, UI, Config, or Env vars.
4. **Verify diffs**: Review every modified file and confirm import sanity.
5. **Commit standards**: Stage intentionally and commit with descriptive messages (e.g., `feat: add category management system with CRUD operations`).

## README Update Gate
- When API, DB, Auth, UI, Config, or Env changes occur, update Recent Updates and the affected sections (API, Database Models, Auth & Roles, Tech Stack, Env Vars) before finishing the task.

## Critical Do / Do-Not Rules
- ❌ Never implement email auth, bypass auth checks, run Prisma in client components, hardcode credentials, skip README updates, skip quality checks, or edit files you did not review.
- ✅ Always validate server-side inputs with Zod, wrap logic in `try/catch`, keep TypeScript strict, preserve accessibility (semantic HTML + ARIA), test APIs with auth, follow conventions, and run `npm run quality-check` before completion.

## Acceptance Criteria For Any Change
- TypeScript compiles with zero errors.
- ESLint reports no new warnings.
- Affected routes/pages run without server or browser console errors.
- API updates are authenticated, validated, and error-handled.
- Schema changes include migrations and Prisma client regeneration.
- UI changes remain responsive and accessible.
- README/docs updates reflect the impact.
- `npm run quality-check` passes; smoke tests complete successfully.

## Pre-Deployment Checklist
- All automated tests pass.
- `npm run quality-check` succeeds.
- No console warnings/errors remain.
- README.md reflects the current state.
- Database migrations are prepared/applied if schema changed.
- Environment variable requirements are documented.
- Any breaking changes are clearly called out.