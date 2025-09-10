import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { AnnouncementDB, ResourceDB, UserDB } from '@/lib/database'

// GET /api/admin/recent-activity - Get recent admin activity
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch recent data
    const [recentAnnouncements, recentResources, recentUsers] = await Promise.all([
      AnnouncementDB.getAllAnnouncements(),
      ResourceDB.getAllResources(),
      UserDB.getAllUsers()
    ])

    // Format recent activity
    const activities = []

    // Add recent announcements
    recentAnnouncements.slice(0, 3).forEach(announcement => {
      activities.push({
        id: `announcement-${announcement.id}`,
        type: 'announcement',
        title: 'Announcement Updated',
        description: announcement.title,
        user: announcement.creator?.name || 'Unknown',
        time: formatTimeAgo(announcement.updatedAt || announcement.createdAt),
        status: announcement.status === 'active' ? 'published' : 'draft'
      })
    })

    // Add recent resources
    recentResources.slice(0, 2).forEach(resource => {
      activities.push({
        id: `resource-${resource.id}`,
        type: 'resource',
        title: 'Resource Updated',
        description: resource.name,
        user: resource.creator?.name || 'Unknown',
        time: formatTimeAgo(resource.updatedAt || resource.createdAt),
        status: resource.status === 'active' ? 'completed' : 'draft'
      })
    })

    // Add recent users
    recentUsers.slice(0, 2).forEach(user => {
      activities.push({
        id: `user-${user.id}`,
        type: 'user',
        title: 'User Activity',
        description: `${user.name} (${user.role})`,
        user: 'System',
        time: formatTimeAgo(user.createdAt),
        status: 'completed'
      })
    })

    // Sort by time and return top 5
    return NextResponse.json(activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5))
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json({ error: 'Failed to fetch recent activity' }, { status: 500 })
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return `${Math.floor(diffInSeconds / 2592000)} months ago`
}