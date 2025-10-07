import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { ActivityDB } from '@/lib/database'
import { prisma } from '@/lib/prisma'

import { logger } from "@/lib/logger"
// GET /api/dashboard/activities - Get recent IT Prefect activities
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const activities = await ActivityDB.getRecentActivities(10)
    return NextResponse.json(activities)
  } catch (error) {
    logger.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

// POST /api/dashboard/activities - Create new activity
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    // Allow admins and IT department users to create activities
    if (!session?.user || (session.user.role !== 'admin' && session.user.department !== 'IT' && session.user.role !== 'user')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Ensure the user exists in the database first
    await prisma.user.upsert({
      where: { id: session.user.id },
      update: {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        department: session.user.department,
      },
      create: {
        id: session.user.id,
        name: session.user.name || 'IT Prefect',
        email: session.user.email,
        role: session.user.role || 'user',
        department: session.user.department || 'IT',
      }
    })

    const activity = await ActivityDB.createActivity({
      type: data.type,
      title: data.title,
      description: data.description,
      status: data.status || 'new',
      priority: data.priority || 'medium',
      assignedTo: data.assignedTo,
      createdBy: session.user.id
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    logger.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}
