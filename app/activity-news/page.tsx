import { prisma } from "@/lib/prisma"
import { ActivityNewsPublic } from "@/components/activity-news-public"

export default async function ActivityNewsPage() {
  // Fetch active public announcements
  const announcements = await prisma.announcement.findMany({
    where: {
      isPublic: true,
      status: "active",
      date: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today or future
      },
    },
    orderBy: {
      date: "asc",
    },
    include: {
      creator: {
        select: {
          name: true,
        },
      },
    },
  })

  return <ActivityNewsPublic initialAnnouncements={announcements} />
}
