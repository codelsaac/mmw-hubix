# 🗄️ MMW Hubix - MySQL Database Setup Guide

This project now standardizes on **MySQL** for both development and production environments.

## 📋 Current Configuration

### Understanding Environment Files

**`.env`** - Base configuration for local development and default runtime  
**`.env.production`** - Production deployment configuration (optional)

> 💡 Use `.env` for local development. URL‑encode special characters in passwords.

### Configure `.env`

Create a `.env` file in your project root with your MySQL connection:

#### Option 1: MySQL without password (default root user)
```env
DATABASE_URL="mysql://root@localhost:3306/mmw_hubix_dev?connection_limit=5"
```

#### Option 2: MySQL with password
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/mmw_hubix_dev?connection_limit=5"
```

#### Option 3: Custom MySQL user
```env
DATABASE_URL="mysql://mmw_user:secure_password@localhost:3306/mmw_hubix_dev?connection_limit=5"
```

**Connection String Format:**
```
mysql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?connection_limit=5
```

- `USER`: MySQL username (default: `root`)
- `PASSWORD`: MySQL password (omit `:PASSWORD` if no password)
- `HOST`: Database server address (usually `localhost` or `127.0.0.1`)
- `PORT`: MySQL port (default: `3306`)
- `DATABASE`: Database name (`mmw_hubix_dev` for development)
- `connection_limit=5`: Max concurrent connections (adjust for production)

> ⚠️ **Special Characters**: URL-encode passwords with special characters  
> Example: `p@ssw0rd!` becomes `p%40ssw0rd%21`

---

## 🔧 Setup Instructions

### Step 1: Start MySQL

#### Option A: Running MySQL as a Windows Service
1. Press `Win + R`, type `services.msc`, and press Enter
2. Locate **MySQL** or **MySQL80** in the list
3. Right-click the service and choose **Start** (or **Restart**)
4. Default port: `3306` (no password if root has none)

#### Option B: Using Standalone MySQL Server
1. **Windows Service:**
   ```powershell
   net start mysql
   ```
2. **Check status:**
   ```powershell
   mysql -u root -p
   ```

#### Option C: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your local instance
3. Verify connection is active

#### Port Conflict Troubleshooting
If port `3306` is already in use:

1. **Find conflicting process:**
   ```powershell
   netstat -ano | findstr :3306
   ```

2. **Change the MySQL port:**
   - Locate your `my.ini` (e.g., `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`)
   - Update `port = 3306` to `port = 3307`
   - Restart the MySQL service
   - Update your `DATABASE_URL` accordingly

3. **Or stop the conflicting service:**
   ```powershell
   taskkill /PID <PID> /F
   ```

### Step 2: Create Database

#### Option A: Using phpMyAdmin
1. Open http://localhost/phpmyadmin
2. Click **"New"** in the left sidebar
3. Set database name to `mmw_hubix_dev`
4. Set collation to `utf8mb4_unicode_ci`
5. Click **Create**

#### Option B: Using SQL Script
```powershell
mysql -u root -p < setup-mysql.sql
```

#### Option C: Using MySQL Command Line
```sql
CREATE DATABASE mmw_hubix_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2.1: Create MySQL User (Optional but Recommended)

For better security, create a dedicated database user instead of using `root`:

```sql
-- Connect to MySQL
mysql -u root -p

-- Create user
CREATE USER 'mmw_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON mmw_hubix_dev.* TO 'mmw_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW GRANTS FOR 'mmw_user'@'localhost';
```

Then update your `.env`:
```env
DATABASE_URL="mysql://mmw_user:your_secure_password@localhost:3306/mmw_hubix_dev?connection_limit=5"
```

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

### Common Issues

#### 1. "EPERM: operation not permitted"
**Cause:** Node processes locking Prisma files  
**Solution:**
```powershell
taskkill /F /IM node.exe
npx prisma generate
```

#### 2. "Error validating datasource"
**Cause:** Incorrect `DATABASE_URL` format  
**Solution:**
- Must start with `mysql://` (not `mysql2://`)
- Check for typos in connection string
- Verify special characters are URL-encoded

#### 3. "Can't reach database server"
**Cause:** MySQL not running or wrong port  
**Solution:**
1. Verify MySQL is running:
   ```powershell
   netstat -ano | findstr :3306
   ```
2. Confirm the MySQL service status in **Services** or MySQL Workbench
3. Test connection:
   ```powershell
   mysql -u root -p
   ```
4. Verify firewall allows port 3306

#### 4. "Access denied for user"
**Cause:** Wrong username/password  
**Solution:**
- Verify credentials in `.env`
- Check if password has special characters (URL-encode them)
- Try connecting via MySQL Workbench with same credentials
- Reset MySQL password if needed (see `docs/RESET-MYSQL-PASSWORD.md`)

#### 5. "Database out of sync"
**Cause:** Schema changes not applied  
**Solution:**
```powershell
npx prisma generate
npx prisma db push
```

#### 6. "Seed data missing"
**Cause:** Database not seeded  
**Solution:**
```powershell
npm run db:seed
```

#### 7. "Port 3306 already in use"
**Cause:** Another MySQL instance or service using the port  
**Solution:** See "Port Conflict Troubleshooting" in Step 1

---

## 🎯 Quick Start Commands

```powershell
# Start services
net start mysql

# Initialize schema & seed
npx prisma db push
npm run db:seed

# Start development server
npm run dev
```

---

## 📁 File Locations

- Prisma schema: `prisma/schema.prisma`
- Environment variables: `.env` (local/default), `.env.production` (deployment)
- Setup script: `setup-mysql.sql`
- Seed script: `prisma/seed.ts`

---

**Status:** ✅ MySQL workflow is unified across development and production.
