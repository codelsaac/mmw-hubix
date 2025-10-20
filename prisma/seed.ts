import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Demo accounts matching auth.ts configuration
  const demoUsers = [
    {
      username: 'guest',
      name: 'Guest User',
      role: UserRole.GUEST,
      department: 'Public',
      isActive: true,
    },
    {
      username: 'admin',
      name: 'System Administrator',
      role: UserRole.ADMIN,
      department: 'Admin',
      isActive: true,
    },
    {
      username: 'helper',
      name: 'IT Assistant',
      role: UserRole.HELPER,
      department: 'IT',
      isActive: true,
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

  for (const category of categories) {
    await prisma.category.create({
      data: category,
    })
    console.log(`✓ Category "${category.name}" seeded`)
  }

  console.log('\n✅ All demo data seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })