"use client"

import { useState, useEffect } from "react"
import { activityNewsService, type ActivityNews } from "@/lib/activity-news"

import { logger } from "@/lib/logger"
export function useActivityNews() {
  const [activityNews, setActivityNews] = useState<ActivityNews[]>([])
  const [loading, setLoading] = useState(true)

  const loadActivityNews = async () => {
    try {
      setLoading(true)
      const data = await activityNewsService.getActivityNews()
      setActivityNews(data)
    } catch (error) {
      logger.error("Error loading activity news:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivityNews()
  }, [])

  const addActivityNews = async (activityNews: Omit<ActivityNews, "id" | "createdAt" | "updatedAt" | "creator" | "createdBy">) => {
    const newActivityNews = await activityNewsService.addActivityNews(activityNews)
    if (newActivityNews) {
      await loadActivityNews()
    }
    return newActivityNews
  }

  const updateActivityNews = async (id: string, updates: Partial<ActivityNews>) => {
    const updated = await activityNewsService.updateActivityNews(id, updates)
    if (updated) {
      await loadActivityNews()
    }
    return updated
  }

  const deleteActivityNews = async (id: string) => {
    const success = await activityNewsService.deleteActivityNews(id)
    if (success) {
      await loadActivityNews()
    }
    return success
  }

  const joinEvent = async (id: string) => {
    const success = await activityNewsService.joinEvent(id)
    if (success) {
      await loadActivityNews()
    }
    return success
  }

  return {
    activityNews,
    loading,
    addActivityNews,
    updateActivityNews,
    deleteActivityNews,
    joinEvent,
    refresh: loadActivityNews,
  }
}
