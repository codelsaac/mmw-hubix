import { NextResponse, type NextRequest } from "next/server"
import { teamMembers } from "@/lib/team-data"
import { auth } from "@/auth"
import { UserRole } from "@/lib/permissions"
import { z } from "zod"
import { validateInput, createErrorResponse, createSuccessResponse, sanitizeString } from "@/lib/validation"
import { logger } from "@/lib/logger"
import { withDatabaseLock } from "@/lib/database-lock"

// In-memory store for demonstration purposes
let users = [...teamMembers];

const userSchema = z.object({
  name: z.string().min(2).max(100).transform(sanitizeString),
  email: z.string().email().max(255),
  role: z.enum(["ADMIN", "HELPER", "GUEST"]),
  department: z.string().min(1).max(100).transform(sanitizeString),
  isActive: z.boolean(),
});

const userUpdateSchema = userSchema.partial().extend({ id: z.string() });

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    // Map status to role for consistency
    const formattedUsers = users.map((user: any) => ({
      ...user,
      role: (user.status || user.role) as "ADMIN" | "HELPER" | "GUEST"
    }));
    return NextResponse.json(formattedUsers);
  } catch (error) {
    logger.error("[ADMIN_USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== UserRole.ADMIN) {
      return createErrorResponse("Unauthorized", 403);
    }

    const body = await req.json();
    const validation = validateInput(userSchema, body);
    if (!validation.success) {
      return createErrorResponse(validation.error, 400);
    }
    const newUserData = validation.data;

    // Use database lock to prevent race conditions
    const result = await withDatabaseLock('users', async () => {
      const newUser = {
        ...newUserData,
        id: String(users.length + 1),
        lastLoginAt: new Date().toISOString(),
        avatar: "/abstract-profile.png",
        phone: "",
        specialties: [],
        status: newUserData.role,
      };

      users.push(newUser);
      return newUser;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    logger.error("[ADMIN_USERS_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const usersToUpdate = z.array(userUpdateSchema).parse(body);

    usersToUpdate.forEach(update => {
      const index = users.findIndex(u => u.id === update.id);
      if (index !== -1) {
        const existingUser = users[index];
        users[index] = { ...existingUser, ...update };
      }
    });

    return NextResponse.json(usersToUpdate);

  } catch (error) {
    logger.error("[ADMIN_USERS_PATCH]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const idsSchema = z.object({ ids: z.array(z.string().min(1)) });
    const { ids } = idsSchema.parse(body);

    if (!ids.length) {
      return new NextResponse("No user IDs provided", { status: 400 });
    }

    const initialLength = users.length;
    users = users.filter(u => !ids.includes(u.id));
    const deletedCount = initialLength - users.length;

    return NextResponse.json({ deletedCount });

  } catch (error) {
    logger.error("[ADMIN_USERS_DELETE]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}