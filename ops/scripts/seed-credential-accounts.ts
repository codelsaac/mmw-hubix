import { hashPassword } from "better-auth/crypto"
import { prisma } from "@/lib/prisma"

async function main() {
  const users = [
    { username: process.env.DEMO_ADMIN_USERNAME || "admin", password: process.env.DEMO_ADMIN_PASSWORD || "admin1234", role: "ADMIN", name: "System Administrator" },
    { username: process.env.DEMO_HELPER_USERNAME || "helper", password: process.env.DEMO_HELPER_PASSWORD || "helper123", role: "HELPER", name: "IT Assistant" },
  ]

  for (const user of users) {
    const hashed = await hashPassword(user.password)

    const dbUser = await prisma.user.upsert({
      where: { username: user.username },
      update: { name: user.name, role: user.role as any, isActive: true },
      create: { username: user.username, name: user.name, role: user.role as any, isActive: true },
    })

    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "credential",
          providerAccountId: user.username,
        },
      },
      update: {
        providerId: "credential",
        password: hashed,
        type: "credentials",
      },
      create: {
        userId: dbUser.id,
        provider: "credential",
        providerId: "credential",
        providerAccountId: user.username,
        type: "credentials",
        password: hashed,
      },
    })

    console.log(`Seeded credential account for ${user.username}`)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

