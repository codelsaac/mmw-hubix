import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { InternalEventDB } from '@/lib/database'

// PUT /api/dashboard/internal-events/[id] - Update internal event
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow authenticated IT Prefects and Admins
    if (!session?.user || (session.user.role !== 'admin' && session.user.department !== 'IT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    const event = await InternalEventDB.updateInternalEvent(params.id, {
      title: data.title,
      description: data.description,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      location: data.location,
      eventType: data.eventType,
      attendees: data.attendees,
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating internal event:', error)
    return NextResponse.json({ error: 'Failed to update internal event' }, { status: 500 })
  }
}

// DELETE /api/dashboard/internal-events/[id] - Delete internal event
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow authenticated IT Prefects and Admins to delete
    if (!session?.user || (session.user.role !== 'admin' && session.user.department !== 'IT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For safety, we could add a soft delete instead of hard delete
    await InternalEventDB.updateInternalEvent(params.id, {
      eventType: 'deleted'
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Internal event deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting internal event:', error)
    return NextResponse.json({ error: 'Failed to delete internal event' }, { status: 500 })
  }
}
