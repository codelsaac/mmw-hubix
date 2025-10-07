import { prisma } from './prisma';

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
  async updateAnnouncement(id: string, data: Partial<{
    title: string
    club: string
    date: Date
    time: string
    location: string
    description: string
    maxAttendees: number
    type: string
    isPublic: boolean
    status: string
  }>) {
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
    
    if (!announcement || (announcement.maxAttendees && announcement.attendees >= announcement.maxAttendees)) {
      return null
    }

    return await prisma.announcement.update({
      where: { id },
      data: {
        attendees: {
          increment: 1
        }
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
  async updatePublicEvent(id: string, data: Partial<{
    title: string
    description: string
    startTime: Date
    endTime: Date
    location: string
    eventType: string
    isVisible: boolean
  }>) {
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
  // Get internal events for a specific user (private to each user)
  async getInternalEvents(userId?: string) {
    const whereClause = userId ? { createdBy: userId } : {}
    
    return await prisma.internalEvent.findMany({
      where: whereClause,
      include: {
        creator: {
          select: { name: true, email: true }
        }
      },
      orderBy: { startTime: 'asc' }
    })
  },

  // Get all internal events (admin only - for management purposes)
  async getAllInternalEvents() {
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
    attendees?: any // Prisma will handle JSON
    createdBy?: string
  }) {
    return await prisma.internalEvent.create({
      data,
      include: {
        creator: {
          select: { name: true, email: true }
        }
      }
    })
  },

  // Update internal event
  async updateInternalEvent(id: string, data: any) {
    return await prisma.internalEvent.update({
      where: { id },
      data: { ...data, updatedAt: new Date() }
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
        // User model does not have createdAt in schema
      },
      orderBy: { name: 'asc' }
    })
  },

  // Get IT Prefect members
  async getITPrefectMembers() {
    return await prisma.user.findMany({
      where: {
        OR: [
          { role: 'ADMIN' },
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
  async updateUser(id: string, data: { role?: 'ADMIN' | 'HELPER' | 'GUEST', department?: string }) {
    return await prisma.user.update({
      where: { id },
      data
    })
  }
}
