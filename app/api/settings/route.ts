import { NextResponse } from "next/server"
import { getAllSettings } from "@/lib/settings-service"

/**
 * GET /api/settings
 * Get public settings (no authentication required)
 */
export async function GET(req: Request) {
  try {
    // Get only public settings
    const settings = await getAllSettings(false)
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Failed to get public settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}
