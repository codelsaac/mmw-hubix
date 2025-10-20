import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limiter";
import { handleApiError } from "@/lib/error-handler";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.GENERAL)
    if (rateLimitResult) return rateLimitResult

    const announcements = await prisma.announcement.findMany({
      where: {
        isPublic: true,
        status: "active",
      },
      orderBy: { date: "desc" },
      include: {
        creator: {
          select: {
            name: true,
          },
        },
      },
    });
    return NextResponse.json(announcements);
  } catch (error) {
    logger.error("[PUBLIC_ANNOUNCEMENTS_GET]", error)
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
