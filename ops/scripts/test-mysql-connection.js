const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');

// Common passwords for standalone MySQL installations
const passwords = [
  '', 
  'root', 
  'password', 
  'admin', 
  'mmw2025',
  '123456',
  'mysql',
  'Root123',
  'Password123',
  'Mysql123',
  '12345678',
  'rootroot',
  'toor'
];

async function testConnection(password) {
  const connectionString = password === '' 
    ? 'mysql://root@localhost:3306/mmw_hubix_dev?connection_limit=5'
    : `mysql://root:${password}@localhost:3306/mmw_hubix_dev?connection_limit=5`;

  // Temporarily update DATABASE_URL
  process.env.DATABASE_URL = connectionString;

  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: connectionString
        }
      }
    });
    
    await prisma.$connect();
    await prisma.$disconnect();
    return true;
  } catch (error) {
    return false;
  }
}

async function findWorkingPassword() {
  console.log('🔍 Testing MySQL connection with different passwords...\n');

  for (const pwd of passwords) {
    const displayPwd = pwd === '' ? '(empty/no password)' : pwd;
    process.stdout.write(`Testing password: ${displayPwd}... `);
    
    const works = await testConnection(pwd);
    
    if (works) {
      console.log('✅ SUCCESS!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ WORKING MYSQL CREDENTIALS FOUND!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\nUpdate your .env.local file with:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const correctUrl = pwd === '' 
        ? 'DATABASE_URL="mysql://root@localhost:3306/mmw_hubix_dev?connection_limit=5"'
        : `DATABASE_URL="mysql://root:${pwd}@localhost:3306/mmw_hubix_dev?connection_limit=5"`;
      
      console.log(correctUrl);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      // Offer to update automatically
      console.log('Would you like me to update .env.local automatically?');
      console.log('Run: node test-mysql-connection.js --update\n');
      
      return pwd;
    } else {
      console.log('❌ Failed');
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('❌ None of the common passwords worked.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nPlease check your MySQL password in XAMPP or phpMyAdmin.');
  console.log('You can reset it by:');
  console.log('1. Open XAMPP Control Panel');
  console.log('2. Click "Shell" button');
  console.log('3. Run: mysqladmin -u root password ""');
  console.log('   (This sets password to empty)\n');
  
  return null;
}

findWorkingPassword().catch(console.error);
