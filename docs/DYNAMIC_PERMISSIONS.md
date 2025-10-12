# Dynamic Permission Loading System

## Overview

The MMW Hubix application now supports **dynamic permission loading** that combines role-based permissions with user-specific custom permissions. When a user logs in, their custom permissions are loaded from the database and merged with their role's default permissions.

## How It Works

### 1. **Login Process**
When a user logs in:
- System checks credentials against demo accounts or database users
- If valid, loads user's custom permissions from the database
- Updates `lastLoginAt` timestamp
- Stores permissions in the session

### 2. **Session Management**
On each session check:
- Fresh permissions are loaded from the database
- Permissions are cached in the JWT token
- Session user object includes the `permissions` field

### 3. **Permission Checking**
Permissions are checked by:
- **Role-based**: Default permissions from `ROLE_PERMISSIONS` mapping
- **Custom permissions**: Additional permissions stored in database
- **Merged**: Both sets combined and deduplicated

## Usage

### Client-Side (React Components)

```tsx
import { useAuth } from "@/hooks/use-auth"
import { Permission } from "@/lib/permissions"

function MyComponent() {
  const { hasPermission, hasAnyPermission } = useAuth()

  // Check single permission
  if (hasPermission(Permission.MANAGE_ANNOUNCEMENTS)) {
    // User has permission to manage announcements
  }

  // Check multiple permissions (OR logic)
  if (hasAnyPermission([Permission.MANAGE_RESOURCES, Permission.MANAGE_TRAINING_VIDEOS])) {
    // User has at least one of these permissions
  }

  return <div>Content</div>
}
```

### Server-Side (API Routes)

```typescript
import { requireAuthAPI } from "@/lib/auth-server"
import { requirePermission } from "@/lib/auth-server"
import { Permission } from "@/lib/permissions"

export async function GET(req: Request) {
  // Require specific permission (checks role + custom permissions)
  const user = await requirePermission(Permission.MANAGE_ANNOUNCEMENTS)
  
  // User has the permission, proceed with logic
  return NextResponse.json({ data: "protected" })
}
```

## API Endpoints

### Get User Permissions
```http
GET /api/admin/users/[id]/permissions
```
Returns user's role and custom permissions.

**Response:**
```json
{
  "userId": "1",
  "username": "admin",
  "name": "System Administrator",
  "role": "ADMIN",
  "customPermissions": ["VIEW_ANALYTICS", "MANAGE_CALENDAR"]
}
```

### Update User Permissions
```http
PUT /api/admin/users/[id]/permissions
Content-Type: application/json

{
  "permissions": ["VIEW_ANALYTICS", "MANAGE_CALENDAR"]
}
```

Adds custom permissions to a user (merged with role permissions).

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "username": "admin",
    "name": "System Administrator",
    "role": "ADMIN",
    "permissions": "[\"VIEW_ANALYTICS\",\"MANAGE_CALENDAR\"]"
  }
}
```

### Clear Custom Permissions
```http
DELETE /api/admin/users/[id]/permissions
```

Removes all custom permissions, reverting user to role defaults.

## Database Schema

The `User` model includes a `permissions` field:

```prisma
model User {
  id          String    @id @default(cuid())
  username    String    @unique
  role        UserRole  @default(GUEST)
  permissions String?   @db.Text  // JSON array of Permission enum values
  // ... other fields
}
```

## Available Permissions

```typescript
enum Permission {
  // Website Administration
  MANAGE_WEBSITE
  MANAGE_USERS
  MANAGE_SYSTEM_SETTINGS
  VIEW_ANALYTICS
  MANAGE_ANNOUNCEMENTS
  
  // IT Perfect System Management
  MANAGE_IT_SYSTEM
  MANAGE_RESOURCES
  MANAGE_TRAINING_VIDEOS
  MANAGE_TASKS
  MANAGE_ACTIVITIES
  MANAGE_CALENDAR
  
  // View Permissions
  VIEW_TRAINING_VIDEOS
  VIEW_RESOURCES
  VIEW_DASHBOARD
  VIEW_CALENDAR
  VIEW_TEAM_INFO
}
```

## Role Defaults

- **ADMIN**: All permissions
- **HELPER**: IT system management + view permissions
- **GUEST**: View-only permissions

## Testing with Prisma Studio

1. Start Prisma Studio:
```bash
npx prisma studio
```

2. Navigate to the `User` model
3. Find a user and edit the `permissions` field
4. Add JSON array of permissions:
```json
["VIEW_ANALYTICS", "MANAGE_CALENDAR"]
```

5. Save and the user will have these additional permissions on next login

## Example: Granting Guest User Admin Panel Access

By default, GUEST users cannot access the admin panel. To grant temporary access:

```typescript
// Using the API
await fetch('/api/admin/users/guest-id/permissions', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    permissions: ['MANAGE_WEBSITE']
  })
})
```

Now the guest user will have admin panel access while retaining their GUEST role!

## Security Considerations

1. **Admin-only**: Only ADMIN role users can modify permissions via API
2. **Server-side validation**: All permission checks happen server-side
3. **Type-safe**: Permissions are validated against the Permission enum
4. **Audit trail**: Consider logging permission changes for compliance
5. **Session refresh**: Users must re-login or refresh session to see new permissions

## Troubleshooting

### Permissions not updating after database change
- User needs to log out and log back in
- Or call `refreshUser()` from `useAuth()` hook

### Custom permissions not working
- Check database field format is valid JSON array
- Verify permission names match Permission enum exactly
- Check browser console for parsing errors

### API returns 403 Forbidden
- User doesn't have required permission
- Check both role permissions and custom permissions
- Verify user is logged in with correct session
