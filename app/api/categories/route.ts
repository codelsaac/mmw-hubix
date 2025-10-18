import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

/**
 * GET /api/categories
 * Get all active categories (public endpoint - no authentication required)
 */
export async function GET() {
  try {
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
    logger.error("[CATEGORIES_GET]", error)
    // Return empty array on error to prevent breaking the homepage
    return NextResponse.json([])
  }
}
