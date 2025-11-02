-- MMW Hubix School Server Database Setup
-- Run this on your school MySQL server

-- Create database
CREATE DATABASE IF NOT EXISTS mmw_hubix_school 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create user for the application (replace with your school's requirements)
CREATE USER IF NOT EXISTS 'mmw_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON mmw_hubix_school.* TO 'mmw_user'@'localhost';
FLUSH PRIVILEGES;

-- Use the database
USE mmw_hubix_school;

-- Show tables (will be created by Prisma migrations)
SHOW TABLES;
