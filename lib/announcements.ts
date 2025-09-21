export interface Announcement {
  id: string
  title: string
  club: string
  date: Date | string
  time: string
  location: string
  description: string
  attendees: number
  maxAttendees: number
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

class AnnouncementService {
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const response = await fetch('/api/announcements', { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Failed to fetch announcements')
      }
      return await response.json()
    } catch (error) {
      console.error("Error loading announcements:", error)
      return []
    }
  }

  async addAnnouncement(announcement: Omit<Announcement, "id" | "createdAt" | "updatedAt" | "creator" | "createdBy">): Promise<Announcement | null> {
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(announcement),
      })

      if (!response.ok) {
        throw new Error('Failed to create announcement')
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating announcement:", error)
      return null
    }
  }

  async updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement | null> {
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update announcement')
      }

      return await response.json()
    } catch (error) {
      console.error("Error updating announcement:", error)
      return null
    }
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
      })

      return response.ok
    } catch (error) {
      console.error("Error deleting announcement:", error)
      return false
    }
  }

  async joinEvent(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/announcements/${id}/join`, {
        method: 'POST',
      })

      return response.ok
    } catch (error) {
      console.error("Error joining event:", error)
      return false
    }
  }
}

export const announcementService = new AnnouncementService()
