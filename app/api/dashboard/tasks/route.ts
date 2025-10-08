import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { TaskDB } from '@/lib/database'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/lib/permissions'

import { logger } from "@/lib/logger"
// GET /api/dashboard/tasks - Get all tasks or user-specific tasks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    let tasks
    if (userId && userId === session.user.id) {
      // Get tasks assigned to specific user
      tasks = await TaskDB.getUserTasks(userId)
    } else if (session.user.role === 'admin' || session.user.department === 'IT') {
      // Get all tasks for admins/IT prefects
      tasks = await TaskDB.getAllTasks()
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(tasks)
  } catch (error) {
    logger.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST /api/dashboard/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'admin' && session.user.department !== 'IT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Ensure the user exists in the database first
    await prisma.user.upsert({
      where: { id: session.user.id },
      update: {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role as UserRole,
        department: session.user.department,
      },
      create: {
        id: session.user.id,
        username: session.user.username || session.user.email?.split('@')[0] || 'user',
        name: session.user.name || 'IT Prefect',
        email: session.user.email,
        role: (session.user.role as UserRole) || UserRole.GUEST,
        department: session.user.department || 'IT',
      }
    })

    const task = await TaskDB.createTask({
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
      priority: data.priority || 'medium',
      assignedTo: data.assignedTo,
      createdBy: session.user.id
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    logger.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
