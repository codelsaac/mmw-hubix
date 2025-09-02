import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PublicCalendarDB, ActivityDB } from '@/lib/database'

// POST /api/admin/calendar/from-activity - Create calendar event from activity
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Allow both admins and IT department users to create calendar events from activities
    if (!session?.user || (session.user.role !== 'admin' && session.user.department !== 'IT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Create public calendar event from activity data
    const event = await PublicCalendarDB.createPublicEvent({
      title: data.title,
      description: data.description || `Activity: ${data.title}`,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      location: data.location,
      eventType: data.eventType || 'general',
      isVisible: data.isVisible ?? true,
      createdBy: session.user.id
    })

    // If activityId is provided, update the activity to reference the calendar event
    if (data.activityId) {
      await ActivityDB.updateActivity(data.activityId, {
        status: 'scheduled',
        description: `${data.description || ''}\nScheduled as calendar event: ${event.title}`
      })
    }

    return NextResponse.json({
      success: true,
      event,
      message: 'Calendar event created successfully from activity'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating calendar event from activity:', error)
    return NextResponse.json({ error: 'Failed to create calendar event from activity' }, { status: 500 })
  }
}
