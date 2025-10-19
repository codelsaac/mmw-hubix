import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { UserRole } from "@/lib/permissions"

import { logger } from "@/lib/logger"
// GET /api/activity-news - Get all activity news
export async function GET() {
  const session = await getServerSession(authOptions)

  try {
    // If the user is not authenticated, only return public activity news
    const whereClause = session?.user?.email ? {} : { isPublic: true };

    const activityNews = await prisma.announcement.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(activityNews)
  } catch (error) {
    logger.error("Error fetching activity news:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity news" },
      { status: 500 }
    )
  }
}

// POST /api/activity-news - Create new activity news
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Ensure the user exists in the database first (upsert pattern)
    const user = await prisma.user.upsert({
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
        name: session.user.name || 'User',
        email: session.user.email,
        role: (session.user.role as UserRole) || UserRole.GUEST,
        department: session.user.department || 'General',
      }
    })

    if (user.role !== "ADMIN" && user.role !== "HELPER") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      )
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
      status = "active",
      isPublic = true,
    } = body

    const activityNews = await prisma.announcement.create({
      data: {
        title,
        club,
        date: new Date(date),
        time,
        location,
        description,
        maxAttendees: parseInt(maxAttendees),
        type,
        status,
        isPublic,
        createdBy: user.id,
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

    return NextResponse.json(activityNews, { status: 201 })
  } catch (error) {
    logger.error("Error creating activity news:", error)
    return NextResponse.json(
      { error: "Failed to create activity news" },
      { status: 500 }
    )
  }
}
