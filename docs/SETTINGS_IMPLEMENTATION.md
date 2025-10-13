# Database-Backed Settings System Implementation

## Overview

The admin settings system has been migrated from localStorage to a database-backed solution with full persistence and API integration.

## Features Implemented

### ✅ Database Model
- **SiteSetting Model**: Stores all system settings with key-value pairs
- **SettingType Enum**: STRING, NUMBER, BOOLEAN, JSON types
- **Categories**: general, security, notifications, backup, appearance
- **Public/Private Settings**: Control which settings are publicly accessible

### ✅ API Endpoints

#### Admin Endpoints (Authentication Required)
- `GET /api/admin/settings` - Get all settings (including private)
- `PUT /api/admin/settings` - Update multiple settings

#### Public Endpoints
- `GET /api/settings` - Get public settings only (maintenance mode, site name, etc.)

### ✅ Settings Service Library
Location: `/lib/settings-service.ts`

**Functions:**
- `initializeSettings()` - Auto-initializes default settings on first run
- `getAllSettings(includePrivate)` - Get all settings as object
- `getSetting(key)` - Get single setting by key
- `updateSetting(key, value)` - Update single setting
- `updateSettings(settings)` - Bulk update settings
- `getSettingsByCategory(category)` - Get settings by category
- `deleteSetting(key)` - Delete a setting

### ✅ Updated Hook
Location: `/hooks/use-settings.ts`

**New Features:**
- Database-first approach with localStorage fallback
- Optimistic updates with error handling
- Loading states
- Auto-refresh capability
- Proper error messages with toast notifications

## Default Settings

| Key | Default Value | Category | Type | Public |
|-----|--------------|----------|------|--------|
| siteName | "MMW Hubix" | general | STRING | ✓ |
| siteDescription | "School Information Portal..." | general | STRING | ✓ |
| maxFileSize | "10" | general | NUMBER | ✗ |
| allowedFileTypes | "pdf,doc,docx,jpg,png,mp4" | general | STRING | ✗ |
| maintenanceMode | "false" | general | BOOLEAN | ✓ |
| registrationEnabled | "false" | general | BOOLEAN | ✗ |
| sessionTimeout | "30" | security | NUMBER | ✗ |
| maxLoginAttempts | "5" | security | NUMBER | ✗ |
| emailNotifications | "true" | notifications | BOOLEAN | ✗ |
| autoBackup | "true" | backup | BOOLEAN | ✗ |
| backupFrequency | "weekly" | backup | STRING | ✗ |
| colorTheme | "school-blue-yellow" | appearance | STRING | ✓ |

## Database Migration Steps

### For MySQL Production:

```bash
# 1. Stop development server if running
# Press Ctrl+C in terminal

# 2. Generate Prisma Client with new models
npx prisma generate

# 3. Create and apply migration
npx prisma migrate dev --name add_site_settings

# 4. Seed default settings (optional - auto-initialized on first access)
# Settings will be auto-initialized on first API call

# 5. Restart development server
npm run dev
```

### For SQLite Development:

```bash
# 1. Stop development server if running

# 2. Generate Prisma Client
npm run db:generate:sqlite

# 3. Push schema changes
npm run db:push:sqlite

# 4. Start development server
npm run dev:sqlite
```

## Security Features

✅ **Role-Based Access Control**
- Admin-only API endpoints for managing settings
- Public endpoint for maintenance mode and other public settings

✅ **Input Validation**
- Type checking for setting values
- Schema validation on API endpoints

✅ **Error Handling**
- Graceful fallback to localStorage on database failure
- Automatic initialization of default settings
- Proper error messages and logging

## Usage Examples

### In Server Components (API Routes)
```typescript
import { getAllSettings, getSetting, updateSetting } from "@/lib/settings-service"

// Get all settings
const settings = await getAllSettings(true) // includes private

// Get single setting
const siteName = await getSetting("siteName")

// Update setting
await updateSetting("maintenanceMode", true)
```

### In Client Components
```typescript
import { useSettings } from "@/hooks/use-settings"

function MyComponent() {
  const { settings, updateSettings, isLoading } = useSettings()
  
  const handleSave = () => {
    updateSettings({ maintenanceMode: true })
  }
  
  return (
    <div>
      {isLoading ? "Loading..." : settings.siteName}
    </div>
  )
}
```

### In Admin Settings Page
```typescript
// Already implemented in /components/admin/system-settings.tsx
// Uses the hook automatically with database persistence
```

## Testing Checklist

### Pre-Deployment

- [ ] Stop any running development servers
- [ ] Run `npx prisma generate` successfully
- [ ] Run database migration/push command
- [ ] Verify no TypeScript errors: `npx tsc --noEmit`
- [ ] Run build: `npx next build`
- [ ] Test settings page loads without errors
- [ ] Test saving settings persists to database
- [ ] Test settings load after page refresh
- [ ] Verify public endpoint works without auth
- [ ] Verify admin endpoint requires authentication

### Manual Testing

1. **Load Settings Page**: Navigate to `/admin/settings`
2. **Change Settings**: Modify various settings and save
3. **Refresh Page**: Verify changes persist after refresh
4. **Check Database**: Query `SiteSetting` table to verify data
5. **Test Maintenance Mode**: Enable and verify site behavior
6. **Test Fallback**: Disconnect database and verify localStorage fallback

## Database Schema

```prisma
model SiteSetting {
  id        String      @id @default(cuid())
  key       String      @unique
  value     String      @db.Text
  category  String      @default("general")
  label     String?
  type      SettingType @default(STRING)
  isPublic  Boolean     @default(false)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  @@index([category])
  @@index([key])
}

enum SettingType {
  STRING
  NUMBER
  BOOLEAN
  JSON
}
```

## Files Modified/Created

### Created Files
- ✅ `/lib/settings-service.ts` - Settings service library
- ✅ `/app/api/admin/settings/route.ts` - Admin settings API
- ✅ `/app/api/settings/route.ts` - Public settings API
- ✅ `/docs/SETTINGS_IMPLEMENTATION.md` - This documentation

### Modified Files
- ✅ `/prisma/schema.prisma` - Added SiteSetting model and SettingType enum
- ✅ `/prisma/schema.sqlite.prisma` - Added SiteSetting model for SQLite
- ✅ `/hooks/use-settings.ts` - Updated to use database API

### Existing Files (No Changes Required)
- `/components/admin/system-settings.tsx` - Works with updated hook
- `/app/admin/settings/page.tsx` - No changes needed

## Troubleshooting

### Issue: Prisma Client not updated
**Solution**: Run `npx prisma generate` after schema changes

### Issue: Settings not persisting
**Solution**: Check database connection, verify migration ran successfully

### Issue: Permission errors during migration
**Solution**: Stop dev server, close all terminals, run migration again

### Issue: API returns 401/403
**Solution**: Ensure user is logged in with ADMIN role

### Issue: Settings showing default values
**Solution**: Clear localStorage, refresh page to fetch from database

## Next Steps & Future Enhancements

- [ ] Add setting validation schemas with Zod
- [ ] Implement settings history/audit log
- [ ] Add settings import/export with database backup
- [ ] Create settings cache for performance
- [ ] Add real-time settings sync across sessions
- [ ] Implement setting groups and tabs management
- [ ] Add setting search functionality

## Performance Considerations

- Settings are auto-initialized on first access
- Database queries are optimized with indexes on key and category
- Client-side caching with optimistic updates
- localStorage fallback for offline/error scenarios

## Security Notes

⚠️ **Important**: 
- Never expose sensitive settings in public API
- Always validate input on server-side
- Use proper authentication for admin endpoints
- Sanitize setting values before display
- Implement rate limiting on settings API
