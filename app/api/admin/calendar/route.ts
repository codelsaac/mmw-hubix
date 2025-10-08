import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { PublicCalendarDB } from '@/lib/database'
import { prisma } from '@/lib/prisma'

import { logger } from "@/lib/logger"
// GET /api/admin/calendar - Get all public calendar events for admin management
export async function GET() {
  try {
    const session = await auth()
    
    // Allow admins and IT department users to access calendar management
    if (!session?.user || (session.user.role !== 'admin' && session.user.department !== 'IT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const events = await PublicCalendarDB.getAllPublicEvents()
    return NextResponse.json(events)
  } catch (error) {
    logger.error('Error fetching calendar events:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 })
  }
}

// POST /api/admin/calendar - Create new public calendar event
export async function POST(request: NextRequest) {
  try {
    logger.log('POST /api/admin/calendar - Starting request')
    const session = await auth()
    logger.log('Session:', { 
      user: session?.user ? { 
        id: session.user.id, 
        email: session.user.email, 
        role: session.user.role, 
        department: session.user.department 
      } : null 
    })
    
    const data = await request.json()
    logger.log('Request data:', data)

    // Check if this is a public event (isVisible: true)
    const isPublicEvent = data.isVisible === true

    // Only admins can create public events
    if (isPublicEvent && (!session?.user || session.user.role !== 'admin')) {
      logger.log('Authorization failed - only admins can create public events:', {
        hasUser: !!session?.user,
        role: session?.user?.role,
        department: session?.user?.department,
        isPublicEvent
      })
      return NextResponse.json({ error: 'Unauthorized: Only admins can create public events' }, { status: 401 })
    }

    // Allow admins and IT department users to create internal calendar events
    if (!session?.user || (session.user.role !== 'admin' && session.user.department !== 'IT')) {
      logger.log('Authorization failed - not admin or IT department:', {
        hasUser: !!session?.user,
        role: session?.user?.role,
        department: session?.user?.department
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure the user exists in the database first
    logger.log('Ensuring user exists:', session.user.id)
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
        name: session.user.name || 'Admin User',
        email: session.user.email,
        role: session.user.role || 'admin',
        department: session.user.department || 'Admin',
      }
    })
    logger.log('User ensured in database')
    
    const event = await PublicCalendarDB.createPublicEvent({
      title: data.title,
      description: data.description,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      location: data.location,
      eventType: data.eventType || 'general',
      isVisible: data.isVisible ?? true,
      createdBy: session.user.id
    })

    logger.log('Event created successfully:', event.id)
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    logger.error('Error creating calendar event:', error)
    return NextResponse.json({ error: `Failed to create calendar event: ${error.message}` }, { status: 500 })
  }
}
