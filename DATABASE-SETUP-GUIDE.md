# 🗄️ MMW Hubix - MySQL Database Setup Guide

This project now standardizes on **MySQL** for both development and production environments.

## 📋 Current Configuration

### Configure `.env.local`
```env
DATABASE_URL="mysql://root@localhost:3306/mmw_hubix_dev?connection_limit=5"
```

If your MySQL instance requires authentication, include the password:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/mmw_hubix_dev?connection_limit=5"
```

---

## 🔧 Setup Instructions

### Step 1: Start MySQL
- Launch **XAMPP** (or your preferred MySQL server)
- Start the **MySQL** service and ensure it is running on port `3306`

### Step 2: Create Database
1. Open http://localhost/phpmyadmin
2. Click **"New"** in the left sidebar
3. Set database name to `mmw_hubix_dev`
4. Set collation to `utf8mb4_unicode_ci`
5. Click **Create**

Alternatively, run the SQL script in `setup-mysql.sql`.

### Step 3: Generate Client & Push Schema
```powershell
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

---

## 🔄 Applying Schema Changes

Whenever you modify `prisma/schema.prisma`:

```powershell
npx prisma generate
npx prisma db push
npm run db:seed   # optional, when seed data changes
```

---

## ✅ Database Verification

Use Prisma Studio to inspect data:

```powershell
npx prisma studio
```

---

## 🚨 Troubleshooting

- **"EPERM: operation not permitted"**: close running Node processes with `taskkill /F /IM node.exe`
- **"Error validating datasource"**: ensure `DATABASE_URL` uses the `mysql://` scheme
- **"Can't reach database server"**: verify MySQL is running, confirm port `3306`, and check firewall settings
- **Database out of sync**: run `npx prisma db push`
- **Seed data missing**: run `npm run db:seed`

---

## 🎯 Quick Start Commands

```powershell
# Start services
net start mysql   # or use XAMPP Control Panel

# Initialize schema & seed
npx prisma db push
npm run db:seed

# Start development server
npm run dev
```

---

## 📁 File Locations

- Prisma schema: `prisma/schema.prisma`
- Environment variables: `.env` (base), `.env.local` (developer overrides)
- Setup script: `setup-mysql.sql`
- Seed script: `prisma/seed.ts`

---

**Status:** ✅ MySQL workflow is unified across development and production.
