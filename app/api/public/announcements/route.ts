import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const activityNews = await prisma.activityNews.findMany({
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
    return NextResponse.json(activityNews);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch public activity news" },
      { status: 500 }
    );
  }
}
