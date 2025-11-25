import { NextRequest, NextResponse } from "next/server"
import { ResourceService } from "@/lib/services/resource.service"
import { createRequestLogger } from "@/lib/logging/logger"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limiter"
import { handleApiError } from "@/lib/error-handler"

/**
 * GET /api/resources
 * Get all active resources (public endpoint - no authentication required)
 */
export async function GET(req: NextRequest) {
  const logger = createRequestLogger(req);
  
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.GENERAL);
    if (rateLimitResult) return rateLimitResult;

    const resourceService = new ResourceService();
    const resources = await resourceService.getAllResources();

    logger.info('Resources fetched successfully', { count: resources.length });
    
    // Transform to match the expected Resource interface
    const transformedResources = resources.map(resource => ({
      id: resource.id,
      name: resource.name,
      url: resource.url,
      description: resource.description || "",
      category: resource.category?.name || "Uncategorized",
      categoryId: resource.category?.id || "",
      categoryIcon: resource.category?.icon || "globe",
      categoryColor: resource.category?.color || "#6B7280",
      status: resource.status as "active" | "maintenance" | "inactive",
      clicks: resource.clicks,
      lastUpdated: new Date(resource.updatedAt).toISOString().split("T")[0],
      icon: resource.icon || null,
    }));
    
    return NextResponse.json(transformedResources);
  } catch (error) {
    logger.error("Error fetching resources", error as Error);
    const { message, statusCode } = handleApiError(error);
    // Return empty array on client errors to prevent breaking the homepage
    if (statusCode >= 400 && statusCode < 500) {
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

/**
 * POST /api/resources/[id]/click
 * Increment click count for a resource
 */
export async function POST(req: NextRequest) {
  const logger = createRequestLogger(req);
  
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.GENERAL);
    if (rateLimitResult) return rateLimitResult;

    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: "Resource ID required" }, { status: 400 });
    }
    
    const resourceService = new ResourceService();
    await resourceService.trackClick(id);
    
    logger.info('Resource click tracked', { resourceId: id });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error tracking resource click", error as Error);
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
