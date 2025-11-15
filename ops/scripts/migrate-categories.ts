import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateCategories() {
  try {
    console.log('Starting category migration...')
    
    // First, create default categories
    const defaultCategories = [
      { name: 'Academics', description: 'Academic resources and tools', icon: 'BookOpen', color: '#3b82f6', sortOrder: 1 },
      { name: 'Student Life', description: 'Student life and campus activities', icon: 'Users', color: '#10b981', sortOrder: 2 },
      { name: 'Resources', description: 'General resources and tools', icon: 'FileText', color: '#6b7280', sortOrder: 3 },
      { name: 'Technology', description: 'Technology and IT resources', icon: 'Laptop', color: '#8b5cf6', sortOrder: 4 },
      { name: 'Library', description: 'Library and research resources', icon: 'Library', color: '#f59e0b', sortOrder: 5 },
      { name: 'Campus Services', description: 'Campus services and facilities', icon: 'Building', color: '#ef4444', sortOrder: 6 },
      { name: 'Health & Wellness', description: 'Health and wellness resources', icon: 'Heart', color: '#ec4899', sortOrder: 7 },
      { name: 'Career Services', description: 'Career and job resources', icon: 'Briefcase', color: '#06b6d4', sortOrder: 8 },
      { name: 'Financial Aid', description: 'Financial aid and scholarships', icon: 'DollarSign', color: '#84cc16', sortOrder: 9 },
      { name: 'Housing', description: 'Housing and accommodation', icon: 'Home', color: '#f97316', sortOrder: 10 },
      { name: 'Transportation', description: 'Transportation and travel', icon: 'Car', color: '#059669', sortOrder: 11 },
      { name: 'Events & Activities', description: 'Events and activities', icon: 'PartyPopper', color: '#dc2626', sortOrder: 12 },
      { name: 'Clubs & Organizations', description: 'Clubs and student organizations', icon: 'UserCheck', color: '#7c3aed', sortOrder: 13 },
      { name: 'Research', description: 'Research and academic projects', icon: 'Microscope', color: '#0891b2', sortOrder: 14 },
      { name: 'International Students', description: 'Resources for international students', icon: 'Globe2', color: '#be185d', sortOrder: 15 },
      { name: 'Alumni', description: 'Alumni resources and networking', icon: 'GraduationCap', color: '#0d9488', sortOrder: 16 },
      { name: 'Emergency Services', description: 'Emergency and safety resources', icon: 'Phone', color: '#dc2626', sortOrder: 17 },
    ]

    // Create categories
    const createdCategories = []
    for (const categoryData of defaultCategories) {
      const category = await prisma.category.upsert({
        where: { name: categoryData.name },
        update: categoryData,
        create: categoryData,
      })
      createdCategories.push(category)
      console.log(`Created/updated category: ${category.name}`)
    }

    // Get the default "Resources" category for existing resources
    const defaultCategory = createdCategories.find(cat => cat.name === 'Resources')
    if (!defaultCategory) {
      throw new Error('Default Resources category not found')
    }

    // Since the database was reset, there are no existing resources to migrate
    console.log('No existing resources to migrate (database was reset)')

    console.log('Category migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateCategories()
  .then(() => {
    console.log('Migration script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration script failed:', error)
    process.exit(1)
  })
