import { NextResponse, type NextRequest } from "next/server"
import { authenticateAdminRequest } from "@/lib/auth-server"
import { UserRole } from "@/lib/permissions"
import { z } from "zod"
import { createErrorResponse, sanitizeString } from "@/lib/validation-schemas"
import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"

const categorySchema = z.object({
  name: z.string().min(1).max(100).transform(sanitizeString),
  description: z.string().max(500).transform(sanitizeString).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

const categoryUpdateSchema = categorySchema.partial().extend({ id: z.string() });

export async function GET(req: NextRequest) {
  try {
    const { user, response } = await authenticateAdminRequest(req.headers);
    
    if (response) {
      return response;
    }
    
    const categories = await prisma.category.findMany({
      include: {
        creator: {
          select: {
            name: true,
            username: true,
          }
        },
        _count: {
          select: {
            resources: true
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    logger.error("[ADMIN_CATEGORIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, response } = await authenticateAdminRequest(req.headers);
    
    if (response) {
      return response;
    }

    const body = await req.json();
    
    // Validate input
    const categoryData = categorySchema.parse(body);

    // Verify user exists in database before setting createdBy
    let createdById: string | null = null;
    if (user.id) {
      const userExists = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true }
      });
      if (userExists) {
        createdById = user.id;
      } else {
        logger.warn(`[ADMIN_CATEGORIES_POST] Session user ID ${user.id} not found in database`);
      }
    }

    const newCategory = await prisma.category.create({
      data: {
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon,
        color: categoryData.color,
        isActive: categoryData.isActive,
        sortOrder: categoryData.sortOrder,
        createdBy: createdById,
      },
      include: {
        creator: {
          select: {
            name: true,
            username: true,
          }
        },
        _count: {
          select: {
            resources: true
          }
        }
      }
    });

    return NextResponse.json(newCategory, { status: 201 });

  } catch (error) {
    logger.error("[ADMIN_CATEGORIES_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, response } = await authenticateAdminRequest(req.headers);
    
    if (response) {
      return response;
    }

    const body = await req.json();
    const categoriesToUpdate = z.array(categoryUpdateSchema).parse(body);

    // Update categories in database
    const updatePromises = categoriesToUpdate.map(async (update) => {
      const { id, ...data } = update;
      
      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );

      return await prisma.category.update({
        where: { id },
        data: cleanData,
        include: {
          creator: {
            select: {
              name: true,
              username: true,
            }
          },
          _count: {
            select: {
              resources: true
            }
          }
        }
      });
    });

    const updatedCategories = await Promise.all(updatePromises);
    return NextResponse.json(updatedCategories);

  } catch (error) {
    logger.error("[ADMIN_CATEGORIES_PATCH]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user, response } = await authenticateAdminRequest(req.headers);
    
    if (response) {
      return response;
    }

    const body = await req.json();
    const idsSchema = z.object({ ids: z.array(z.string().min(1)) });
    const { ids } = idsSchema.parse(body);

    if (!ids.length) {
      return new NextResponse("No category IDs provided", { status: 400 });
    }

    // Check if any categories have resources
    const categoriesWithResources = await prisma.category.findMany({
      where: {
        id: { in: ids },
        resources: { some: {} }
      },
      select: { id: true, name: true }
    });

    if (categoriesWithResources.length > 0) {
      return new NextResponse(
        `Cannot delete categories with resources: ${categoriesWithResources.map(c => c.name).join(', ')}`, 
        { status: 400 }
      );
    }

    // Delete categories from database
    const result = await prisma.category.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    return NextResponse.json({ deletedCount: result.count });

  } catch (error) {
    logger.error("[ADMIN_CATEGORIES_DELETE]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
