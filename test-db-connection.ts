// Simple script to test database connection
import { prisma } from './lib/prisma';

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test 1: Check if we can connect to the database
    await prisma.$connect();
    console.log('✅ Connected to database successfully');
    
    // Test 2: Check if we can query data
    const users = await prisma.user.findMany({
      take: 2,
      select: { id: true, username: true, role: true }
    });
    console.log('✅ Queried users successfully:');
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.role})`);
    });
    
    // Test 3: Check if we can query categories
    const categories = await prisma.category.findMany({
      take: 3,
      select: { id: true, name: true, isActive: true }
    });
    console.log('✅ Queried categories successfully:');
    categories.forEach(category => {
      console.log(`   - ${category.name} (Active: ${category.isActive})`);
    });
    
    // Test 4: Check if we can create a simple record (then delete it)
    const testSetting = await prisma.siteSetting.create({
      data: {
        key: 'test_connection',
        value: 'test_value',
        label: 'Test Connection Setting'
      }
    });
    console.log('✅ Created test record successfully');
    
    await prisma.siteSetting.delete({ where: { id: testSetting.id } });
    console.log('✅ Deleted test record successfully');
    
    console.log('\n🎉 All database tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection test failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
