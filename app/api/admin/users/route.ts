import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { z } from "zod";

const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== 'admin') {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const users = await db.user.findMany({
      // Select all fields except password
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[ADMIN_USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== 'admin') {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const usersToUpdate = z.array(userUpdateSchema).parse(body);

    const updatedUsers = await db.$transaction(
      usersToUpdate.map((user) =>
        db.user.update({
          where: { id: user.id },
          data: {
            name: user.name,
            email: user.email,
            role: user.role,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            updatedAt: true,
          },
        })
      )
    );

    return NextResponse.json(updatedUsers);
  } catch (error) {
    console.error("[ADMIN_USERS_PATCH]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}