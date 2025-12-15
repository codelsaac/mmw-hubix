import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultCategories = [
  { name: 'Academics', description: 'Academic resources and tools', color: '#3b82f6', sortOrder: 1 },
  { name: 'Student Life', description: 'Student life and campus activities', color: '#10b981', sortOrder: 2 },
  { name: 'Resources', description: 'General resources and tools', color: '#6b7280', sortOrder: 3 },
  { name: 'Technology', description: 'Technology and IT resources', color: '#8b5cf6', sortOrder: 4 },
  { name: 'Library', description: 'Library and research resources', color: '#f59e0b', sortOrder: 5 },
]

async function removeDemoAccounts() {
  const adminUsername = process.env.DEMO_ADMIN_USERNAME || 'admin'
  const demoUsernames = [
    process.env.DEMO_HELPER_USERNAME || 'helper',
    process.env.DEMO_STUDENT_USERNAME, // optional override
  ]
    .filter((username): username is string => Boolean(username))
    .filter((username, index, arr) => arr.indexOf(username) === index)
    .filter((username) => username !== adminUsername)

  if (!demoUsernames.length) {
    console.log('ℹ️ No demo accounts scheduled for removal.')
    return
  }

  const result = await prisma.user.deleteMany({
    where: { username: { in: demoUsernames } },
  })

  console.log(`🧹 Removed ${result.count} demo account(s): ${demoUsernames.join(', ')}`)
}

async function main() {
  // Skip demo account cleanup since we'll be recreating the standard accounts below
  console.log('🧼 Skipping demo account cleanup...')

  console.log('🌱 Seeding default categories...')

  // Create Admin User
  // Note: Passwords are handled by Better Auth via Account model (see seed-credential-accounts.ts)
  const adminUsername = process.env.DEMO_ADMIN_USERNAME || 'admin'
  try {
    const admin = await prisma.user.upsert({
      where: { username: adminUsername },
      update: {
        role: 'ADMIN',
        isActive: true,
      },
      create: {
        username: adminUsername,
        name: 'System Administrator',
        role: 'ADMIN',
        isActive: true,
      },
    })
    console.log(`✅ Admin user ready: ${admin.username}`)
  } catch (e) {
    console.error('Error creating admin:', e)
  }

  // Create Helper User
  // Note: Passwords are handled by Better Auth via Account model (see seed-credential-accounts.ts)
  const helperUsername = process.env.DEMO_HELPER_USERNAME || 'helper'
  try {
    const helper = await prisma.user.upsert({
      where: { username: helperUsername },
      update: {
        role: 'HELPER',
        isActive: true,
      },
      create: {
        username: helperUsername,
        name: 'IT Helper',
        role: 'HELPER',
        isActive: true,
      },
    })
    console.log(`✅ Helper user ready: ${helper.username}`)
  } catch (e) {
    console.error('Error creating helper:', e)
  }


  const categories = []
  for (const categoryData of defaultCategories) {
    try {
      const cat = await prisma.category.upsert({
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
      categories.push(cat)
      console.log(`✅ Created/updated category: ${categoryData.name}`)
    } catch (error) {
      console.error(`❌ Error creating category ${categoryData.name}:`, error)
    }
  }

  // --- DEMO CONTENT ---
  console.log('🌱 Seeding demo content...')
  const adminUser = await prisma.user.findUnique({ where: { username: adminUsername } })

  if (adminUser && categories.length > 0) {
    // 1. Resources
    const demoResources = [
      { name: 'School Portal', url: 'https://example.com', description: 'Main school portal access', categoryName: 'Academics' },
      { name: 'Library Catalog', url: 'https://example.com/lib', description: 'Search book inventory', categoryName: 'Library' },
      { name: 'IT Helpdesk', url: 'https://example.com/help', description: 'Submit technical tickets', categoryName: 'Technology' },
    ]

    for (const res of demoResources) {
      const cat = categories.find(c => c.name === res.categoryName)
      if (cat) {
        await prisma.resource.create({
          data: {
            name: res.name,
            url: res.url,
            description: res.description,
            categoryId: cat.id,
            createdBy: adminUser.id,
            status: 'active'
          }
        })
      }
    }
    console.log('✅ Demo Resources created')

    // 2. Announcements (Activities)
    await prisma.announcement.create({
      data: {
        title: 'Welcome to New Term',
        club: 'School Office',
        date: new Date(),
        time: '09:00',
        location: 'Hall',
        description: 'Welcome ceremony for all students',
        type: 'general',
        status: 'active',
        isPublic: true,
        createdBy: adminUser.id
      }
    })
    console.log('✅ Demo Announcements created')

    // 3. Articles
    await prisma.article.create({
      data: {
        title: 'Getting Started with IT Perfect',
        slug: 'getting-started-it-perfect-' + Date.now(),
        content: '# Welcome\nThis is a demo article showing how to use the system.',
        excerpt: 'Learn the basics of using our new platform.',
        status: 'PUBLISHED',
        isPublic: true,
        publishedAt: new Date(),
        createdBy: adminUser.id
      }
    })
    console.log('✅ Demo Articles created')
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