export interface Announcement {
  id: number
  title: string
  club: string
  date: string
  time: string
  location: string
  description: string
  attendees: number
  maxAttendees: number
  type: string
  status: "active" | "cancelled" | "completed"
  createdAt: string
  updatedAt: string
}

const defaultAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "Computer Club Workshop: Web Development Basics",
    club: "Computer Club",
    date: "2024-01-15",
    time: "3:30 PM",
    location: "Computer Lab A",
    description:
      "Learn the fundamentals of HTML, CSS, and JavaScript in this hands-on workshop. Perfect for beginners!",
    attendees: 25,
    maxAttendees: 30,
    type: "Workshop",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Science Fair Project Presentations",
    club: "Science Society",
    date: "2024-01-18",
    time: "2:00 PM",
    location: "Main Auditorium",
    description:
      "Students will present their innovative science projects. Come support your peers and learn about cutting-edge research.",
    attendees: 150,
    maxAttendees: 200,
    type: "Event",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Debate Competition: Technology and Society",
    club: "Debate Club",
    date: "2024-01-20",
    time: "4:00 PM",
    location: "Conference Room B",
    description:
      "Join us for an engaging debate on the impact of technology on modern society. All students welcome to participate or observe.",
    attendees: 18,
    maxAttendees: 20,
    type: "Competition",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

class AnnouncementService {
  private storageKey = "mmw-hubix-announcements"

  getAnnouncements(): Announcement[] {
    if (typeof window === "undefined") return defaultAnnouncements

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error("Error loading announcements:", error)
    }

    // Initialize with default data
    this.saveAnnouncements(defaultAnnouncements)
    return defaultAnnouncements
  }

  saveAnnouncements(announcements: Announcement[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(announcements))
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent("announcementsUpdated", { detail: announcements }))
    } catch (error) {
      console.error("Error saving announcements:", error)
    }
  }

  addAnnouncement(announcement: Omit<Announcement, "id" | "createdAt" | "updatedAt">): Announcement {
    const announcements = this.getAnnouncements()
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Math.max(0, ...announcements.map((a) => a.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedAnnouncements = [...announcements, newAnnouncement]
    this.saveAnnouncements(updatedAnnouncements)
    return newAnnouncement
  }

  updateAnnouncement(id: number, updates: Partial<Announcement>): Announcement | null {
    const announcements = this.getAnnouncements()
    const index = announcements.findIndex((a) => a.id === id)

    if (index === -1) return null

    const updatedAnnouncement = {
      ...announcements[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    announcements[index] = updatedAnnouncement
    this.saveAnnouncements(announcements)
    return updatedAnnouncement
  }

  deleteAnnouncement(id: number): boolean {
    const announcements = this.getAnnouncements()
    const filteredAnnouncements = announcements.filter((a) => a.id !== id)

    if (filteredAnnouncements.length === announcements.length) return false

    this.saveAnnouncements(filteredAnnouncements)
    return true
  }

  joinEvent(id: number): boolean {
    const announcement = this.getAnnouncements().find((a) => a.id === id)
    if (!announcement || announcement.attendees >= announcement.maxAttendees) return false

    return !!this.updateAnnouncement(id, { attendees: announcement.attendees + 1 })
  }
}

export const announcementService = new AnnouncementService()
