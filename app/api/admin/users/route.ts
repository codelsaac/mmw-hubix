import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { UserRole } from "@/lib/permissions"
import { z } from "zod"
import { validateInput, createErrorResponse, createSuccessResponse, sanitizeString } from "@/lib/validation-schemas"
import { logger } from "@/lib/logger"
import { prisma } from "@/lib/prisma"

const userSchema = z.object({
  username: z.string().min(2).max(50).transform(sanitizeString),
  name: z.string().min(2).max(100).transform(sanitizeString),
  email: z.string().email().max(255).optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["ADMIN", "HELPER", "GUEST"]),
  department: z.string().min(1).max(100).transform(sanitizeString).optional(),
  isActive: z.boolean().optional().default(true),
});

const userUpdateSchema = userSchema.partial().extend({ id: z.string() });

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    
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
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== UserRole.ADMIN) {
      return createErrorResponse("Unauthorized", 403);
    }

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
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const usersToUpdate = z.array(userUpdateSchema).parse(body);

    // Update users in database
    const updatePromises = usersToUpdate.map(async (update) => {
      const { id, ...data } = update;
      
      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );

      return await prisma.user.update({
        where: { id },
        data: cleanData,
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

    const updatedUsers = await Promise.all(updatePromises);
    return NextResponse.json(updatedUsers);

  } catch (error) {
    logger.error("[ADMIN_USERS_PATCH]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const idsSchema = z.object({ ids: z.array(z.string().min(1)) });
    const { ids } = idsSchema.parse(body);

    if (!ids.length) {
      return new NextResponse("No user IDs provided", { status: 400 });
    }

    // Prevent deleting the current user
    if (session.user.id && ids.includes(session.user.id)) {
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
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}