import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { logger } from "@/lib/logger"

const notificationSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  type: z.enum(["INFO", "SUCCESS", "WARNING", "ERROR", "ANNOUNCEMENT", "SYSTEM"]).default("INFO"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  link: z.string().url().optional(),
  metadata: z.string().optional(),
  userId: z.string().optional(), // If null, it's a system-wide notification
});

// GET /api/notifications - Get user's notifications
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: session.user.id }, // User-specific notifications
          { userId: null }, // System-wide notifications
        ],
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    logger.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/notifications - Create notification (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const validatedData = notificationSchema.parse(body);

    const notification = await prisma.notification.create({
      data: validatedData,
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    logger.error("[NOTIFICATIONS_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
      // Mark all user's notifications as read
      await prisma.notification.updateMany({
        where: {
          OR: [
            { userId: session.user.id },
            { userId: null },
          ],
          isRead: false,
        },
        data: {
          isRead: true,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          OR: [
            { userId: session.user.id },
            { userId: null },
          ],
        },
        data: {
          isRead: true,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, count: notificationIds.length });
    }

    return new NextResponse("Invalid request", { status: 400 });
  } catch (error) {
    logger.error("[NOTIFICATIONS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { notificationIds, deleteAll } = body;

    if (deleteAll) {
      // Delete all read notifications for user
      const result = await prisma.notification.deleteMany({
        where: {
          OR: [
            { userId: session.user.id },
            { userId: null },
          ],
          isRead: true,
        },
      });

      return NextResponse.json({ success: true, deletedCount: result.count });
    }

    if (notificationIds && Array.isArray(notificationIds)) {
      // Delete specific notifications
      const result = await prisma.notification.deleteMany({
        where: {
          id: { in: notificationIds },
          OR: [
            { userId: session.user.id },
            { userId: null },
          ],
        },
      });

      return NextResponse.json({ success: true, deletedCount: result.count });
    }

    return new NextResponse("Invalid request", { status: 400 });
  } catch (error) {
    logger.error("[NOTIFICATIONS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
