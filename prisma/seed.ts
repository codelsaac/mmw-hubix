import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('ℹ️ No demo seed data is bundled with this project.')
  console.log('   Add your own seed logic in prisma/seed.ts when needed.')

  // Example scaffold:
  // await prisma.user.create({
  //   data: { username: 'admin', password: 'changeme', role: 'ADMIN' },
  // })

  console.log('✅ Seed script finished without modifying the database.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })