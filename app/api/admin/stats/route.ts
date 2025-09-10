import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { AnnouncementDB, ResourceDB, UserDB, TrainingVideoDB } from '@/lib/database'

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all data in parallel for better performance
    const [announcements, resources, users, trainingVideos] = await Promise.all([
      AnnouncementDB.getAllAnnouncements(),
      ResourceDB.getAllResources(),
      UserDB.getITPrefectMembers(),
      TrainingVideoDB.getPublicVideos()
    ])

    // Calculate statistics
    const stats = {
      announcements: {
        total: announcements.length,
        published: announcements.filter(a => a.status === 'active').length,
        pending: announcements.filter(a => a.status === 'draft').length
      },
      resources: {
        total: resources.length,
        active: resources.filter(r => r.status === 'active').length
      },
      users: {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        prefects: users.filter(u => u.role === 'prefect').length
      },
      trainingVideos: {
        total: trainingVideos.length,
        active: trainingVideos.filter(v => v.status === 'active').length
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Failed to fetch admin statistics' }, { status: 500 })
  }
}