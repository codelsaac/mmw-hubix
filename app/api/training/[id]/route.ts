import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PermissionService, Permission } from "@/lib/permissions"
import { authenticateRequest } from "@/lib/auth-server"
import { logger } from "@/lib/logger"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limiter"
import { handleApiError } from "@/lib/error-handler"
import { unlink } from 'fs/promises'
import path from 'path'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.AUTH)
    if (rateLimitResult) return rateLimitResult

    const { user, response } = await authenticateRequest()
    
    if (response) {
      return response
    }

    // Check permissions
    if (!PermissionService.hasPermission(user.role, Permission.MANAGE_TRAINING_VIDEOS)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const resourceId = (await params).id

    // Get the resource first to check if it has a file to delete
    const resource = await prisma.trainingResource.findUnique({
      where: { id: resourceId }
    })

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    // Delete the resource from database
    await prisma.trainingResource.delete({
      where: { id: resourceId }
    })

    // If it's a file resource, try to delete the physical file
    if (resource.contentType === 'FILE' && resource.fileUrl) {
      try {
        // Extract file path from URL (e.g., /uploads/documents/file.pdf)
        const filePath = path.join(process.cwd(), 'public', resource.fileUrl)
        await unlink(filePath)
        logger.log(`Deleted file: ${filePath}`)
      } catch (fileError) {
        // Log error but don't fail the request if file deletion fails
        logger.error('Error deleting file:', fileError)
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Resource deleted successfully' 
    })
  } catch (error) {
    logger.error('Error deleting training resource:', error)
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

