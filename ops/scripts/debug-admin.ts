import { prisma } from "@/lib/prisma"

async function main() {
  const user = await prisma.user.findUnique({
    where: { username: "admin" },
    select: { id: true, username: true, password: true, role: true },
  })

  const accounts = await prisma.account.findMany({
    where: { userId: user?.id },
  })

  console.log({ user, accounts })
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

