-- CreateEnum
CREATE TABLE new_User (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'GUEST',
    "department" TEXT,
    "permissions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME
);

-- Copy data from old table, converting IT_PREFECT to GUEST
INSERT INTO new_User SELECT 
    id, name, email, emailVerified, image, 
    CASE 
        WHEN role = 'IT_PREFECT' THEN 'GUEST'
        ELSE role 
    END as role,
    department, permissions, isActive, lastLoginAt
FROM User;

-- Drop old table and rename new table
DROP TABLE User;
ALTER TABLE new_User RENAME TO User;

-- Recreate unique constraint
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
