import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { AnnouncementDB, PublicCalendarDB, ActivityDB, TrainingVideoDB } from '@/lib/database'

// POST /api/test/storage - Test various storage functions
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow authenticated users to test storage
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { testType } = await request.json()
    const results: any = {}

    switch (testType) {
      case 'announcement':
        try {
          // Test announcement creation
          const announcement = await AnnouncementDB.createAnnouncement({
            title: `Test Announcement ${Date.now()}`,
            club: 'IT Club',
            date: new Date(),
            time: '14:30',
            location: 'Test Room',
            description: 'This is a test announcement',
            maxAttendees: 50,
            type: 'Workshop',
            isPublic: true,
            createdBy: session.user.id
          })
          results.announcement = { success: true, id: announcement.id, title: announcement.title }
        } catch (err) {
          results.announcement = { success: false, error: (err as Error).message }
        }
        break

      case 'calendar':
        try {
          // Test calendar event creation
          const event = await PublicCalendarDB.createPublicEvent({
            title: `Test Event ${Date.now()}`,
            description: 'This is a test event',
            startTime: new Date(),
            endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
            location: 'Test Location',
            eventType: 'general',
            isVisible: true,
            createdBy: session.user.id
          })
          results.calendar = { success: true, id: event.id, title: event.title }
        } catch (err) {
          results.calendar = { success: false, error: (err as Error).message }
        }
        break

      case 'activity':
        try {
          // Test activity creation
          const activity = await ActivityDB.createActivity({
            type: 'system',
            title: `Test Activity ${Date.now()}`,
            description: 'This is a test activity',
            status: 'new',
            priority: 'medium',
            createdBy: session.user.id
          })
          results.activity = { success: true, id: activity.id, title: activity.title }
        } catch (err) {
          results.activity = { success: false, error: (err as Error).message }
        }
        break

      case 'video':
        try {
          // Test training video creation
          const video = await TrainingVideoDB.createTrainingVideo({
            title: `Test Video ${Date.now()}`,
            description: 'This is a test training video',
            videoUrl: 'https://example.com/test-video.mp4',
            category: 'Testing',
            duration: 30,
            isPublic: false,
            createdBy: session.user.id
          })
          results.video = { success: true, id: video.id, title: video.title }
        } catch (err) {
          results.video = { success: false, error: (err as Error).message }
        }
        break

      case 'all':
        // Test all storage functions
        const tests = ['announcement', 'calendar', 'activity', 'video']
        for (const test of tests) {
          const response = await fetch(`${request.url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ testType: test })
          })
          const result = await response.json()
          results[test] = result[test]
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid test type' }, { status: 400 })
    }

    return NextResponse.json({
      testType,
      timestamp: new Date().toISOString(),
      user: session.user.email,
      results
    })

  } catch (error) {
    console.error('Error testing storage:', error)
    return NextResponse.json({ error: 'Storage test failed' }, { status: 500 })
  }
}
