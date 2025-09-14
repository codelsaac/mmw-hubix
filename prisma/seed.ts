import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default admin user if not exists
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cccmmw.edu.hk' },
    update: {},
    create: {
      email: 'admin@cccmmw.edu.hk',
      name: 'Admin User',
      role: 'ADMIN',
      department: 'IT',
      isActive: true,
    },
  })

  // Create some sample announcements
  const announcements = [
    {
      title: "Computer Club Workshop: Web Development Basics",
      club: "Computer Club",
      date: new Date("2025-01-15"),
      time: "3:30 PM",
      location: "Computer Lab A",
      description: "Learn the fundamentals of HTML, CSS, and JavaScript in this hands-on workshop. Perfect for beginners!",
      attendees: 25,
      maxAttendees: 30,
      type: "Workshop",
      status: "active" as const,
      isPublic: true,
      createdBy: adminUser.id,
    },
    {
      title: "Science Fair Project Presentations",
      club: "Science Society",
      date: new Date("2025-01-18"),
      time: "2:00 PM",
      location: "Main Auditorium",
      description: "Students will present their innovative science projects. Come support your peers and learn about cutting-edge research.",
      attendees: 150,
      maxAttendees: 200,
      type: "Event",
      status: "active" as const,
      isPublic: true,
      createdBy: adminUser.id,
    },
    {
      title: "Debate Competition: Technology and Society",
      club: "Debate Club",
      date: new Date("2025-01-20"),
      time: "4:00 PM",
      location: "Conference Room B",
      description: "Join us for an engaging debate on the impact of technology on modern society. All students welcome to participate or observe.",
      attendees: 18,
      maxAttendees: 20,
      type: "Competition",
      status: "active" as const,
      isPublic: true,
      createdBy: adminUser.id,
    },
  ]

  for (const announcement of announcements) {
    await prisma.announcement.upsert({
      where: { 
        title_club: {
          title: announcement.title,
          club: announcement.club,
        }
      },
      update: {},
      create: announcement,
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })