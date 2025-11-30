import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limiter"
import { handleApiError } from "@/lib/error-handler"

/**
 * GET /api/categories
 * Get all active categories (public endpoint - no authentication required)
 */
export async function GET(req: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.GENERAL)
    if (rateLimitResult) return rateLimitResult

    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        color: true,
        sortOrder: true,
        _count: {
          select: {
            resources: {
              where: {
                status: "active"
              }
            }
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    })
    
    return NextResponse.json(categories)
  } catch (error) {
    const { message, statusCode } = handleApiError(error)
    
    // Suppress connection error noise
    if (message.includes("Can't reach database server") || message.includes("P1001")) {
       logger.warn("Database unreachable - returning 503 Service Unavailable");
       return NextResponse.json({ error: "Database unreachable" }, { status: 503 });
    }

    logger.error("[CATEGORIES_GET]", error)

    // Return empty array on client errors to prevent breaking the homepage
    if (statusCode >= 400 && statusCode < 500) {
      return NextResponse.json([])
    }
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
