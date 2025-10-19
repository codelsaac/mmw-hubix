import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { logger } from "@/lib/logger"
import { requireAuthAPI } from "@/lib/auth-server"
import { UserRole } from "@/lib/permissions"

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
    const user = await requireAuthAPI();

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: user.id }, // User-specific notifications
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
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      if (error.message === "Insufficient permissions") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }
    logger.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/notifications - Create notification (Admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthAPI([UserRole.ADMIN]);

    const body = await req.json();
    const validatedData = notificationSchema.parse(body);

    const notification = await prisma.notification.create({
      data: validatedData,
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      if (error.message === "Insufficient permissions") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }
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
    const user = await requireAuthAPI();

    const body = await req.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
      // Mark all user's notifications as read
      await prisma.notification.updateMany({
        where: {
          OR: [
            { userId: user.id },
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
            { userId: user.id },
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
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      if (error.message === "Insufficient permissions") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }
    logger.error("[NOTIFICATIONS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuthAPI();

    const body = await req.json();
    const { notificationIds, deleteAll } = body;

    if (deleteAll) {
      // Delete all read notifications for user
      const result = await prisma.notification.deleteMany({
        where: {
          OR: [
            { userId: user.id },
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
            { userId: user.id },
            { userId: null },
          ],
        },
      });

      return NextResponse.json({ success: true, deletedCount: result.count });
    }

    return new NextResponse("Invalid request", { status: 400 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      if (error.message === "Insufficient permissions") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }
    logger.error("[NOTIFICATIONS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
