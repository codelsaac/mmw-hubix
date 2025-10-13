import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

/**
 * GET /api/resources
 * Get all active resources (public endpoint - no authentication required)
 */
export async function GET(req: Request) {
  try {
    const resources = await prisma.resource.findMany({
      where: {
        status: "active"
      },
      select: {
        id: true,
        name: true,
        url: true,
        description: true,
        category: true,
        status: true,
        clicks: true,
        updatedAt: true,
      },
      orderBy: {
        category: 'asc'
      }
    })
    
    // Transform to match the expected Resource interface
    const transformedResources = resources.map(resource => ({
      id: parseInt(resource.id, 36) || 0, // Convert cuid to number
      name: resource.name,
      url: resource.url,
      description: resource.description,
      category: resource.category,
      status: resource.status as "active" | "maintenance" | "inactive",
      clicks: resource.clicks,
      lastUpdated: new Date(resource.updatedAt).toISOString().split("T")[0]
    }))
    
    return NextResponse.json(transformedResources)
  } catch (error) {
    logger.error("[RESOURCES_GET]", error)
    // Return empty array on error to prevent breaking the homepage
    return NextResponse.json([])
  }
}

/**
 * POST /api/resources/[id]/click
 * Increment click count for a resource
 */
export async function POST(req: Request) {
  try {
    const { id } = await req.json()
    
    if (!id) {
      return NextResponse.json({ error: "Resource ID required" }, { status: 400 })
    }
    
    await prisma.resource.update({
      where: { id },
      data: {
        clicks: {
          increment: 1
        }
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("[RESOURCES_CLICK]", error)
    return NextResponse.json({ error: "Failed to update click count" }, { status: 500 })
  }
}
