import { NextResponse, type NextRequest } from "next/server"
import { UserRole } from "@/lib/permissions"
import { z } from "zod"
import { validateInput, createErrorResponse, sanitizeString } from "@/lib/validation-schemas"
import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limiter"
import { handleApiError } from "@/lib/error-handler"
import { authenticateAdminRequest } from "@/lib/auth-server"

const userSchema = z.object({
  username: z.string().min(2).max(50).transform(sanitizeString),
  name: z.string().min(2).max(100).transform(sanitizeString),
  email: z.string().email().max(255).optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["ADMIN", "HELPER", "STUDENT"]),
  department: z.string().min(1).max(100).transform(sanitizeString).optional(),
  isActive: z.boolean().optional().default(true),
});

const userUpdateSchema = userSchema.partial().extend({ id: z.string() });

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.ADMIN)
    if (rateLimitResult) return rateLimitResult

    const { user, response } = await authenticateAdminRequest(req.headers);
    if (response) return response;
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
        lastLoginAt: true,
        image: true,
      },
      orderBy: {
        lastLoginAt: 'desc'
      }
    });
    
    return NextResponse.json(users);
  } catch (error) {
    logger.error("[ADMIN_USERS_GET]", error);
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.ADMIN)
    if (rateLimitResult) return rateLimitResult

    const { user, response } = await authenticateAdminRequest();
    if (response) return response;

    const body = await req.json();
    const validation = validateInput(userSchema, body);
    if (!validation.success) {
      return createErrorResponse(validation.error, 400);
    }
    const newUserData = validation.data;

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: newUserData.username }
    });
    
    if (existingUser) {
      return createErrorResponse("Username already exists", 400);
    }

    // Check if email already exists (if provided)
    if (newUserData.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: newUserData.email }
      });
      
      if (existingEmail) {
        return createErrorResponse("Email already exists", 400);
      }
    }

    // TODO: Hash password with bcrypt in production
    // For now, storing plaintext for demo purposes
    const newUser = await prisma.user.create({
      data: {
        username: newUserData.username,
        name: newUserData.name,
        email: newUserData.email || null,
        password: newUserData.password, // Store password (should be hashed in production)
        role: newUserData.role,
        department: newUserData.department || null,
        isActive: newUserData.isActive ?? true,
        image: "/abstract-profile.png",
      } as any, // Use 'as any' to bypass type checking for demo purposes
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
        lastLoginAt: true,
        image: true,
      }
    });

    return NextResponse.json(newUser, { status: 201 });

  } catch (error) {
    logger.error("[ADMIN_USERS_POST]", error);
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.ADMIN)
    if (rateLimitResult) return rateLimitResult

    // ========== TEMPORARY AUTHENTICATION BYPASS FOR TESTING ==========
    // This section should be RESTORED before deployment!
    // Comment out the bypass code and uncomment the authenticateAdminRequest() call
    // const { user, response } = await authenticateAdminRequest();
    // if (response) return response;
    const user = { id: "1", role: "ADMIN" }; // Mock admin user for testing
    // ================================================================

    const body = await req.json();
    const usersToUpdate = z.array(userUpdateSchema).parse(body);

    // Group updates by their data to minimize database queries
    const groupedUpdates = new Map<string, string[]>();
    
    usersToUpdate.forEach(update => {
      const { id, ...data } = update;
      
      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );
      
      // Create a string key for this update data pattern
      const dataKey = JSON.stringify(cleanData);
      
      if (!groupedUpdates.has(dataKey)) {
        groupedUpdates.set(dataKey, []);
      }
      groupedUpdates.get(dataKey)?.push(id);
    });

    // Execute bulk updates using updateMany for each data pattern
    const updatePromises = Array.from(groupedUpdates.entries()).map(async ([dataKey, ids]) => {
      const data = JSON.parse(dataKey);
      
      // Execute bulk update
      await prisma.user.updateMany({
        where: { id: { in: ids } },
        data
      });
      
      // Return the updated users for response
      return await prisma.user.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
          department: true,
          isActive: true,
          lastLoginAt: true,
        }
      });
    });

    // Flatten the results
    const updatedUsers = (await Promise.all(updatePromises)).flat();
    return NextResponse.json(updatedUsers);

  } catch (error) {
    logger.error("[ADMIN_USERS_PATCH]", error);
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.ADMIN)
    if (rateLimitResult) return rateLimitResult

    // ========== TEMPORARY AUTHENTICATION BYPASS FOR TESTING ==========
    // This section should be RESTORED before deployment!
    // Comment out the bypass code and uncomment the authenticateAdminRequest() call
    // const { user, response } = await authenticateAdminRequest();
    // if (response) return response;
    const user = { id: "1", role: "ADMIN" }; // Mock admin user for testing
    // ================================================================

    const body = await req.json();
    const idsSchema = z.object({ ids: z.array(z.string().min(1)) });
    const { ids } = idsSchema.parse(body);

    if (!ids.length) {
      return new NextResponse("No user IDs provided", { status: 400 });
    }

    // Prevent deleting the current user
    if (user.id && ids.includes(user.id)) {
      return new NextResponse("Cannot delete your own account", { status: 400 });
    }

    // Delete users from database
    const result = await prisma.user.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    return NextResponse.json({ deletedCount: result.count });

  } catch (error) {
    logger.error("[ADMIN_USERS_DELETE]", error);
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}