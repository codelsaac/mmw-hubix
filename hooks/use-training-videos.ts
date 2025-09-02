"use client"

import { useState, useEffect } from "react"
import { getTrainingVideoService, type TrainingVideo } from "@/lib/training-videos"

export function useTrainingVideos() {
  const [videos, setVideos] = useState<TrainingVideo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadVideos = () => {
      const service = getTrainingVideoService()
      setVideos(service.getVideos())
      setLoading(false)
    }

    loadVideos()
    const unsubscribe = getTrainingVideoService().subscribe(loadVideos)
    return unsubscribe
  }, [])

  const addVideo = (videoData: Omit<TrainingVideo, "id" | "views" | "rating" | "dateAdded">) => {
    const service = getTrainingVideoService()
    return service.addVideo(videoData)
  }

  const updateViews = (id: number) => {
    const service = getTrainingVideoService()
    service.updateVideoViews(id)
  }

  const deleteVideo = (id: number) => {
    const service = getTrainingVideoService()
    service.deleteVideo(id)
  }

  const clearAllVideos = () => {
    const service = getTrainingVideoService()
    service.clearAllVideos()
  }

  return {
    videos,
    loading,
    addVideo,
    updateViews,
    deleteVideo,
    clearAllVideos,
  }
}
