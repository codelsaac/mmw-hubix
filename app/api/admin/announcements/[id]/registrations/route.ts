import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuthAPI } from "@/lib/auth-server"
import { UserRole } from "@/lib/permissions"
import { logger } from "@/lib/logger"

// GET /api/admin/announcements/[id]/registrations - Get all registrations for an activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthAPI([UserRole.ADMIN])
    const { id } = await params

    const registrations = await prisma.activityRegistration.findMany({
      where: {
        announcementId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(registrations)
  } catch (error) {
    logger.error("Error fetching registrations:", error)
    return NextResponse.json(
      { error: "Failed to fetch registrations" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/announcements/[id]/registrations - Update registration status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthAPI([UserRole.ADMIN])
    const { id } = await params
    const body = await request.json()

    const { registrationId, status } = body

    if (!registrationId || !status) {
      return NextResponse.json(
        { error: "Registration ID and status are required" },
        { status: 400 }
      )
    }

    const registration = await prisma.activityRegistration.update({
      where: {
        id: registrationId,
      },
      data: {
        status,
      },
    })

    return NextResponse.json(registration)
  } catch (error) {
    logger.error("Error updating registration:", error)
    return NextResponse.json(
      { error: "Failed to update registration" },
      { status: 500 }
    )
  }
}
