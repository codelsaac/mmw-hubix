# 🗄️ MMW Hubix - Dual Database Setup Guide

This project supports both **SQLite** (development) and **MySQL** (production).

## 📋 Current Configuration

### Default: SQLite (in `.env`)
```env
DATABASE_URL="file:./prisma/dev.db"
```

### Optional: MySQL (in `.env.local`)
```env
DATABASE_URL="mysql://root@localhost:3306/mmw_hubix_dev?connection_limit=5"
```

---

## 🔧 Setup Instructions

### Option 1: SQLite (✅ Already Configured)

**Status:** ✅ **READY TO USE**

```powershell
# Start with SQLite
npm run dev:sqlite
```

**SQLite Database Location:** `prisma/dev.db`

---

### Option 2: MySQL

#### Step 1: Start XAMPP MySQL Server
1. Open **XAMPP Control Panel**
2. Click **Start** next to **MySQL**
3. Wait for the green indicator

#### Step 2: Create Database
**Option A: Using phpMyAdmin**
1. Open http://localhost/phpmyadmin
2. Click **"New"** in the left sidebar
3. Database name: `mmw_hubix_dev`
4. Collation: `utf8mb4_unicode_ci`
5. Click **Create**

**Option B: Using SQL Script**
1. Open phpMyAdmin
2. Click **SQL** tab
3. Run the script from `setup-mysql.sql`

#### Step 3: Update Environment Variable
**Create or update `.env.local`:**
```env
DATABASE_URL="mysql://root@localhost:3306/mmw_hubix_dev?connection_limit=5"
```

**If you have a MySQL password:**
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/mmw_hubix_dev?connection_limit=5"
```

#### Step 4: Push Schema and Generate Client
```powershell
# Generate Prisma Client for MySQL
npx prisma generate

# Push schema to MySQL database
npx prisma db push

# Seed the database with demo data
npm run db:seed

# Start development server
npm run dev
```

---

## 🔄 Switching Between Databases

### Switch to SQLite:
```powershell
# Update .env to use SQLite
DATABASE_URL="file:./prisma/dev.db"

# Start with SQLite
npm run dev:sqlite
```

### Switch to MySQL:
```powershell
# Update .env.local to use MySQL
DATABASE_URL="mysql://root@localhost:3306/mmw_hubix_dev"

# Generate and push
npx prisma generate
npx prisma db push
npm run db:seed

# Start normally
npm run dev
```

---

## ✅ Database Verification

### Check SQLite Database:
```powershell
npx prisma studio --schema prisma/schema.sqlite.prisma
```

### Check MySQL Database:
```powershell
npx prisma studio
```

---

## 🚨 Troubleshooting

### Issue: "EPERM: operation not permitted"
**Solution:** Stop all Node processes first:
```powershell
taskkill /F /IM node.exe
```

### Issue: "Error validating datasource: the URL must start with mysql://"
**Solution:** Make sure your DATABASE_URL in `.env` or `.env.local` is correct.

### Issue: "Can't reach database server"
**Solution:** 
1. Verify XAMPP MySQL is running
2. Check if port 3306 is not blocked
3. Try: `telnet localhost 3306`

### Issue: Database not in sync
**Solution:**
```powershell
# For SQLite
npx prisma db push --schema prisma/schema.sqlite.prisma

# For MySQL
npx prisma db push
```

---

## 📊 Article Model Status

✅ **Article model is properly configured in both databases:**

- **Database Relations:** `Article ←→ User` (via `createdBy`)
- **Admin Access:** Protected routes with role-based auth
- **API Endpoints:** `/api/admin/articles` (CRUD operations)
- **Indexes:** Status, publishedAt, slug
- **Features:** Draft/Published/Archived workflow

---

## 🎯 Quick Start Commands

### For Development (SQLite):
```powershell
npm run dev:sqlite
```

### For Production-like (MySQL):
```powershell
# 1. Start XAMPP MySQL
# 2. Create database in phpMyAdmin
# 3. Run:
npx prisma db push
npm run db:seed
npm run dev
```

---

## 📁 File Locations

- Main Schema: `prisma/schema.prisma` (MySQL)
- SQLite Schema: `prisma/schema.sqlite.prisma`
- Environment: `.env` (default), `.env.local` (overrides)
- Setup Script: `setup-mysql.sql`
- Database: `prisma/dev.db` (SQLite)

---

**Status:** ✅ SQLite is configured and working!  
**Next Step:** Follow MySQL setup steps above if needed.
