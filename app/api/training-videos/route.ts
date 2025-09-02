import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { TrainingVideoDB, prisma } from '@/lib/database'

// GET /api/training-videos - Get training videos (public or all based on user)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    let videos
    if (session?.user && (session.user.role === 'admin' || session.user.department === 'IT')) {
      // IT Prefects and Admins can see all videos
      videos = await TrainingVideoDB.getAllVideos()
    } else {
      // Public users can only see public videos
      videos = await TrainingVideoDB.getPublicVideos()
    }

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching training videos:', error)
    return NextResponse.json({ error: 'Failed to fetch training videos' }, { status: 500 })
  }
}

// POST /api/training-videos - Create new training video (IT Prefects and Admins only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow authenticated IT Prefects and Admins to create videos
    if (!session?.user || (session.user.role !== 'admin' && session.user.department !== 'IT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Check if this is a public video
    const isPublicVideo = data.isPublic === true

    // Only admins can create public videos
    if (isPublicVideo && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Only admins can create public videos' }, { status: 401 })
    }

    // Ensure the user exists in the database first
    await prisma.user.upsert({
      where: { id: session.user.id },
      update: {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        department: session.user.department,
      },
      create: {
        id: session.user.id,
        name: session.user.name || 'IT Prefect',
        email: session.user.email,
        role: session.user.role || 'user',
        department: session.user.department || 'IT',
      }
    })

    const video = await TrainingVideoDB.createTrainingVideo({
      title: data.title,
      description: data.description,
      videoUrl: data.videoUrl,
      category: data.category,
      duration: data.duration,
      isPublic: data.isPublic ?? false,
      createdBy: session.user.id
    })

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error('Error creating training video:', error)
    return NextResponse.json({ error: 'Failed to create training video' }, { status: 500 })
  }
}
