import { NextResponse } from 'next/server'
import { AnnouncementDB } from '@/lib/database'

import { logger } from "@/lib/logger"
// GET /api/public/announcements - Get all public announcements for students
export async function GET() {
  try {
    const announcements = await AnnouncementDB.getPublicAnnouncements()
    return NextResponse.json(announcements)
  } catch (error) {
    logger.error('Error fetching public announcements:', error)
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }
}
