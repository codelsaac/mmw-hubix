import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Demo accounts matching auth.ts configuration
  const demoUsers = [
    {
      username: 'guest',
      name: 'Guest User',
      role: UserRole.GUEST,
      department: 'Public',
      isActive: true,
    },
    {
      username: 'admin',
      name: 'System Administrator',
      role: UserRole.ADMIN,
      department: 'Admin',
      isActive: true,
    },
    {
      username: 'helper',
      name: 'IT Assistant',
      role: UserRole.HELPER,
      department: 'IT',
      isActive: true,
    },
  ]

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: user,
    })
    console.log(`✓ ${user.name} (${user.username}) seeded`)
  }

  console.log('\n✅ All demo users seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })