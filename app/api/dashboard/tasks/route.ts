import { NextRequest, NextResponse } from 'next/server'
import { TaskDB } from '@/lib/database'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/lib/permissions'
import { authenticateRequest } from '@/lib/auth-server'
import { logger } from "@/lib/logger"
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limiter'
import { handleApiError } from '@/lib/error-handler'
// GET /api/dashboard/tasks - Get all tasks or user-specific tasks
export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.AUTH)
    if (rateLimitResult) return rateLimitResult

    const { user, response } = await authenticateRequest()
    
    if (response) {
      return response
    }

    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    let tasks
    if (userId && userId === user.id) {
      // Get tasks assigned to specific user
      tasks = await TaskDB.getUserTasks(userId)
    } else if (user.role === UserRole.ADMIN || user.department === 'IT') {
      // Get all tasks for admins/IT prefects
      tasks = await TaskDB.getAllTasks()
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(tasks)
  } catch (error) {
    logger.error('Error fetching tasks:', error)
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

// POST /api/dashboard/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.AUTH)
    if (rateLimitResult) return rateLimitResult

    const { user, response } = await authenticateRequest()
    
    if (response) {
      return response
    }

    if (user.role !== UserRole.ADMIN && user.department !== 'IT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Ensure the user exists in the database first
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        department: user.department,
      },
      create: {
        id: user.id,
        username: user.username || user.email?.split('@')[0] || 'user',
        name: user.name || 'IT Prefect',
        email: user.email,
        role: (user.role as UserRole) || UserRole.GUEST,
        department: user.department || 'IT',
      }
    })

    const task = await TaskDB.createTask({
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      priority: data.priority || 'medium',
      assignedTo: data.assignedTo,
      createdBy: user.id
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    logger.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
