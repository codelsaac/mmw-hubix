import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PermissionService, Permission, UserRole } from "@/lib/permissions"
import { authenticateRequest } from "@/lib/auth-server"
import { logger } from "@/lib/logger"
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limiter"
import { handleApiError } from "@/lib/error-handler"
export async function GET(req: NextRequest) {
  try {
    // Use GENERAL rate limit for training resources (frequently accessed)
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.GENERAL)
    if (rateLimitResult) return rateLimitResult

    const resources = await prisma.trainingResource.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Parse tags from JSON strings
    const processedResources = resources.map(resource => ({
      ...resource,
      tags: resource.tags ? JSON.parse(resource.tags) : []
    }))

    return NextResponse.json(processedResources)
  } catch (error) {
    logger.error('Error fetching training resources:', error)
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.AUTH)
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

    const body = await request.json()
    const { 
      title, 
      description, 
      contentType, 
      tags, 
      difficulty,
      videoUrl,
      textContent,
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      isPublic 
    } = body

    // Validate required fields
    if (!title || !contentType) {
      return NextResponse.json(
        { error: 'Title and content type are required' },
        { status: 400 }
      )
    }

    // Validate content type specific fields
    if (contentType === 'VIDEO' && !videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required for video content' },
        { status: 400 }
      )
    }

    if (contentType === 'TEXT' && !textContent) {
      return NextResponse.json(
        { error: 'Text content is required for text content' },
        { status: 400 }
      )
    }

    if (contentType === 'FILE' && (!fileName || !fileUrl)) {
      return NextResponse.json(
        { error: 'File name and URL are required for file content' },
        { status: 400 }
      )
    }

    // Process tags - convert array to JSON string if needed
    let processedTags = null
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = JSON.stringify(tags)
      } else if (typeof tags === 'string') {
        processedTags = tags
      }
    }

    const resource = await prisma.trainingResource.create({
      data: {
        title,
        description: description || `${contentType} content: ${title}`,
        contentType,
        tags: processedTags,
        difficulty,
        videoUrl,
        textContent,
        fileName,
        fileUrl,
        fileSize,
        mimeType,
        isPublic: isPublic || false,
        createdBy: user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Parse tags to match GET response format
    const processedResource = {
      ...resource,
      tags: resource.tags ? JSON.parse(resource.tags) : []
    }

    return NextResponse.json(processedResource, { status: 201 })
  } catch (error) {
    logger.error('Error creating training resource:', error)
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
