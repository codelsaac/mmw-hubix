# Quick Start: Username Login

## Apply Changes

Run these commands in order:

```bash
# 1. Apply database migration
npx prisma migrate dev --name add_username_field

# 2. Generate Prisma Client
npx prisma generate

# 3. Start development server
npm run dev
```

## Test Login

Visit: http://localhost:3000

Click the "Login" button and use:
- **Username:** `admin`
- **Password:** `mmw2025`

## All Demo Accounts

| Username | Password | Role |
|----------|----------|------|
| admin | mmw2025 | Admin |
| helper | helper123 | Helper |
| ithelper | ithelper2025 | Helper |
| guest | guest123 | Guest |
| itprefect | prefect123 | Guest |
| student1 | student123 | Guest |
| student2 | student456 | Guest |

## What Changed?

✅ Login now uses **username** instead of email
✅ All demo accounts updated
✅ Database schema includes username field
✅ UI updated to show "Username" input

That's it! Your authentication is now username-based.
