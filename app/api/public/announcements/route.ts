import { NextResponse } from 'next/server'
import { AnnouncementDB } from '@/lib/database'

// GET /api/public/announcements - Get all public announcements for students
export async function GET() {
  try {
    const announcements = await AnnouncementDB.getPublicAnnouncements()
    return NextResponse.json(announcements)
  } catch (error) {
    console.error('Error fetching public announcements:', error)
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }
}
