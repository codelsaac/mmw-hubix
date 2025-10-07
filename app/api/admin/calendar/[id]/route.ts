import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { PublicCalendarDB } from '@/lib/database'

import { logger } from "@/lib/logger"
// PUT /api/admin/calendar/[id] - Update calendar event
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    
    // Allow admins and IT department users to update calendar events
    if (!session?.user || (session.user.role !== 'admin' && session.user.department !== 'IT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    const event = await PublicCalendarDB.updatePublicEvent(params.id, {
      title: data.title,
      description: data.description,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      location: data.location,
      eventType: data.eventType,
      isVisible: data.isVisible,
    })

    return NextResponse.json(event)
  } catch (error) {
    logger.error('Error updating calendar event:', error)
    return NextResponse.json({ error: 'Failed to update calendar event' }, { status: 500 })
  }
}

// DELETE /api/admin/calendar/[id] - Delete calendar event
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    
    // Allow admins and IT department users to delete calendar events
    if (!session?.user || (session.user.role !== 'admin' && session.user.department !== 'IT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await PublicCalendarDB.deletePublicEvent(params.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Calendar event deleted successfully' 
    })
  } catch (error) {
    logger.error('Error deleting calendar event:', error)
    return NextResponse.json({ error: 'Failed to delete calendar event' }, { status: 500 })
  }
}
