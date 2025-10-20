import { NextRequest, NextResponse } from 'next/server'
import { PublicCalendarDB } from '@/lib/database'
import { logger } from "@/lib/logger"
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limiter'
import { handleApiError } from '@/lib/error-handler'
// GET /api/public/calendar - Get all public calendar events for students
export async function GET(req: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.GENERAL)
    if (rateLimitResult) return rateLimitResult

    const events = await PublicCalendarDB.getPublicEvents()
    return NextResponse.json(events)
  } catch (error) {
    logger.error('Error fetching public calendar events:', error)
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
