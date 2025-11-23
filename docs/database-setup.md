# MMW Hubix Database Setup Guide

## Database Connection Options

### Option 1: School Database (Recommended for School Network)
**Connection Details:**
- Database IP: 10.125.145.49
- Database name: 6A25
- User: mmw20-1086
- Password: MmwS25555@
- Port: 3306

**Current .env configuration:**
```env
DATABASE_URL=mysql://mmw20-1086:MmwS25555@@10.125.145.49:3306/6A25
```

**Requirements:**
- Must be connected to school network (WiFi or LAN)
- Database server accessible from your location

### Option 2: Local Development Database
If you're working from home or outside school network:

#### Install MySQL locally:
1. **Windows:** Download MySQL Installer from https://dev.mysql.com/downloads/installer/
2. **Mac:** `brew install mysql`
3. **Linux:** `sudo apt-get install mysql-server`

#### Setup local database:
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create database
CREATE DATABASE mmw_hubix_dev;

-- Create user (optional)
CREATE USER 'mmw_dev'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON mmw_hubix_dev.* TO 'mmw_dev'@'localhost';
FLUSH PRIVILEGES;
```

#### Update .env for local development:
```env
DATABASE_URL=mysql://mmw_dev:your_password@localhost:3306/mmw_hubix_dev
```

## Database Migration

After setting up either database connection:

1. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Push Schema to Database:**
   ```bash
   npx prisma db push
   ```

3. **Seed Database (optional):**
   ```bash
   npm run db:seed
   ```

## Switching Between Databases

Create multiple .env files:
- `.env.school` - For school database
- `.env.local` - For local development

Switch by copying:
```bash
# For school network
cp .env.school .env

# For local development  
cp .env.local .env
```

## Troubleshooting

### Connection Timeout Error
If you get "ETIMEDOUT" error:
1. Verify you're on school network
2. Check if database server is running
3. Test with MySQL client: `mysql -h 10.125.145.49 -u mmw20-1086 -p`

### Access Denied Error
1. Verify credentials are correct
2. Check if user has permissions for database
3. Contact database administrator if needed

### Prisma Errors
1. Regenerate Prisma client: `npx prisma generate`
2. Clear Prisma cache: `npx prisma generate --force`
3. Check schema syntax in `prisma/schema.prisma`

## Network Requirements

For school database access:
- Connected to school WiFi network
- VPN access if working remotely (check with IT department)
- Firewall rules allowing MySQL port 3306

## Security Notes

- Never commit database credentials to version control
- Use environment variables for sensitive data
- Change default passwords in production
- Regularly update database user permissions
