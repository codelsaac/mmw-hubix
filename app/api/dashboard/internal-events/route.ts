import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { InternalEventDB } from '@/lib/database'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/lib/permissions'

import { logger } from "@/lib/logger"
// GET /api/dashboard/internal-events - Get internal events for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow authenticated IT Prefects and Admins
    if (!session?.user || (session.user.role !== 'admin' && session.user.department !== 'IT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For regular IT Prefects: only show their own events
    // For admins: show all internal events (for management purposes)
    const events = session.user.role === 'admin' 
      ? await InternalEventDB.getAllInternalEvents()
      : await InternalEventDB.getInternalEvents(session.user.id)
    
    return NextResponse.json(events)
  } catch (error) {
    logger.error('Error fetching internal events:', error)
    return NextResponse.json({ error: 'Failed to fetch internal events' }, { status: 500 })
  }
}

// POST /api/dashboard/internal-events - Create new internal event
export async function POST(request: NextRequest) {
  try {
    logger.log('POST /api/dashboard/internal-events - Starting request')
    const session = await getServerSession(authOptions)
    logger.log('Internal Event Session:', { 
      user: session?.user ? { 
        id: session.user.id, 
        email: session.user.email, 
        role: session.user.role as UserRole, 
        department: session.user.department 
      } : null 
    })
    
    // Only allow authenticated IT Prefects and Admins to create events
    if (!session?.user || (session.user.role !== 'admin' && session.user.department !== 'IT')) {
      logger.log('Internal Event Authorization failed:', { 
        hasUser: !!session?.user, 
        role: session?.user?.role, 
        department: session?.user?.department 
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    logger.log('Internal Event Request data:', data)
    
    // Ensure the user exists in the database first
    logger.log('Ensuring user exists for internal event:', session.user.id)
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
    logger.log('User ensured in database for internal event')
    
    const event = await InternalEventDB.createInternalEvent({
      title: data.title,
      description: data.description,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      location: data.location,
      eventType: data.eventType || 'meeting',
      attendees: data.attendees || [],
      createdBy: session.user.id
    })

    logger.log('Internal Event created successfully:', event.id)
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    logger.error('Error creating internal event:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to create internal event: ${message}` }, { status: 500 })
  }
}
