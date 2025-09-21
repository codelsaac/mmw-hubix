import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default admin user
  const adminEmail = 'admin@cccmmw.edu.hk'
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cccmmw.edu.hk' },
    update: {},
    create: {
      email: 'admin@cccmmw.edu.hk',
      name: 'Admin User',
      role: 'ADMIN',
      department: 'IT',
      isActive: true,
    },
  })
  console.log('Admin user seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })