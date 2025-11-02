import { PrismaClient, UserRole, ArticleStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...\n')

  // Clear existing data (optional - comment out to keep existing data)
  console.log('🗑️  Clearing existing data...')
  await prisma.resource.deleteMany({})
  await prisma.article.deleteMany({})
  await prisma.announcement.deleteMany({})
  await prisma.trainingResource.deleteMany({})
  await prisma.category.deleteMany({})
  console.log('✓ Data cleared\n')

  // Demo accounts matching auth.ts configuration
  console.log('👥 Creating users...')
  const demoUsers = [
    {
      username: 'guest',
      name: 'Guest User',
      email: 'guest@cccmmw.edu.hk',
      password: 'guest123',
      role: UserRole.GUEST,
      department: 'Public',
      isActive: true,
      image: '/abstract-profile.png',
    },
    {
      username: 'admin',
      name: 'System Administrator',
      email: 'admin@cccmmw.edu.hk',
      password: 'mmw2025',
      role: UserRole.ADMIN,
      department: 'Administration',
      isActive: true,
      image: '/abstract-profile.png',
    },
    {
      username: 'helper',
      name: 'IT Helper',
      email: 'helper@cccmmw.edu.hk',
      password: 'helper123',
      role: UserRole.HELPER,
      department: 'IT Department',
      isActive: true,
      image: '/abstract-profile.png',
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

  // Create training resources
  const trainingResources = [
    {
      title: 'Introduction to IT Support',
      description: 'Basic IT support concepts and best practices for IT Prefects',
      contentType: 'TEXT' as const,
      textContent: 'This comprehensive guide covers the fundamentals of IT support, including troubleshooting techniques, customer service skills, and common technical issues.',
      tags: '["IT Support", "Basics", "Troubleshooting"]',
      difficulty: 'BEGINNER',
      isPublic: true,
    },
    {
      title: 'Network Troubleshooting',
      description: 'Step-by-step guide to diagnosing and fixing network issues',
      contentType: 'TEXT' as const,
      textContent: 'Learn how to identify network problems, use diagnostic tools, and implement solutions for common connectivity issues.',
      tags: '["Networking", "Troubleshooting", "Diagnostics"]',
      difficulty: 'INTERMEDIATE',
      isPublic: true,
    },
    {
      title: 'Password Security Best Practices',
      description: 'Essential security practices for password management',
      contentType: 'TEXT' as const,
      textContent: 'Understanding password policies, creating strong passwords, and educating users about security best practices.',
      tags: '["Security", "Passwords", "Best Practices"]',
      difficulty: 'BEGINNER',
      isPublic: true,
    },
    {
      title: 'Hardware Maintenance',
      description: 'Basic computer hardware maintenance and troubleshooting',
      contentType: 'TEXT' as const,
      textContent: 'Learn about computer components, preventive maintenance, and common hardware issues and solutions.',
      tags: '["Hardware", "Maintenance", "Troubleshooting"]',
      difficulty: 'INTERMEDIATE',
      isPublic: true,
    },
    {
      title: 'Software Installation Guide',
      description: 'Proper procedures for software installation and updates',
      contentType: 'TEXT' as const,
      textContent: 'Step-by-step guide for installing software, managing updates, and ensuring system compatibility.',
      tags: '["Software", "Installation", "Updates"]',
      difficulty: 'BEGINNER',
      isPublic: true,
    },
  ]

  for (const resource of trainingResources) {
    await prisma.trainingResource.create({
      data: resource,
    })
    console.log(`✓ Training resource "${resource.title}" seeded`)
  }

  // Create some announcements
  const announcements = [
    {
      title: 'IT Prefect Meeting - This Friday',
      description: 'Monthly team meeting to discuss upcoming projects and address any technical issues.',
      location: 'Computer Lab 1',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      time: '14:00',
      maxAttendees: 20,
      club: 'IT Prefects',
      type: 'meeting',
      status: 'active',
      isPublic: true,
    },
    {
      title: 'New Software Training Session',
      description: 'Learn about the latest educational software being introduced to the school.',
      location: 'Library Computer Room',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      time: '10:00',
      maxAttendees: 15,
      club: 'IT Prefects',
      type: 'training',
      status: 'active',
      isPublic: true,
    },
  ]

  for (const announcement of announcements) {
    await prisma.announcement.create({
      data: announcement,
    })
    console.log(`✓ Announcement "${announcement.title}" seeded`)
  }

  // Create some categories for resources
  const categories = [
    {
      name: 'Uncategorized',
      description: 'Miscellaneous IT support and administration resources',
      icon: 'Settings',
      color: '#3B82F6',
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Networking',
      description: 'Network configuration and troubleshooting resources',
      icon: 'Network',
      color: '#10B981',
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Security',
      description: 'Cybersecurity and password management resources',
      icon: 'Shield',
      color: '#EF4444',
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'Hardware',
      description: 'Computer hardware maintenance and repair resources',
      icon: 'Monitor',
      color: '#F59E0B',
      sortOrder: 4,
      isActive: true,
    },
    {
      name: 'Software',
      description: 'Software installation and management resources',
      icon: 'Layers',
      color: '#8B5CF6',
      sortOrder: 5,
      isActive: true,
    },
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.create({
      data: category,
    })
    createdCategories.push(created)
    console.log(`✓ Category "${category.name}" seeded`)
  }

  // Create resources with actual useful links
  console.log('\n🔗 Creating resources...')
  const resources = [
    {
      name: 'Google Classroom',
      url: 'https://classroom.google.com',
      description: 'Online learning management system for assignments and grades',
      categoryId: createdCategories[0].id,
      status: 'active',
      clicks: 0,
    },
    {
      name: 'School Email',
      url: 'https://mail.google.com',
      description: 'Access your school Gmail account',
      categoryId: createdCategories[0].id,
      status: 'active',
      clicks: 0,
    },
    {
      name: 'IT Support Form',
      url: 'https://forms.google.com',
      description: 'Submit IT support requests and technical issues',
      categoryId: createdCategories[0].id,
      status: 'active',
      clicks: 0,
    },
    {
      name: 'Network Troubleshooting Guide',
      url: 'https://support.google.com/wifi',
      description: 'Comprehensive guide for diagnosing network problems',
      categoryId: createdCategories[1].id,
      status: 'active',
      clicks: 0,
    },
    {
      name: 'Password Manager Guide',
      url: 'https://support.google.com/accounts/answer/6208650',
      description: 'Learn how to use Google Password Manager securely',
      categoryId: createdCategories[2].id,
      status: 'active',
      clicks: 0,
    },
    {
      name: 'PC Hardware Guide',
      url: 'https://www.intel.com/content/www/us/en/support.html',
      description: 'Intel support documentation for computer hardware',
      categoryId: createdCategories[3].id,
      status: 'active',
      clicks: 0,
    },
    {
      name: 'Windows Update Center',
      url: 'https://support.microsoft.com/windows',
      description: 'Microsoft Windows update and troubleshooting center',
      categoryId: createdCategories[4].id,
      status: 'active',
      clicks: 0,
    },
    {
      name: 'Chrome Web Store',
      url: 'https://chrome.google.com/webstore',
      description: 'Browse and install Chrome extensions and apps',
      categoryId: createdCategories[4].id,
      status: 'active',
      clicks: 0,
    },
  ]

  for (const resource of resources) {
    await prisma.resource.create({
      data: resource,
    })
    console.log(`✓ Resource "${resource.name}" seeded`)
  }

  // Create sample articles
  console.log('\n📝 Creating articles...')
  const adminUser = await prisma.user.findUnique({ where: { username: 'admin' } })
  
  let articlesCreated = 0
  if (adminUser) {
    const articles = [
      {
        title: 'Welcome to MMW Hubix',
        slug: 'welcome-to-mmw-hubix',
        content: `# Welcome to MMW Hubix\n\nMMW Hubix is your central hub for IT resources, training materials, and school announcements.\n\n## Features\n\n- **Resource Hub**: Quick access to all essential school resources\n- **Library**: Comprehensive IT training materials\n- **Activity News**: Stay updated with school events\n- **Admin Dashboard**: Manage content and users (Admin only)\n\nWe're excited to have you here!`,
        excerpt: 'Your central hub for IT resources and school information',
        status: ArticleStatus.PUBLISHED,
        isPublic: true,
        publishedAt: new Date(),
        tags: 'welcome,getting-started,information',
        createdBy: adminUser.id,
      },
      {
        title: 'IT Prefect Responsibilities',
        slug: 'it-prefect-responsibilities',
        content: `# IT Prefect Responsibilities\n\nAs an IT Prefect at MMW, you play a crucial role in maintaining our school's technology infrastructure.\n\n## Core Duties\n\n1. **Technical Support**: Assist teachers and students with technical issues\n2. **Equipment Maintenance**: Ensure all IT equipment is in good working condition\n3. **Training**: Help train other students on using school technology\n4. **Documentation**: Keep records of technical issues and solutions\n\n## Weekly Tasks\n\n- Check all computer labs\n- Update inventory\n- Respond to support tickets\n- Attend team meetings\n\nThank you for your dedication!`,
        excerpt: 'Learn about the duties and responsibilities of IT Prefects',
        status: ArticleStatus.PUBLISHED,
        isPublic: true,
        publishedAt: new Date(),
        tags: 'it-prefect,responsibilities,duties',
        createdBy: adminUser.id,
      },
      {
        title: 'Network Safety Tips',
        slug: 'network-safety-tips',
        content: `# Network Safety Tips\n\nStay safe online with these essential cybersecurity practices.\n\n## Password Security\n\n- Use strong, unique passwords for each account\n- Enable two-factor authentication\n- Never share your passwords\n\n## Email Safety\n\n- Be cautious of suspicious emails\n- Don't click unknown links\n- Verify sender identity\n\n## Social Media\n\n- Keep personal information private\n- Check privacy settings\n- Think before you post\n\nStay safe online!`,
        excerpt: 'Essential cybersecurity tips for students',
        status: ArticleStatus.PUBLISHED,
        isPublic: true,
        publishedAt: new Date(),
        tags: 'cybersecurity,safety,tips',
        createdBy: adminUser.id,
      },
    ]

    for (const article of articles) {
      await prisma.article.create({
        data: article,
      })
      articlesCreated++
      console.log(`✓ Article "${article.title}" seeded`)
    }
  } else {
    console.log('⚠ Skipping articles - admin user not found')
  }

  console.log('\n✅ All demo data seeded successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - ${demoUsers.length} users`)
  console.log(`   - ${categories.length} categories`)
  console.log(`   - ${resources.length} resources`)
  console.log(`   - ${trainingResources.length} training resources`)
  console.log(`   - ${announcements.length} announcements`)
  console.log(`   - ${articlesCreated} articles`)
  console.log('\n🚀 Your database is ready to use!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })