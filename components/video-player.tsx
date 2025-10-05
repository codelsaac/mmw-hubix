"use client"

import { useState, useEffect } from "react"
import { videoStorageService } from "@/lib/video-storage"

import { logger } from "@/lib/logger"
interface VideoPlayerProps {
  videoUrl?: string
  title?: string
  className?: string
}

export function VideoPlayer({ videoUrl, title, className }: VideoPlayerProps) {
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!videoUrl) return

    // Check if it's a local video reference (legacy support)
    if (videoUrl.startsWith('local:')) {
      const videoId = videoUrl.replace('local:', '')
      setIsLoading(true)
      setError(null)

      videoStorageService.getVideoUrl(videoId)
        .then((url) => {
          if (url) {
            setLocalVideoUrl(url)
          } else {
            setError('Video file not found')
          }
        })
        .catch((err) => {
          logger.error('Failed to load video:', err)
          setError('Failed to load video')
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      // It's a direct URL (YouTube, or public video file)
      setLocalVideoUrl(videoUrl)
    }

    // Cleanup function to revoke object URLs
    return () => {
      if (localVideoUrl && localVideoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localVideoUrl)
      }
    }
  }, [videoUrl])

  if (isLoading) {
    return (
      <div className={`aspect-video bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading video...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`aspect-video bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <p className="text-xs text-muted-foreground">Please try uploading the video again</p>
        </div>
      </div>
    )
  }

  if (!localVideoUrl) {
    return (
      <div className={`aspect-video bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-sm text-muted-foreground">No video available</p>
      </div>
    )
  }

  // Check if it's a YouTube embed URL
  if (localVideoUrl.includes('youtube.com/embed/') || localVideoUrl.includes('youtu.be/')) {
    return (
      <iframe
        src={localVideoUrl}
        className={`w-full h-full rounded-lg ${className}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={title || "Video Player"}
      />
    )
  }

  // Check if it's a Google Drive embed URL
  if (localVideoUrl.includes('drive.google.com')) {
    return (
      <iframe
        src={localVideoUrl}
        className={`w-full h-full rounded-lg ${className}`}
        allow="autoplay"
        allowFullScreen
        title={title || "Video Player"}
      />
    )
  }

  // It's a local video file
  return (
    <video
      src={localVideoUrl}
      className={`w-full h-full rounded-lg ${className}`}
      controls
      preload="metadata"
      title={title || "Video Player"}
    >
      <p className="text-sm text-muted-foreground">
        Your browser does not support the video tag.
      </p>
    </video>
  )
}
