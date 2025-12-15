import { NextResponse, type NextRequest } from "next/server"
import { UserRole } from "@/lib/permissions"
import { authenticateAdminRequest } from "@/lib/auth-server"
import { z } from "zod"
import { validateInput, createErrorResponse, sanitizeString } from "@/lib/validation-schemas"
import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limiter"
import { handleApiError } from "@/lib/error-handler"

const resourceSchema = z.object({
  name: z.string().min(2).max(100).transform(sanitizeString),
  url: z.string().url().max(2048),
  description: z.string().min(1).max(500).transform(sanitizeString).nullable().optional(),
  icon: z.string().max(2048).nullable().optional(),
  categoryId: z.string().min(1).nullable().optional(),
});

const resourceUpdateSchema = resourceSchema.partial().extend({ id: z.string() });

export async function GET(req: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.ADMIN)
    if (rateLimitResult) return rateLimitResult

    const { user, response } = await authenticateAdminRequest(req.headers);
    
    if (response) {
      return response;
    }
    
    const resources = await prisma.resource.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        description: true,
        icon: true,
        categoryId: true,
        status: true,
        clicks: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        },
        creator: {
          select: {
            name: true,
            username: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    return NextResponse.json(resources);
  } catch (error) {
    logger.error("[ADMIN_RESOURCES_GET]", error);
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.ADMIN)
    if (rateLimitResult) return rateLimitResult

    const { user, response } = await authenticateAdminRequest();
    
    if (response) {
      return response;
    }

    const body = await req.json();
    const validation = validateInput(resourceSchema, body);
    if (!validation.success) {
      return createErrorResponse(validation.error, 400);
    }
    const resourceData = validation.data;

    // Verify user exists in database before setting createdBy
    let createdById: string | null = null;
    if (user?.id) {
      const userExists = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true }
      });
      if (userExists) {
        createdById = user.id;
      } else {
        logger.warn(`[ADMIN_RESOURCES_POST] Session user ID ${user.id} not found in database`);
      }
    }

    const newResource = await prisma.resource.create({
      data: {
        name: resourceData.name,
        url: resourceData.url,
        description: resourceData.description ?? null,
        icon: resourceData.icon ?? null,
        categoryId: resourceData.categoryId ?? null,
        status: "active",
        clicks: 0,
        createdBy: createdById,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        },
        creator: {
          select: {
            name: true,
            username: true,
          }
        }
      }
    });

    return NextResponse.json(newResource, { status: 201 });

  } catch (error) {
    logger.error("[ADMIN_RESOURCES_POST]", error);
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.ADMIN)
    if (rateLimitResult) return rateLimitResult

    const { user, response } = await authenticateAdminRequest();
    if (response) {
      return response;
    }
    if (user.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const resourcesToUpdate = z.array(resourceUpdateSchema).parse(body);

    // Update resources in database
    const updatePromises = resourcesToUpdate.map(async (update) => {
      const { id, ...data } = update;
      
      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );

      return await prisma.resource.update({
        where: { id },
        data: cleanData,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true
            }
          },
          creator: {
            select: {
              name: true,
              username: true,
            }
          }
        }
      });
    });

    const updatedResources = await Promise.all(updatePromises);
    return NextResponse.json(updatedResources);

  } catch (error) {
    logger.error("[ADMIN_RESOURCES_PATCH]", error);
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.ADMIN)
    if (rateLimitResult) return rateLimitResult

    const { user, response } = await authenticateAdminRequest();
    if (response) {
      return response;
    }
    if (user.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const idsSchema = z.object({ ids: z.array(z.string().min(1)) });
    const { ids } = idsSchema.parse(body);

    if (!ids.length) {
      return new NextResponse("No resource IDs provided", { status: 400 });
    }

    // Delete resources from database
    const result = await prisma.resource.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    return NextResponse.json({ deletedCount: result.count });

  } catch (error) {
    logger.error("[ADMIN_RESOURCES_DELETE]", error);
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
