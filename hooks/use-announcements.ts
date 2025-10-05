"use client"

import { useState, useEffect } from "react"
import { announcementService, type Announcement } from "@/lib/announcements"

import { logger } from "@/lib/logger"
export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      const data = await announcementService.getAnnouncements()
      setAnnouncements(data)
    } catch (error) {
      logger.error("Error loading announcements:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const addAnnouncement = async (announcement: Omit<Announcement, "id" | "createdAt" | "updatedAt" | "creator" | "createdBy">) => {
    const newAnnouncement = await announcementService.addAnnouncement(announcement)
    if (newAnnouncement) {
      await loadAnnouncements()
    }
    return newAnnouncement
  }

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    const updated = await announcementService.updateAnnouncement(id, updates)
    if (updated) {
      await loadAnnouncements()
    }
    return updated
  }

  const deleteAnnouncement = async (id: string) => {
    const success = await announcementService.deleteAnnouncement(id)
    if (success) {
      await loadAnnouncements()
    }
    return success
  }

  const joinEvent = async (id: string) => {
    const success = await announcementService.joinEvent(id)
    if (success) {
      await loadAnnouncements()
    }
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
