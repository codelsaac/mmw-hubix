import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuthAPI } from "@/lib/auth-server"
import { UserRole } from "@/lib/permissions"
import { logger } from "@/lib/logger"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limiter"
import { handleApiError } from "@/lib/error-handler"

export async function GET(req: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.AUTH)
    if (rateLimitResult) return rateLimitResult

    // Allow all authenticated users to read team notes
    await requireAuthAPI()

    // Get the first (and only) team notes record
    let teamNotes = await prisma.teamNotes.findFirst({
      orderBy: { updatedAt: "desc" },
    })

    // If no notes exist, create empty notes
    if (!teamNotes) {
      teamNotes = await prisma.teamNotes.create({
        data: {
          content: "",
        },
      })
    }

    return NextResponse.json(teamNotes)
  } catch (error) {
    logger.error("Failed to fetch team notes:", error)
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.AUTH)
    if (rateLimitResult) return rateLimitResult

    // Only admins can update team notes
    const user = await requireAuthAPI([UserRole.ADMIN])

    const { content } = await req.json()

    if (typeof content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 })
    }

    // Get existing notes or create new
    let teamNotes = await prisma.teamNotes.findFirst()

    if (teamNotes) {
      // Update existing
      teamNotes = await prisma.teamNotes.update({
        where: { id: teamNotes.id },
        data: {
          content,
          updatedBy: user.id,
        },
      })
    } else {
      // Create new
      teamNotes = await prisma.teamNotes.create({
        data: {
          content,
          updatedBy: user.id,
        },
      })
    }

    return NextResponse.json(teamNotes)
  } catch (error) {
    logger.error("Failed to update team notes:", error)
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
