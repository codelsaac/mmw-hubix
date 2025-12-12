const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    // Find the admin user with accounts
    const admin = await prisma.user.findUnique({
      where: { username: 'admin' },
      include: { accounts: true }
    });

    console.log('Admin User:', admin);

    if (admin?.accounts) {
      for (const account of admin.accounts) {
        console.log('\nAccount:', account);
        // Check if password matches
        const isMatch = await bcrypt.compare('admin123', account.password);
        console.log('Password Match:', isMatch);
      }
    }
  } catch (error) {
    console.error('Error checking admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
