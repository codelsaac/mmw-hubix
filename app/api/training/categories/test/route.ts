import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    logger.log('Test endpoint called')
    return NextResponse.json({ 
      success: true, 
      message: 'Categories API is working',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Test endpoint error:', error)
    return NextResponse.json(
      { error: 'Test endpoint failed' },
      { status: 500 }
    )
  }
}
