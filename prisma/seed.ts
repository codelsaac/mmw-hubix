import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultCategories = [
  { name: 'Academics', description: 'Academic resources and tools', color: '#3b82f6', sortOrder: 1 },
  { name: 'Student Life', description: 'Student life and campus activities', color: '#10b981', sortOrder: 2 },
  { name: 'Resources', description: 'General resources and tools', color: '#6b7280', sortOrder: 3 },
  { name: 'Technology', description: 'Technology and IT resources', color: '#8b5cf6', sortOrder: 4 },
  { name: 'Library', description: 'Library and research resources', color: '#f59e0b', sortOrder: 5 },
]

async function main() {
  console.log('🌱 Seeding default categories...')

  for (const categoryData of defaultCategories) {
    try {
      await prisma.category.upsert({
        where: { name: categoryData.name },
        update: { isActive: true },
        create: {
          name: categoryData.name,
          description: categoryData.description,
          color: categoryData.color,
          sortOrder: categoryData.sortOrder,
          isActive: true,
        },
      })
      console.log(`✅ Created/updated category: ${categoryData.name}`)
    } catch (error) {
      console.error(`❌ Error creating category ${categoryData.name}:`, error)
    }
  }

  console.log('✅ Seed script finished successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })