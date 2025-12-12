const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('better-auth/crypto');

const prisma = new PrismaClient();

async function setAdminPassword() {
  const adminUsername = 'admin';
  const password = 'admin123'; // Temporary password

  try {
    // Find the admin user
    const admin = await prisma.user.findUnique({
      where: { username: adminUsername },
      include: { accounts: true }
    });

    if (!admin) {
      console.log('Admin user not found. Creating one...');
      // Create admin user if not exists
      const newAdmin = await prisma.user.create({
        data: {
          username: adminUsername,
          name: 'System Administrator',
          role: 'ADMIN',
          isActive: true
        }
      });
      console.log('Admin user created:', newAdmin.username);
    }

    // Hash the password using Better Auth's built-in hash function
    const hashedPassword = await hashPassword(password);

    // Create or update credential account with correct provider name
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'credential',
          providerAccountId: adminUsername
        }
      },
      update: {
        password: hashedPassword,
        type: 'credentials'
      },
      create: {
        provider: 'credential',
        providerId: 'credential',
        providerAccountId: adminUsername,
        password: hashedPassword,
        userId: admin ? admin.id : (await prisma.user.findUnique({ where: { username: adminUsername } })).id,
        type: 'credentials'
      }
    });

    console.log(`✅ Admin password set successfully!`);
    console.log(`   Username: ${adminUsername}`);
    console.log(`   Password: ${password}`);
    console.log(`   Note: Change this password in production!`);

  } catch (error) {
    console.error('❌ Error setting admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminPassword();
