import { PrismaClient } from '@prisma/client'

// Initialize Prisma Client with error handling
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

try {
  prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error)
  throw new Error('Database connection failed. Please ensure DATABASE_URL is set correctly.')
}

export { prisma }

// ==========================================
// ANNOUNCEMENT MANAGEMENT
// ==========================================

export const AnnouncementDB = {
  // Get all public announcements for students
  async getPublicAnnouncements() {
    return await prisma.announcement.findMany({
      where: { 
        isPublic: true,
        status: 'active'
      },
      include: {
        creator: {
          select: { name: true, email: true }
        }
      },
      orderBy: { date: 'asc' }
    })
  },

  // Get all announcements for admin management
  async getAllAnnouncements() {
    return await prisma.announcement.findMany({
      include: {
        creator: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  },

  // Create new announcement
  async createAnnouncement(data: {
    title: string
    club: string
    date: Date
    time: string
    location: string
    description: string
    maxAttendees: number
    type: string
    isPublic?: boolean
    createdBy?: string
  }) {
    return await prisma.announcement.create({
      data,
      include: {
        creator: {
          select: { name: true, email: true }
        }
      }
    })
  },

  // Update announcement
  async updateAnnouncement(id: string, data: any) {
    return await prisma.announcement.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      include: {
        creator: {
          select: { name: true, email: true }
        }
      }
    })
  },

  // Delete announcement
  async deleteAnnouncement(id: string) {
    return await prisma.announcement.delete({
      where: { id }
    })
  },

  // Join event (increment attendees)
  async joinEvent(id: string) {
    const announcement = await prisma.announcement.findUnique({
      where: { id }
    })
    
    if (!announcement || announcement.attendees >= announcement.maxAttendees) {
      return null
    }

    return await prisma.announcement.update({
      where: { id },
      data: {
        attendees: announcement.attendees + 1
      }
    })
  }
}

// ==========================================
// PUBLIC CALENDAR MANAGEMENT (Admin managed, Student visible)
// ==========================================

export const PublicCalendarDB = {
  // Get all public calendar events for students
  async getPublicEvents() {
    return await prisma.publicEvent.findMany({
      where: { isVisible: true },
      include: {
        creator: {
          select: { name: true, email: true }
        }
      },
      orderBy: { startTime: 'asc' }
    })
  },

  // Get all events for admin management
  async getAllPublicEvents() {
    return await prisma.publicEvent.findMany({
      include: {
        creator: {
          select: { name: true, email: true }
        }
      },
      orderBy: { startTime: 'asc' }
    })
  },

  // Create public event (admin only)
  async createPublicEvent(data: {
    title: string
    description?: string
    startTime: Date
    endTime: Date
    location?: string
    eventType?: string
    isVisible?: boolean
    createdBy?: string
  }) {
    return await prisma.publicEvent.create({
      data,
      include: {
        creator: {
          select: { name: true, email: true }
        }
      }
    })
  },

  // Update public event
  async updatePublicEvent(id: string, data: any) {
    return await prisma.publicEvent.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      include: {
        creator: {
          select: { name: true, email: true }
        }
      }
    })
  },

  // Delete public event
  async deletePublicEvent(id: string) {
    return await prisma.publicEvent.delete({
      where: { id }
    })
  }
}

// ==========================================
// IT PREFECT ACTIVITY MANAGEMENT
// ==========================================

export const ActivityDB = {
  // Get recent activities for dashboard
  async getRecentActivities(limit: number = 10) {
    return await prisma.activity.findMany({
      take: limit,
      include: {
        creator: {
          select: { name: true, email: true }
        },
        assignee: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  },

  // Create new activity
  async createActivity(data: {
    type: string
    title: string
    description: string
    status?: string
    priority?: string
    assignedTo?: string
    createdBy?: string
  }) {
    return await prisma.activity.create({
      data,
      include: {
        creator: {
          select: { name: true, email: true }
        },
        assignee: {
          select: { name: true, email: true }
        }
      }
    })
  },

  // Update activity status
  async updateActivity(id: string, data: any) {
    return await prisma.activity.update({
      where: { id },
      data: { ...data, updatedAt: new Date() }
    })
  }
}

// ==========================================
// IT PREFECT TASK MANAGEMENT
// ==========================================

export const TaskDB = {
  // Get all tasks
  async getAllTasks() {
    return await prisma.task.findMany({
      include: {
        creator: {
          select: { name: true, email: true }
        },
        assignee: {
          select: { name: true, email: true }
        }
      },
      orderBy: [
        { status: 'asc' }, // pending first
        { priority: 'desc' }, // high priority first
        { dueDate: 'asc' }
      ]
    })
  },

  // Get tasks assigned to a specific user
  async getUserTasks(userId: string) {
    return await prisma.task.findMany({
      where: { assignedTo: userId },
      include: {
        creator: {
          select: { name: true, email: true }
        }
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' }
      ]
    })
  },

  // Create new task
  async createTask(data: {
    title: string
    description?: string
    dueDate: Date
    priority?: string
    assignedTo?: string
    createdBy?: string
  }) {
    return await prisma.task.create({
      data,
      include: {
        creator: {
          select: { name: true, email: true }
        },
        assignee: {
          select: { name: true, email: true }
        }
      }
    })
  },

  // Update task
  async updateTask(id: string, data: any) {
    return await prisma.task.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      include: {
        creator: {
          select: { name: true, email: true }
        },
        assignee: {
          select: { name: true, email: true }
        }
      }
    })
  },

  // Complete task
  async completeTask(id: string) {
    return await prisma.task.update({
      where: { id },
      data: { 
        status: 'completed',
        updatedAt: new Date()
      }
    })
  }
}

// ==========================================
// INTERNAL EVENT MANAGEMENT (IT Prefect only)
// ==========================================

export const InternalEventDB = {
  // Get all internal events
  async getInternalEvents() {
    return await prisma.internalEvent.findMany({
      include: {
        creator: {
          select: { name: true, email: true }
        }
      },
      orderBy: { startTime: 'asc' }
    })
  },

  // Create internal event
  async createInternalEvent(data: {
    title: string
    description?: string
    startTime: Date
    endTime: Date
    location?: string
    eventType?: string
    attendees?: string[] // Will be converted to JSON string
    createdBy?: string
  }) {
    const eventData = {
      ...data,
      attendees: data.attendees ? JSON.stringify(data.attendees) : null
    }
    
    return await prisma.internalEvent.create({
      data: eventData,
      include: {
        creator: {
          select: { name: true, email: true }
        }
      }
    })
  },

  // Update internal event
  async updateInternalEvent(id: string, data: any) {
    const updateData = { ...data }
    if (data.attendees && Array.isArray(data.attendees)) {
      updateData.attendees = JSON.stringify(data.attendees)
    }
    
    return await prisma.internalEvent.update({
      where: { id },
      data: { ...updateData, updatedAt: new Date() }
    })
  }
}

// ==========================================
// RESOURCE MANAGEMENT
// ==========================================

export const ResourceDB = {
  // Get all active resources
  async getActiveResources() {
    return await prisma.resource.findMany({
      where: { status: 'active' },
      include: {
        creator: {
          select: { name: true, email: true }
        }
      },
      orderBy: { name: 'asc' }
    })
  },

  // Get all resources for admin
  async getAllResources() {
    return await prisma.resource.findMany({
      include: {
        creator: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  },

  // Create resource
  async createResource(data: {
    name: string
    url: string
    description: string
    category: string
    status?: string
    createdBy?: string
  }) {
    return await prisma.resource.create({
      data
    })
  },

  // Update resource clicks
  async incrementClicks(id: string) {
    return await prisma.resource.update({
      where: { id },
      data: {
        clicks: {
          increment: 1
        }
      }
    })
  }
}

// ==========================================
// TRAINING VIDEO MANAGEMENT
// ==========================================

export const TrainingVideoDB = {
  // Get public training videos (visible to students)
  async getPublicVideos() {
    return await prisma.trainingVideo.findMany({
      where: { isPublic: true },
      include: {
        creator: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  },

  // Get all training videos (IT Prefect access)
  async getAllVideos() {
    return await prisma.trainingVideo.findMany({
      include: {
        creator: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  },

  // Create training video
  async createTrainingVideo(data: {
    title: string
    description?: string
    videoUrl: string
    category: string
    duration?: number
    isPublic?: boolean
    createdBy?: string
  }) {
    return await prisma.trainingVideo.create({
      data,
      include: {
        creator: {
          select: { name: true, email: true }
        }
      }
    })
  }
}

// ==========================================
// USER MANAGEMENT
// ==========================================

export const UserDB = {
  // Get all users
  async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    })
  },

  // Get IT Prefect members
  async getITPrefectMembers() {
    return await prisma.user.findMany({
      where: {
        OR: [
          { role: 'admin' },
          { department: 'IT' }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true
      },
      orderBy: { name: 'asc' }
    })
  },

  // Update user role/department
  async updateUser(id: string, data: { role?: string, department?: string }) {
    return await prisma.user.update({
      where: { id },
      data
    })
  }
}
