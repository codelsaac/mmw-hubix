import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { InternalEventDB, prisma } from '@/lib/database'

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
    console.error('Error fetching internal events:', error)
    return NextResponse.json({ error: 'Failed to fetch internal events' }, { status: 500 })
  }
}

// POST /api/dashboard/internal-events - Create new internal event
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/dashboard/internal-events - Starting request')
    const session = await getServerSession(authOptions)
    console.log('Internal Event Session:', { 
      user: session?.user ? { 
        id: session.user.id, 
        email: session.user.email, 
        role: session.user.role, 
        department: session.user.department 
      } : null 
    })
    
    // Only allow authenticated IT Prefects and Admins to create events
    if (!session?.user || (session.user.role !== 'admin' && session.user.department !== 'IT')) {
      console.log('Internal Event Authorization failed:', { 
        hasUser: !!session?.user, 
        role: session?.user?.role, 
        department: session?.user?.department 
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    console.log('Internal Event Request data:', data)
    
    // Ensure the user exists in the database first
    console.log('Ensuring user exists for internal event:', session.user.id)
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
    console.log('User ensured in database for internal event')
    
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

    console.log('Internal Event created successfully:', event.id)
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating internal event:', error)
    return NextResponse.json({ error: `Failed to create internal event: ${error.message}` }, { status: 500 })
  }
}
