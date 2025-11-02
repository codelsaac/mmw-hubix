import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { UserRole } from "@/lib/permissions"
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
  userId: z.string().optional().nullable(), // If null, system-wide notification
  sendToAll: z.boolean().optional(), // If true, create for all users
  targetType: z.enum(["all", "role", "user", "guests"]).optional(),
  targetRole: z.enum(["ADMIN", "HELPER", "GUEST"]).optional(),
  targetUserId: z.string().optional(),
});

// GET /api/admin/notifications - Get all notifications (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const notifications = await prisma.notification.findMany({
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 100,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    logger.error("[ADMIN_NOTIFICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/admin/notifications - Create notification (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const validatedData = notificationSchema.parse(body);
    const { sendToAll, targetType, targetRole, targetUserId, ...notificationData } = validatedData;

    // Handle different targeting options
    if (targetType === 'all' || sendToAll) {
      // Create a single system-wide notification for all users and guests
      const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true }
      });

      const notification = await prisma.notification.create({
        data: {
          ...notificationData,
          userId: null, // System-wide for all users and guests
          link: notificationData.link || null,
          metadata: JSON.stringify({ 
            ...JSON.parse(notificationData.metadata || '{}'),
            targetType: 'all',
            sentToUsers: users.length,
            sentToGuests: true
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Notification sent to all users and guests`,
        count: 1,
        notification
      }, { status: 201 });
    }

    if (targetType === 'guests') {
      // Create system-wide notification for guests only
      const notification = await prisma.notification.create({
        data: {
          ...notificationData,
          userId: null, // System-wide for guests
          link: notificationData.link || null,
          metadata: JSON.stringify({ 
            ...JSON.parse(notificationData.metadata || '{}'),
            targetType: 'guests',
            sentToGuests: true
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Notification sent to all guests",
        count: 1
      }, { status: 201 });
    }

    if (targetType === 'role' && targetRole) {
      // Create a single system-wide notification for specific role
      const users = await prisma.user.findMany({
        where: { 
          role: targetRole,
          isActive: true 
        },
        select: { id: true }
      });

      const notification = await prisma.notification.create({
        data: {
          ...notificationData,
          userId: null, // System-wide with role targeting
          link: notificationData.link || null,
          metadata: JSON.stringify({ 
            ...JSON.parse(notificationData.metadata || '{}'),
            targetType: 'role',
            targetRole: targetRole,
            sentToUsers: users.length
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Notification sent to ${targetRole} role`,
        count: 1,
        notification
      }, { status: 201 });
    }

    if (targetType === 'user' && targetUserId) {
      // Create notification for specific user
      const notification = await prisma.notification.create({
        data: {
          ...notificationData,
          userId: targetUserId,
          link: notificationData.link || null,
          metadata: JSON.stringify({ 
            ...JSON.parse(notificationData.metadata || '{}'),
            targetType: 'user',
            targetUserId: targetUserId
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Notification sent to user",
        count: 1
      }, { status: 201 });
    }

    // Fallback: Create single notification (legacy support)
    const notification = await prisma.notification.create({
      data: {
        ...notificationData,
        link: notificationData.link || null,
        metadata: notificationData.metadata || null,
        userId: notificationData.userId || null,
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    logger.error("[ADMIN_NOTIFICATIONS_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/admin/notifications - Delete notifications (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const { notificationIds } = body;

    if (notificationIds && Array.isArray(notificationIds)) {
      const result = await prisma.notification.deleteMany({
        where: {
          id: { in: notificationIds },
        },
      });

      return NextResponse.json({ success: true, deletedCount: result.count });
    }

    return new NextResponse("Invalid request", { status: 400 });
  } catch (error) {
    logger.error("[ADMIN_NOTIFICATIONS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
