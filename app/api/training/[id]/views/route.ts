import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limiter"
import { handleApiError } from "@/lib/error-handler"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.GENERAL)
    if (rateLimitResult) return rateLimitResult

    const resourceId = params.id

    // Increment views
    const resource = await prisma.trainingResource.update({
      where: { id: resourceId },
      data: {
        views: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ success: true, views: resource.views })
  } catch (error) {
    logger.error('Error updating resource views:', error)
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
