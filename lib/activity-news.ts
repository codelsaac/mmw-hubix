import { logger } from "@/lib/logger"
export interface ActivityNews {
  id: string
  title: string
  club: string
  date: Date | string
  time: string
  location: string
  description: string
  attendees: number
  maxAttendees: number | null
  type: string
  status: "active" | "cancelled" | "completed"
  isPublic: boolean
  createdBy?: string | null
  createdAt: Date | string
  updatedAt: Date | string
  creator?: {
    id: string
    name: string | null
    email: string | null
  } | null
}

class ActivityNewsService {
  async getActivityNews(): Promise<ActivityNews[]> {
    try {
      const response = await fetch('/api/activity-news', { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Failed to fetch activity news')
      }
      return await response.json()
    } catch (error) {
      logger.error("Error loading activity news:", error)
      return []
    }
  }

  async addActivityNews(activityNews: Omit<ActivityNews, "id" | "createdAt" | "updatedAt" | "creator" | "createdBy">): Promise<ActivityNews | null> {
    try {
      const response = await fetch('/api/activity-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityNews),
      })

      if (!response.ok) {
        throw new Error('Failed to create activity news')
      }

      return await response.json()
    } catch (error) {
      logger.error("Error creating activity news:", error)
      return null
    }
  }

  async updateActivityNews(id: string, updates: Partial<ActivityNews>): Promise<ActivityNews | null> {
    try {
      const response = await fetch(`/api/activity-news/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update activity news')
      }

      return await response.json()
    } catch (error) {
      logger.error("Error updating activity news:", error)
      return null
    }
  }

  async deleteActivityNews(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/activity-news/${id}`, {
        method: 'DELETE',
      })

      return response.ok
    } catch (error) {
      logger.error("Error deleting activity news:", error)
      return false
    }
  }

  async joinEvent(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/activity-news/${id}/join`, {
        method: 'POST',
      })

      return response.ok
    } catch (error) {
      logger.error("Error joining event:", error)
      return false
    }
  }
}

export const activityNewsService = new ActivityNewsService()
