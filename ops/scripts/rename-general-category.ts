import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Renaming resource category "General" to "Uncategorized"...')

  const existingCategory = await prisma.category.findFirst({
    where: { name: 'General' },
  })

  if (!existingCategory) {
    console.log('✅ No category named "General" found. Nothing to update.')
    return
  }

  await prisma.category.update({
    where: { id: existingCategory.id },
    data: {
      name: 'Uncategorized',
      description: existingCategory.description?.includes('General IT')
        ? 'Miscellaneous IT support and administration resources'
        : existingCategory.description,
    },
  })

  console.log(`✅ Category updated (ID: ${existingCategory.id})`)
}

main()
  .catch((error) => {
    console.error('❌ Error updating category name:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
