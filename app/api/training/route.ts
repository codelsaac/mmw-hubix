import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PermissionService, Permission, UserRole } from "@/lib/permissions"

import { logger } from "@/lib/logger"
export async function GET() {
  try {
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
    return NextResponse.json(
      { error: 'Failed to fetch training resources' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Ensure the user exists in the database first (upsert pattern)
    const user = await prisma.user.upsert({
      where: { id: session.user.id },
      update: {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role as UserRole,
        department: session.user.department,
      },
      create: {
        id: session.user.id,
        username: session.user.username || session.user.email?.split('@')[0] || 'user',
        name: session.user.name || 'User',
        email: session.user.email,
        role: (session.user.role as UserRole) || UserRole.GUEST,
        department: session.user.department || 'General',
      }
    })

    // Check permissions
    if (!PermissionService.hasPermission(user.role as UserRole, Permission.MANAGE_TRAINING_VIDEOS)) {
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

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    logger.error('Error creating training resource:', error)
    return NextResponse.json(
      { error: 'Failed to create training resource' },
      { status: 500 }
    )
  }
}
