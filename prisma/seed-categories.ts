import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultCategories = [
  { name: "IT Basics", sortOrder: 1 },
  { name: "Security", sortOrder: 2 },
  { name: "Troubleshooting", sortOrder: 3 },
  { name: "Networking", sortOrder: 4 },
  { name: "Programming", sortOrder: 5 },
  { name: "Database", sortOrder: 6 },
]

async function seedCategories() {
  console.log('🌱 Seeding default categories...')

  for (const category of defaultCategories) {
    try {
      await prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: {
          name: category.name,
          sortOrder: category.sortOrder,
          isActive: true,
        }
      })
      console.log(`✅ Created/updated category: ${category.name}`)
    } catch (error) {
      console.error(`❌ Error creating category ${category.name}:`, error)
    }
  }

  console.log('✅ Categories seeded successfully!')
}

seedCategories()
  .catch((e) => {
    console.error('Error seeding categories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
