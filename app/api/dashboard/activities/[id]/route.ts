import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { ActivityDB } from '@/lib/database'

// PUT /api/dashboard/activities/[id] - Update activity
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Allow admins and IT department users to edit activities
    if (session.user.role !== 'admin' && session.user.department !== 'IT' && session.user.role !== 'user') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const data = await request.json()
    
    const activity = await ActivityDB.updateActivity(params.id, {
      type: data.type,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignedTo: data.assignedTo,
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 })
  }
}

// DELETE /api/dashboard/activities/[id] - Delete activity
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
    }

    // Delete activity from database
    await ActivityDB.updateActivity(params.id, { status: 'deleted' })

    return NextResponse.json({ success: true, message: 'Activity deleted successfully' })
  } catch (error) {
    console.error('Error deleting activity:', error)
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 })
  }
}
