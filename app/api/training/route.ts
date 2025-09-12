import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/database"
import { PermissionService, Permission, UserRole } from "@/lib/permissions"

export async function GET() {
  try {
    const resources = await prisma.trainingVideo.findMany({
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

    return NextResponse.json(resources)
  } catch (error) {
    console.error('Error fetching training resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch training resources' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

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
      category, 
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
    if (!title || !contentType || !category) {
      return NextResponse.json(
        { error: 'Title, content type, and category are required' },
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

    // For now, store everything as a training video until migration is complete
    const resource = await prisma.trainingVideo.create({
      data: {
        title,
        description: description || `${contentType} content: ${title}`,
        videoUrl: videoUrl || fileUrl || '#',
        category,
        isPublic: isPublic || false,
        createdBy: user.id
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
    console.error('Error creating training resource:', error)
    return NextResponse.json(
      { error: 'Failed to create training resource' },
      { status: 500 }
    )
  }
}
