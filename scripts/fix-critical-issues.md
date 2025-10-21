# Critical Issues Fix Checklist

## 🔴 Priority 1: Fix 401 Errors on /api/admin/settings

### Issue
All pages are trying to fetch `/api/admin/settings` and getting 401 Unauthorized errors.

### Root Cause
Likely the component is making this API call before authentication is verified.

### Fix Steps
1. Check if `app/api/admin/settings/route.ts` exists
2. If it doesn't exist, create it OR remove the API call from components
3. If it exists, verify the auth middleware is correctly checking sessions

```bash
# Check if the route exists
ls app/api/admin/settings/route.ts
```

### Action Items
- [ ] Locate where this API call is being made (likely in layout or header)
- [ ] Either implement the endpoint OR remove the call for non-admin users
- [ ] Add proper error handling for failed settings fetches

---

## 🔴 Priority 2: Fix Announcements 404 Errors

### Issue
`/announcements` route returns 404 errors

### Fix Steps
```bash
# Check if announcements page exists
ls app/announcements/page.tsx
```

### If Missing, Create It
```bash
# Create the public announcements page
mkdir -p app/announcements
```

Then create a basic announcements page or update navigation to point to correct route.

### Action Items
- [ ] Verify announcements route exists
- [ ] If using different route, update all navigation links
- [ ] Check if it should be `/dashboard/announcements` or `/announcements`

---

## 🔴 Priority 3: Environment Variables

### Check Your .env.local
```bash
# Required variables
NEXTAUTH_SECRET="minimum-32-characters-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"
DATABASE_URL="mysql://user:password@localhost:3306/mmw_hubix"

# Demo credentials (from auth.ts)
DEMO_ADMIN_USERNAME="admin"
DEMO_ADMIN_PASSWORD="admin123"
DEMO_GUEST_USERNAME="guest"
DEMO_GUEST_PASSWORD="guest123"
DEMO_HELPER_PASSWORD="helper123"
```

### Generate NEXTAUTH_SECRET
```bash
# Run this to generate a secure secret
openssl rand -base64 32
```

### Action Items
- [ ] Verify all env variables are set
- [ ] Generate new NEXTAUTH_SECRET if using default
- [ ] Restart dev server after changes

---

## 🟡 Priority 4: Resource Hub API Errors

### Issue
`Error fetching data: TypeError: Failed to fetch` in Resource Hub component

### Check
```bash
# Verify the resource API endpoint exists
ls app/api/resources/route.ts
```

### Fix in components/resource-hub.tsx
Line 107 - Add better error handling and verify the API endpoint is correct.

### Action Items
- [ ] Check if `/api/resources` endpoint exists and works
- [ ] Add try-catch with fallback data in Resource Hub
- [ ] Consider adding loading states

---

## 🟢 Quick Wins

### 1. Fix Navigation Links
Check all navigation files for broken links:
- `components/header.tsx`
- `components/main-nav.tsx`
- `components/mobile-nav.tsx`
- `components/sidebar.tsx`

### 2. Database Connection
```bash
# Test database connectivity
npm run db:migrate
```

### 3. Clear Next.js Cache
```bash
# Sometimes fixes routing issues
rm -rf .next
npm run build
npm run start
```

---

## 📋 Testing After Fixes

1. **Start fresh:**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
npm run start
```

2. **Test these flows:**
- [ ] Login as admin (admin/admin123)
- [ ] Navigate to admin panel
- [ ] Check Resource Hub loads without errors
- [ ] Verify no 401 errors in browser console
- [ ] Test announcements page loads

3. **Re-run Testsprite:**
```bash
# After fixes, run tests again to verify improvements
```

---

## 🎯 Expected Outcome

After these fixes:
- ✅ No more 401 errors on settings endpoint
- ✅ Announcements page accessible
- ✅ Resource Hub loads properly
- ✅ Test pass rate should jump to 70%+ 

**Estimated Time:** 2-3 hours of focused debugging

---

## ⚠️ DON'T DO THIS

- ❌ Don't migrate to Supabase/PocketBase now
- ❌ Don't rewrite working code
- ❌ Don't add new features before fixing bugs
- ❌ Don't ignore the test results

## ✅ DO THIS

- ✅ Fix one critical issue at a time
- ✅ Test after each fix
- ✅ Keep your current architecture
- ✅ Run Testsprite again after fixes

