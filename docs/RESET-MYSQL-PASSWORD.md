# Reset MySQL Root Password (Windows)

## Method 1: Using MySQL Command Line (If you have access)

1. **Stop MySQL Service:**
   ```powershell
   net stop MySQL80
   # Or whatever your MySQL service name is
   # Check service name with: Get-Service | Where-Object {$_.Name -like "*mysql*"}
   ```

2. **Start MySQL in Safe Mode:**
   ```powershell
   mysqld --skip-grant-tables --skip-networking
   ```

3. **Open another terminal and connect:**
   ```powershell
   mysql -u root
   ```

4. **Reset the password:**
   ```sql
   FLUSH PRIVILEGES;
   ALTER USER 'root'@'localhost' IDENTIFIED BY '';
   -- Or set a new password:
   -- ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
   FLUSH PRIVILEGES;
   EXIT;
   ```

5. **Restart MySQL normally:**
   ```powershell
   net start MySQL80
   ```

## Method 2: Using MySQL Workbench

1. Open **MySQL Workbench**
2. Try to connect with any credentials you remember
3. If connected, go to **Server** → **Users and Privileges**
4. Select `root` user and reset the password

## Method 3: Check MySQL Service Name

Run this to find your MySQL service:
```powershell
Get-Service | Where-Object {$_.Name -like "*mysql*"}
```

## Method 4: Reinstall MySQL (Last Resort)

If you don't need existing data:
1. Uninstall MySQL completely
2. Reinstall and set a known password (or no password)
3. Remember to write it down this time!

## After Resetting Password

Update your `.env.local` file:

**No password:**
```env
DATABASE_URL="mysql://root@localhost:3306/mmw_hubix_dev?connection_limit=5"
```

**With password:**
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/mmw_hubix_dev?connection_limit=5"
```

Then run:
```powershell
npx prisma generate
npx prisma db push
npm run dev
```
