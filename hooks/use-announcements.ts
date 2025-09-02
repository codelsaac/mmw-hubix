"use client"

import { useState, useEffect } from "react"
import { announcementService, type Announcement } from "@/lib/announcements"

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  const loadAnnouncements = () => {
    try {
      const data = announcementService.getAnnouncements()
      setAnnouncements(data)
    } catch (error) {
      console.error("Error loading announcements:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()

    // Listen for real-time updates
    const handleAnnouncementsUpdate = (event: CustomEvent) => {
      setAnnouncements(event.detail)
    }

    window.addEventListener("announcementsUpdated", handleAnnouncementsUpdate as EventListener)

    return () => {
      window.removeEventListener("announcementsUpdated", handleAnnouncementsUpdate as EventListener)
    }
  }, [])

  const addAnnouncement = (announcement: Omit<Announcement, "id" | "createdAt" | "updatedAt">) => {
    const newAnnouncement = announcementService.addAnnouncement(announcement)
    loadAnnouncements()
    return newAnnouncement
  }

  const updateAnnouncement = (id: number, updates: Partial<Announcement>) => {
    const updated = announcementService.updateAnnouncement(id, updates)
    if (updated) loadAnnouncements()
    return updated
  }

  const deleteAnnouncement = (id: number) => {
    const success = announcementService.deleteAnnouncement(id)
    if (success) loadAnnouncements()
    return success
  }

  const joinEvent = (id: number) => {
    const success = announcementService.joinEvent(id)
    if (success) loadAnnouncements()
    return success
  }

  return {
    announcements,
    loading,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    joinEvent,
    refresh: loadAnnouncements,
  }
}
