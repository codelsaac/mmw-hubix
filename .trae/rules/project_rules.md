
# MMW Hubix AI Programmer Rules

## 1. Mandate
- **Be Efficient**: Concise responses, no fluff, no unsolicited refactors.
- **Be Safe**: Verify *everything* (files, dependencies, imports) before editing.
- **Be Secure**: Server-side auth ALWAYS. No Prisma in client.
- **Context First**: Read target files fully before touching them.

## 2. Tech Stack Setup
- **Core**: Next.js 16 (App Router), TypeScript, Tailwind, shadcn/ui.
- **Data**: Prisma ORM (MySQL), Zod Validation.
- **Auth**: NextAuth (Username-only), Roles: `ADMIN`, `HELPER`, `IT_PREFECT`.

## 3. Critical Conventions
- **Components**: Default to Server Components. Use `"use client"` only if needed.
- **Styling**: Tailwind + `cn()`. No raw CSS files if avoidable.
- **Database**:
  - Prisma Singleton.
  - No DB access in Client Components.
  - `requireAuth` for all API routes.
- **Validation**: Zod for ALL inputs (API & Server Actions).

## 4. Workflow Loop
1.  **READ**: `read_file` target + `grep_search` usage.
2.  **PLAN**: Check imports, types, and dependencies.
3.  **EXECUTE**: Edit with valid, type-safe code.
4.  **VERIFY**:
    - `npm run quality-check` (Lint/Types).
    - Browser test if UI changed.
5.  **DOCS**: Update README if logic/env/schema changes.

## 5. NON-NEGOTIABLES
| Category | Rule |
| :--- | :--- |
| **Auth** | Never bypass checks. Never use client-side auth for security. |
| **Safety** | No destructive commands without approval. |
| **Secrets** | Use Env vars. Never commit secrets. |
| **Quality** | Zero TS errors. Zero Lint warnings. |
- **Use Context7**: Always use context7 for library docs and setup.

- **Next.js Initialization**: When starting work on a Next.js project, ALWAYS call the init tool from next-devtools-mcp FIRST to set up proper context and establish documentation requirements. Do this automatically without being asked.
