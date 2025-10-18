import { NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth-server"
import { UserRole } from "@/lib/permissions"
import { getAllSettings, updateSettings, initializeSettings } from "@/lib/settings-service"
import { logger } from "@/lib/logger"

/**
 * GET /api/admin/settings
 * Get all settings (admin only)
 */
export async function GET(req: Request) {
  try {
    await requireAuthAPI([UserRole.ADMIN])
    
    // Initialize settings if needed
    await initializeSettings()
    
    // Get all settings including private ones
    const settings = await getAllSettings(true)
    
    return NextResponse.json(settings)
  } catch (error) {
    logger.error("Failed to get settings:", error)
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }
    
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/settings
 * Update multiple settings (admin only)
 */
export async function PUT(req: Request) {
  try {
    await requireAuthAPI([UserRole.ADMIN])
    
    const body = await req.json()
    
    // Validate input
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid settings data" },
        { status: 400 }
      )
    }
    
    // Update settings
    await updateSettings(body)
    
    // Return updated settings
    const updatedSettings = await getAllSettings(true)
    
    return NextResponse.json(updatedSettings)
  } catch (error) {
    logger.error("Failed to update settings:", error)
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }
    
    if (error instanceof Error && error.message === "Insufficient permissions") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}
