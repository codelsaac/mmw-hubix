import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { UserRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { logger } from "@/lib/logger"

// GET /api/admin/announcements/[id] - Get single announcement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    return NextResponse.json(announcement)
  } catch (error) {
    logger.error('Error fetching announcement:', error)
    return NextResponse.json({ error: 'Failed to fetch announcement' }, { status: 500 })
  }
}

// PUT /api/admin/announcements/[id] - Update announcement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { id } = await params

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title: data.title,
        club: data.club,
        date: data.date ? new Date(data.date) : undefined,
        time: data.time,
        location: data.location,
        description: data.description,
        maxAttendees: data.maxAttendees,
        attendees: data.attendees,
        type: data.type,
        status: data.status,
        isPublic: data.isPublic,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(announcement)
  } catch (error) {
    logger.error('Error updating announcement:', error)
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 })
  }
}

// DELETE /api/admin/announcements/[id] - Delete announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.announcement.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error deleting announcement:', error)
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 })
  }
}
