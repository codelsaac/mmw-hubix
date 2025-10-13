# 🔔 Notification System Documentation

A comprehensive notification system for MMW Hubix with real-time updates, priority levels, and role-based targeting.

## Features

✅ **Real-time Notifications** - Auto-refreshes every 30 seconds  
✅ **Priority Levels** - LOW, NORMAL, HIGH, URGENT with visual indicators  
✅ **Notification Types** - INFO, SUCCESS, WARNING, ERROR, ANNOUNCEMENT, SYSTEM  
✅ **User & System-Wide** - Send to specific users or broadcast to all  
✅ **Mark as Read** - Individual or bulk mark as read  
✅ **Delete Notifications** - Clean up read notifications  
✅ **Action Links** - Direct users to relevant pages  
✅ **Role-Based Targeting** - Send to ADMIN, HELPER, or GUEST users  

---

## Database Schema

The `Notification` model stores all notifications:

```prisma
model Notification {
  id          String           @id @default(cuid())
  title       String
  message     String           @db.Text
  type        NotificationType @default(INFO)
  priority    NotificationPriority @default(NORMAL)
  isRead      Boolean          @default(false)
  userId      String?          // null = system-wide notification
  link        String?          @db.VarChar(2048)
  metadata    String?          @db.Text
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}
```

### Enums

**NotificationType**: `INFO` | `SUCCESS` | `WARNING` | `ERROR` | `ANNOUNCEMENT` | `SYSTEM`

**NotificationPriority**: `LOW` | `NORMAL` | `HIGH` | `URGENT`

---

## Setup Instructions

### 1. Update Database Schema

```bash
# Push schema changes to database
npx prisma db push

# For SQLite development
npm run db:push:sqlite

# Generate Prisma client
npx prisma generate
```

### 2. Notification Bar is Already Integrated

The notification bell icon appears in the header next to the user menu. No additional setup needed!

---

## Usage Guide

### For Admins - Creating Notifications

#### Via API (Programmatic)

```typescript
import { NotificationService } from '@/lib/notification-service'

// Send to specific user
await NotificationService.createForUser('user-id', {
  title: 'Welcome!',
  message: 'Thanks for joining our system',
  type: 'INFO',
  priority: 'NORMAL',
  link: '/dashboard'
})

// System-wide announcement
await NotificationService.createSystemNotification({
  title: 'System Maintenance',
  message: 'Scheduled maintenance on Sunday 2AM-4AM',
  type: 'ANNOUNCEMENT',
  priority: 'HIGH'
})

// Send to all users
await NotificationService.createForAllUsers({
  title: 'New Feature Available',
  message: 'Check out our new training resources!',
  type: 'SUCCESS',
  link: '/dashboard/training'
})

// Send to specific role
await NotificationService.createForRole('ADMIN', {
  title: 'Admin Alert',
  message: 'New user registration requires approval',
  type: 'WARNING',
  priority: 'HIGH',
  link: '/admin/users'
})
```

#### Via Admin API Endpoint

**POST** `/api/admin/notifications`

```json
{
  "title": "Important Update",
  "message": "Please review the new policies",
  "type": "ANNOUNCEMENT",
  "priority": "HIGH",
  "link": "/articles/new-policies",
  "sendToAll": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent to 25 users",
  "count": 25
}
```

---

## API Endpoints

### User Endpoints

#### GET `/api/notifications`
Get user's notifications

**Query Parameters:**
- `unreadOnly` - boolean (optional)
- `limit` - number (default: 20)

**Response:**
```json
[
  {
    "id": "clxxx",
    "title": "Welcome!",
    "message": "Thanks for joining",
    "type": "INFO",
    "priority": "NORMAL",
    "isRead": false,
    "link": "/dashboard",
    "createdAt": "2025-01-15T10:30:00Z"
  }
]
```

#### PATCH `/api/notifications`
Mark notifications as read

**Body:**
```json
{
  "notificationIds": ["id1", "id2"],
  // OR
  "markAll": true
}
```

#### DELETE `/api/notifications`
Delete notifications

**Body:**
```json
{
  "notificationIds": ["id1", "id2"],
  // OR
  "deleteAll": true  // Deletes all read notifications
}
```

### Admin Endpoints

#### POST `/api/admin/notifications`
Create notification (Admin only)

**Body:**
```json
{
  "title": "string",
  "message": "string",
  "type": "INFO|SUCCESS|WARNING|ERROR|ANNOUNCEMENT|SYSTEM",
  "priority": "LOW|NORMAL|HIGH|URGENT",
  "link": "optional-url",
  "userId": "optional-user-id",
  "sendToAll": false
}
```

#### GET `/api/admin/notifications`
Get all notifications (Admin only)

#### DELETE `/api/admin/notifications`
Delete notifications (Admin only)

---

## React Hook Usage

```typescript
import { useNotifications } from '@/hooks/use-notifications'

function MyComponent() {
  const {
    notifications,      // Array of notifications
    unreadCount,        // Number of unread notifications
    isLoading,          // Loading state
    error,              // Error state
    fetchNotifications, // Refresh notifications
    markAsRead,         // Mark specific notifications as read
    markAllAsRead,      // Mark all as read
    deleteNotifications,// Delete specific notifications
    deleteAllRead,      // Delete all read notifications
  } = useNotifications()

  return (
    <div>
      <p>You have {unreadCount} unread notifications</p>
      {notifications.map(notification => (
        <div key={notification.id}>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
          <button onClick={() => markAsRead([notification.id])}>
            Mark as Read
          </button>
        </div>
      ))}
    </div>
  )
}
```

---

## Notification Types & Colors

| Type | Icon | Color | Usage |
|------|------|-------|-------|
| **INFO** | ℹ️ | Blue | General information |
| **SUCCESS** | ✅ | Green | Successful actions |
| **WARNING** | ⚠️ | Yellow | Important notices |
| **ERROR** | ❌ | Red | Errors or issues |
| **ANNOUNCEMENT** | 📢 | Purple | Official announcements |
| **SYSTEM** | ⚙️ | Gray | System messages |

## Priority Levels

| Priority | Border Color | Usage |
|----------|-------------|-------|
| **LOW** | Gray | Minor updates |
| **NORMAL** | Blue | Regular notifications |
| **HIGH** | Orange | Important updates |
| **URGENT** | Red | Critical actions required |

---

## Best Practices

### ✅ Do's

1. **Use appropriate types** - Match notification type to content
2. **Set correct priority** - URGENT for critical actions only
3. **Include action links** - Direct users to relevant pages
4. **Keep messages concise** - 1-2 sentences maximum
5. **Use system-wide sparingly** - Only for important announcements

### ❌ Don'ts

1. **Don't spam users** - Limit frequency of notifications
2. **Don't use URGENT for everything** - Reserve for critical items
3. **Don't include sensitive data** - Keep messages general
4. **Don't create duplicates** - Check existing notifications first

---

## Examples

### Welcome New User
```typescript
await NotificationService.createForUser(newUserId, {
  title: 'Welcome to MMW Hubix!',
  message: 'Complete your profile to get started',
  type: 'INFO',
  priority: 'NORMAL',
  link: '/dashboard/profile'
})
```

### System Maintenance Alert
```typescript
await NotificationService.createSystemNotification({
  title: 'Scheduled Maintenance',
  message: 'System will be down for maintenance on Sunday 2AM-4AM',
  type: 'ANNOUNCEMENT',
  priority: 'HIGH'
})
```

### Task Assignment
```typescript
await NotificationService.createForUser(assigneeId, {
  title: 'New Task Assigned',
  message: `You've been assigned: ${taskTitle}`,
  type: 'INFO',
  priority: 'NORMAL',
  link: `/dashboard/tasks/${taskId}`
})
```

### Article Published
```typescript
await NotificationService.createForRole('ADMIN', {
  title: 'New Article Published',
  message: `${articleTitle} is now live`,
  type: 'SUCCESS',
  priority: 'LOW',
  link: `/articles/${articleSlug}`
})
```

### Error Alert
```typescript
await NotificationService.createForRole('ADMIN', {
  title: 'System Error Detected',
  message: 'Database backup failed. Immediate action required.',
  type: 'ERROR',
  priority: 'URGENT',
  link: '/admin/settings'
})
```

---

## Maintenance

### Cleanup Old Notifications

```typescript
import { NotificationService } from '@/lib/notification-service'

// Clean up notifications older than 30 days
const deletedCount = await NotificationService.cleanupOldNotifications(30)
console.log(`Deleted ${deletedCount} old notifications`)
```

### Recommended Cleanup Schedule

- **Read notifications**: Delete after 30 days
- **Unread notifications**: Keep indefinitely (user action required)
- **System announcements**: Archive after 90 days

---

## Troubleshooting

### Notifications not showing?

1. Check user is logged in
2. Verify Prisma client is generated: `npx prisma generate`
3. Check database connection
4. Verify API endpoint returns data: `/api/notifications`

### Hook not updating?

The hook auto-refreshes every 30 seconds. To force refresh:
```typescript
const { fetchNotifications } = useNotifications()
await fetchNotifications()
```

### TypeScript errors?

Regenerate Prisma types:
```bash
npx prisma generate
```

---

## Future Enhancements

🔮 **Planned Features:**
- Push notifications (browser)
- Email notifications
- Notification preferences
- Notification grouping
- Read receipts
- Scheduled notifications

---

## Support

For issues or questions:
1. Check this documentation
2. Review API endpoint logs
3. Check Prisma schema is up to date
4. Contact system administrator

**Version:** 1.0.0  
**Last Updated:** October 12, 2025
