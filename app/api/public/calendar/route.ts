import { NextResponse } from 'next/server'
import { PublicCalendarDB } from '@/lib/database'

import { logger } from "@/lib/logger"
// GET /api/public/calendar - Get all public calendar events for students
export async function GET() {
  try {
    const events = await PublicCalendarDB.getPublicEvents()
    return NextResponse.json(events)
  } catch (error) {
    logger.error('Error fetching public calendar events:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 })
  }
}
