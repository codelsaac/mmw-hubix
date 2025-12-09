import { prisma } from '@/lib/prisma'

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'admin1234'

  const user = await prisma.user.upsert({
    where: { username },
    update: { password, isActive: true },
    create: {
      username,
      password,
      role: 'ADMIN',
      name: 'System Administrator',
      isActive: true,
    },
  })

  console.log(`Updated admin user ${user.username} with password "${password}"`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

