export interface TrainingVideo {
  id: number
  title: string
  description: string
  category: string
  duration: string
  difficulty: string
  views: number
  rating: number
  thumbnail: string
  instructor: string
  dateAdded: string
  videoUrl?: string
  isUploaded?: boolean
}

const defaultVideos: TrainingVideo[] = []

class TrainingVideoService {
  private static instance: TrainingVideoService
  private videos: TrainingVideo[] = []
  private subscribers: (() => void)[] = []

  private constructor() {
    this.loadVideos()
  }

  static getInstance(): TrainingVideoService {
    if (!TrainingVideoService.instance) {
      TrainingVideoService.instance = new TrainingVideoService()
    }
    return TrainingVideoService.instance
  }

  private loadVideos(): void {
    // Check if we're in browser environment (not SSR)
    if (typeof window === 'undefined') {
      // Server-side: use default videos
      this.videos = [...defaultVideos]
      return
    }

    try {
      const stored = localStorage.getItem("mmw-training-videos")
      if (stored) {
        this.videos = JSON.parse(stored)
      } else {
        this.videos = [...defaultVideos]
        this.saveVideos()
      }
    } catch (error) {
      console.warn('Failed to load training videos from localStorage:', error)
      this.videos = [...defaultVideos]
    }
  }

  private saveVideos(): void {
    // Check if we're in browser environment (not SSR)
    if (typeof window === 'undefined') {
      // Server-side: just notify subscribers
      this.notifySubscribers()
      return
    }

    try {
      localStorage.setItem("mmw-training-videos", JSON.stringify(this.videos))
    } catch (error) {
      console.warn('Failed to save training videos to localStorage:', error)
    }
    this.notifySubscribers()
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback())
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback)
    }
  }

  getVideos(): TrainingVideo[] {
    return [...this.videos]
  }

  addVideo(videoData: Omit<TrainingVideo, "id" | "views" | "rating" | "dateAdded">): TrainingVideo {
    const newVideo: TrainingVideo = {
      ...videoData,
      id: Math.max(0, ...this.videos.map((v) => v.id)) + 1,
      views: 0,
      rating: 5.0,
      dateAdded: new Date().toISOString().split("T")[0],
      isUploaded: true,
    }

    this.videos.unshift(newVideo)
    this.saveVideos()
    return newVideo
  }

  updateVideoViews(id: number): void {
    const video = this.videos.find((v) => v.id === id)
    if (video) {
      video.views += 1
      this.saveVideos()
    }
  }

  deleteVideo(id: number): void {
    this.videos = this.videos.filter((v) => v.id !== id)
    this.saveVideos()
  }

  clearAllVideos(): void {
    this.videos = []
    this.saveVideos()
  }
}

// Lazy-loaded service to prevent SSR issues
export const getTrainingVideoService = () => {
  if (typeof window === 'undefined') {
    // Server-side: return a mock service that doesn't use localStorage
    return {
      getVideos: () => [...defaultVideos],
      addVideo: () => ({ ...defaultVideos[0], id: 1, title: 'Loading...', dateAdded: new Date().toISOString().split("T")[0] }),
      updateVideoViews: () => {},
      deleteVideo: () => {},
      clearAllVideos: () => {},
      subscribe: () => () => {}
    }
  }
  return TrainingVideoService.getInstance()
}

// For backward compatibility, but this will be lazy-loaded
export const trainingVideoService = typeof window !== 'undefined' ? TrainingVideoService.getInstance() : null
