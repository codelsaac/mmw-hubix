## Scope
- Use Testsprite to generate and run frontend UI tests against the Next.js app.
- Cover home load, login dialog, role-based access, and key dashboard/admin pages.

## Preconditions (Windows/PowerShell)
- Install deps: `npm install`
- Start dev server: `npm run dev` (listens on `http://localhost:3000`)
- Database optional: If MySQL isn’t running, demo accounts still work (code falls back to demo credentials).

## Test Accounts
- Admin: `admin` / `admin123` (env-overridable via `DEMO_ADMIN_*`)
- Helper: `helper` / `helper123`
- Guest: `guest` / `guest123`

## Execution Steps
1. Bootstrap Testsprite to the running site
   - localPort: `3000`
   - pathname: `/`
   - type: `frontend`
   - projectPath: `c:\Users\user\Documents\IT perfect\mmw-hubix`
   - testScope: `codebase`
2. Generate frontend test plan (needLogin: `true`)
   - Flows: home page render, open login dialog, credential sign-in, session indicator, guarded redirects.
3. Generate tests and execute
   - Use Admin, Helper, and Guest to validate access:
     - Admin can open `/admin/*` pages.
     - Helper blocked from `/admin/*`, allowed `/dashboard/profile`.
     - Guest blocked from `/dashboard/*` and `/admin/*` → `/unauthorized` or guarded view.
   - Validate API-protected pages load UI without console errors.
4. Produce report
   - Save a markdown summary of results, pass/fail per scenario, and screenshots.
5. Optional re-run
   - Re-run the generated tests to confirm fixes.

## Coverage Details
- Home (`/`): renders header/footer, opens `SimpleLoginDialog`.
- Auth: `signIn('credentials')` succeeds; session visible in UI; no console errors.
- Dashboard: `/dashboard`, `/dashboard/training`, `/dashboard/calendar`, `/dashboard/profile`.
- Admin: `/admin`, `/admin/resources`, `/admin/announcements`, `/admin/articles`, `/admin/users`, `/admin/settings`, `/admin/categories`.
- Unauthorized: `/unauthorized` is shown appropriately when access denied.

## Deliverables
- Testsprite test plan
- Executed test results with pass/fail summary and screenshots
- Short findings list for any broken flows or errors

## Acceptance Criteria
- Dev server reachable at `http://localhost:3000`.
- All scripted UI flows execute without runtime or console errors.
- Role-based guards work exactly as described above.
- Test report generated and shared back to you.