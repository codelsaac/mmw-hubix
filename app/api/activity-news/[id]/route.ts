import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { UserRole } from "@/lib/permissions"
import { logger } from "@/lib/logger"

// GET /api/activity-news/[id] - Get single activity news
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const activityNews = await prisma.announcement.findUnique({
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

    if (!activityNews) {
      return NextResponse.json(
        { error: "Activity News not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(activityNews)
  } catch (error) {
    logger.error("Error fetching activity news:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity news" },
      { status: 500 }
    )
  }
}

// PUT /api/activity-news/[id] - Update activity news
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

    const activityNews = await prisma.announcement.update({
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

    return NextResponse.json(activityNews)
  } catch (error) {
    logger.error("Error updating activity news:", error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Failed to update activity news" },
      { status: 500 }
    )
  }
}

// DELETE /api/activity-news/[id] - Delete activity news
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

    return NextResponse.json({ message: "Activity News deleted successfully" })
  } catch (error) {
    logger.error("Error deleting activity news:", error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json(
      { error: "Failed to delete activity news" },
      { status: 500 }
    )
  }
}
