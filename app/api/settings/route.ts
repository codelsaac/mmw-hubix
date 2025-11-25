import { NextResponse } from "next/server"
import { getAllSettings, getSetting } from "@/lib/settings-service"
import { logger } from "@/lib/logger"

/**
 * GET /api/settings
 * Get public settings (no authentication required)
 */
export async function GET(req: Request) {
  try {
    // Get only public settings
    const publicSettings = await getAllSettings(false)
    
    // Expose specific non-sensitive flags needed by unauthenticated clients
    // registrationEnabled controls whether the registration button is shown
    const registrationEnabled = await getSetting("registrationEnabled")
    
    return NextResponse.json({
      ...publicSettings,
      registrationEnabled,
    })
  } catch (error) {
    logger.error("Failed to get public settings:", error)
    // Log the specific error for debugging
    if (error instanceof Error) {
      logger.error("Settings error details:", error.message)
    }
    return NextResponse.json(
      { error: "Failed to fetch settings", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
