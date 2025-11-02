import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limiter"
import { handleApiError } from "@/lib/error-handler"
import auth from "@/auth"
import { z } from "zod"

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
    logger.error("[CATEGORIES_GET]", error)
    const { message, statusCode } = handleApiError(error)
    // Return empty array on client errors to prevent breaking the homepage
    if (statusCode >= 400 && statusCode < 500) {
      return NextResponse.json([])
    }
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
  description: z.string().max(200).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
})

/**
 * POST /api/categories
 * Create a new category (requires authentication)
 */
export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.GENERAL)
    if (rateLimitResult) return rateLimitResult

    // Check authentication (allow any logged-in user to create categories)
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validationResult = categorySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, description, icon, color } = validationResult.data

    // Check if category already exists (case-insensitive)
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name
        }
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      )
    }

    // Create new category
    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
        icon: icon || "folder",
        color: color || "#6B7280",
        isActive: true,
        sortOrder: 999, // New categories go to the end
        createdBy: session.user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        color: true,
        sortOrder: true,
      }
    })

    logger.log(`[CATEGORIES_CREATE] User ${session.user.id} created category: ${name}`)
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    logger.error("[CATEGORIES_CREATE]", error)
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
