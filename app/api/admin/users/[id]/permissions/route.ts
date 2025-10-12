import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuthAPI } from "@/lib/auth-server"
import { UserRole, Permission } from "@/lib/permissions"
import { z } from "zod"

const updatePermissionsSchema = z.object({
  permissions: z.array(z.nativeEnum(Permission)).optional()
})

/**
 * GET /api/admin/users/[id]/permissions
 * Get user's custom permissions
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only admins can view user permissions
    const admin = await requireAuthAPI([UserRole.ADMIN])
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        permissions: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Parse permissions
    let customPermissions: Permission[] = []
    if (user.permissions) {
      try {
        const parsed = JSON.parse(user.permissions)
        if (Array.isArray(parsed)) {
          customPermissions = parsed
        }
      } catch (error) {
        console.error("Error parsing permissions:", error)
      }
    }

    return NextResponse.json({
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      customPermissions
    })
  } catch (error) {
    console.error("Error fetching user permissions:", error)
    return NextResponse.json(
      { error: "Failed to fetch user permissions" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/users/[id]/permissions
 * Update user's custom permissions
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only admins can update user permissions
    const admin = await requireAuthAPI([UserRole.ADMIN])
    const { id } = await params

    const body = await req.json()
    const validation = updatePermissionsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error },
        { status: 400 }
      )
    }

    const { permissions } = validation.data

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Update permissions
    const permissionsString = permissions && permissions.length > 0
      ? JSON.stringify(permissions)
      : null

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { permissions: permissionsString },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        permissions: true
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        role: updatedUser.role,
        permissions: updatedUser.permissions
      }
    })
  } catch (error) {
    console.error("Error updating user permissions:", error)
    return NextResponse.json(
      { error: "Failed to update user permissions" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/users/[id]/permissions
 * Clear user's custom permissions (reset to role defaults)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only admins can delete user permissions
    const admin = await requireAuthAPI([UserRole.ADMIN])
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Clear custom permissions
    await prisma.user.update({
      where: { id },
      data: { permissions: null }
    })

    return NextResponse.json({
      success: true,
      message: "Custom permissions cleared. User now has default role permissions."
    })
  } catch (error) {
    console.error("Error deleting user permissions:", error)
    return NextResponse.json(
      { error: "Failed to delete user permissions" },
      { status: 500 }
    )
  }
}
