import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET /api/announcements - Get all announcements
export async function GET() {
  const session = await getServerSession(authOptions)

  try {
    // If the user is not authenticated, only return public announcements
    const whereClause = session?.user?.email ? {} : { isPublic: true };

    const announcements = await prisma.announcement.findMany({
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

    return NextResponse.json(announcements)
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    )
  }
}

// POST /api/announcements - Create new announcement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || (user.role !== "ADMIN" && user.role !== "HELPER")) {
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

    const announcement = await prisma.announcement.create({
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

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    console.error("Error creating announcement:", error)
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    )
  }
}