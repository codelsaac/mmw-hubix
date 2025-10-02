# Migration Guide: Email to Username Authentication

This document outlines the changes made to switch from email-based to username-based authentication.

## Changes Made

### 1. Database Schema (prisma/schema.prisma)
- Added `username` field to User model as a unique required field
- Email field remains but is now optional (for future use)

### 2. Authentication Configuration (auth.ts)
- Updated `DEMO_ACCOUNTS` to use `username` instead of `email`
- Modified `CredentialsProvider` to accept `username` instead of `email`
- Updated the authorize function to check username instead of email

### 3. Auth Service (lib/auth.ts)
- Renamed `signInWithEmail()` to `signInWithUsername()`
- Updated all demo accounts to use username
- Modified helper methods to work with username instead of email

### 4. Login Dialog (components/auth/login-dialog.tsx)
- Changed input field from "Email" to "Username"
- Updated input type from `email` to `text`
- Changed placeholder text
- Updated demo account display

## New Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `mmw2025` (or `admin123`, `mmw-admin-2025`) |
| Helper | `helper` | `helper123` |
| Helper | `ithelper` | `ithelper2025` |
| Guest | `guest` | `guest123` |
| Guest | `itprefect` | `prefect123` |
| Guest | `student1` | `student123` |
| Guest | `student2` | `student456` |

## Migration Steps

### Step 1: Update Database Schema
Run the following command to create a migration:

```bash
npx prisma migrate dev --name add_username_field
```

This will:
- Add the `username` field to the User table
- Create a unique index on username

### Step 2: Update Existing Users (if any)
If you have existing users in your database, you'll need to add usernames to them. You can do this via Prisma Studio or a migration script:

```bash
npx prisma studio
```

Or create a seed script to populate usernames.

### Step 3: Restart Development Server
```bash
npm run dev
```

### Step 4: Test Login
Try logging in with the new username-based credentials:
- Username: `admin`
- Password: `mmw2025`

## Files Modified

1. `prisma/schema.prisma` - Added username field
2. `auth.ts` - Updated authentication logic
3. `lib/auth.ts` - Updated AuthService methods
4. `components/auth/login-dialog.tsx` - Updated UI

## Rollback Instructions

If you need to rollback these changes:

1. Revert the files to their previous state
2. Run: `npx prisma migrate dev` to sync the schema
3. Restart the development server

## Notes

- The email field is still present in the database for future use (e.g., password reset, notifications)
- All existing authentication flows now use username instead of email
- The discrete admin login component still works with password-only authentication
