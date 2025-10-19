import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

// POST /api/activity-news/[id]/join - Register for an activity
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate required fields
    if (!body.studentName || !body.studentName.trim()) {
      return NextResponse.json(
        { error: "Student name is required" },
        { status: 400 }
      )
    }

    // Check if activity news exists
    const activityNews = await prisma.announcement.findUnique({
      where: { id: id },
    })

    if (!activityNews) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }

    // Check if activity is active
    if (activityNews.status !== "active") {
      return NextResponse.json(
        { error: "This activity is no longer accepting registrations" },
        { status: 400 }
      )
    }

    // Check if activity is full
    if (activityNews.maxAttendees && activityNews.attendees >= activityNews.maxAttendees) {
      return NextResponse.json(
        { error: "This activity is full" },
        { status: 400 }
      )
    }

    // Create registration and increment attendee count
    const registration = await prisma.activityRegistration.create({
      data: {
        announcementId: id,
        studentName: body.studentName.trim(),
        studentEmail: body.studentEmail?.trim() || null,
        studentPhone: body.studentPhone?.trim() || null,
        studentClass: body.studentClass?.trim() || null,
        studentNumber: body.studentNumber?.trim() || null,
        message: body.message?.trim() || null,
        status: "pending",
      },
    })

    // Increment attendee count
    await prisma.announcement.update({
      where: { id: id },
      data: {
        attendees: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Registration successful! The teacher will review your application.",
      registration: {
        id: registration.id,
        studentName: registration.studentName,
        createdAt: registration.createdAt,
      },
    })
  } catch (error) {
    logger.error("Error registering for activity:", error)
    return NextResponse.json(
      { error: "Failed to register. Please try again." },
      { status: 500 }
    )
  }
}
