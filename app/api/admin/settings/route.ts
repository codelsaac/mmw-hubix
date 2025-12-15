import { NextResponse } from "next/server"
import { authenticateAdminRequest } from "@/lib/auth-server"
import { getAllSettings, updateSettings, initializeSettings } from "@/lib/settings-service"
import { SettingsSchemas } from "@/lib/validation-schemas"
import { logger } from "@/lib/logger"

/**
 * GET /api/admin/settings
 * Get all settings (admin only)
 */
export async function GET(req: Request) {
  try {
    const { user, response } = await authenticateAdminRequest(req.headers)
    
    if (response) {
      return response
    }
    
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
    const { user, response } = await authenticateAdminRequest(req.headers)
    
    if (response) {
      return response
    }
    
    const json = await req.json()

    const parsed = SettingsSchemas.update.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid settings data",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      )
    }
    
    // Update settings
    await updateSettings(parsed.data)
    
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
