import { NextResponse } from "next/server"
import { getAllSettings, getSetting } from "@/lib/settings-service"

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
    console.error("Failed to get public settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}
