#!/usr/bin/env node
/**
 * Test Database Connection for MMW Hubix
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Testing Database Connection...\n');
  
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query test successful:', result[0].test);
    
    // Check database name
    const dbName = await prisma.$queryRaw`SELECT DATABASE() as db_name`;
    console.log('✅ Database name:', dbName[0].db_name);
    
    console.log('\n🎉 Database connection is working!');
    console.log('📝 You can now run: npm run dev');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check if .env.local file exists with correct DATABASE_URL');
    console.error('2. Verify database credentials are correct');
    console.error('3. Ensure network connectivity to 10.125.145.49:3306');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();