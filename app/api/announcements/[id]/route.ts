import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { UserRole } from "@/lib/permissions"
import { logger } from "@/lib/logger"

// GET /api/announcements/[id] - Get single announcement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const announcement = await prisma.announcement.findUnique({
      where: { id: id },
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
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(announcement)
  } catch (error) {
    logger.error("Error fetching announcement:", error)
    return NextResponse.json(
      { error: "Failed to fetch announcement" },
      { status: 500 }
    )
  }
}

// PUT /api/announcements/[id] - Update announcement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.HELPER)) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      club,
      date,
      time,
      location,
      description,
      maxAttendees,
      type,
      status,
      isPublic,
    } = body

    const announcement = await prisma.announcement.update({
      where: { id: id },
      data: {
        title,
        club,
        date: new Date(date),
        time,
        location,
        description,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
        type,
        status,
        isPublic,
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
    logger.error("Error updating announcement:", error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    )
  }
}

// DELETE /api/announcements/[id] - Delete announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.HELPER)) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    await prisma.announcement.delete({ where: { id: id } })

    return NextResponse.json({ message: "Announcement deleted successfully" })
  } catch (error) {
    logger.error("Error deleting announcement:", error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    )
  }
}