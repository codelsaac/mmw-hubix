import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/announcements/[id]/join - Join an event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id: params.id },
    })

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      )
    }

    if (announcement.attendees >= announcement.maxAttendees) {
      return NextResponse.json(
        { error: "Event is full" },
        { status: 400 }
      )
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: params.id },
      data: {
        attendees: {
          increment: 1,
        },
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

    return NextResponse.json(updatedAnnouncement)
  } catch (error) {
    console.error("Error joining event:", error)
    return NextResponse.json(
      { error: "Failed to join event" },
      { status: 500 }
    )
  }
}