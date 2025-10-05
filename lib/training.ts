import { logger } from "@/lib/logger"
// Consolidated Training Module
// This file contains all training-related types, services, and utilities

export type ResourceContentType = 'VIDEO' | 'TEXT' | 'FILE'

export interface TrainingResource {
  id: number
  title: string
  description: string
  contentType: ResourceContentType
  category: string
  difficulty: string
  views: number
  rating: number
  dateAdded: string
  
  // Video content fields
  videoUrl?: string
  duration?: string
  thumbnail?: string
  
  // Text content fields
  textContent?: string
  
  // File content fields
  fileName?: string
  fileUrl?: string
  fileSize?: number
  mimeType?: string
  
  // Metadata
  isPublic: boolean
  createdBy: string
  creator?: {
    id: string
    name: string | null
    email: string
  }
}

export interface CreateResourceRequest {
  title: string
  description?: string
  contentType: ResourceContentType
  category: string
  difficulty?: string
  videoUrl?: string
  textContent?: string
  fileName?: string
  fileUrl?: string
  fileSize?: number
  mimeType?: string
  isPublic?: boolean
}

// Training categories configuration
export const TRAINING_CATEGORIES = [
  { id: "all", name: "All Resources", count: 0 },
  { id: "basics", name: "IT Basics", count: 0 },
  { id: "security", name: "Security", count: 0 },
  { id: "troubleshooting", name: "Troubleshooting", count: 0 },
] as const

// Content types configuration
export const CONTENT_TYPES = [
  { 
    id: "VIDEO" as const, 
    name: "Video", 
    description: "YouTube, Google Drive, or direct video links" 
  },
  { 
    id: "TEXT" as const, 
    name: "Text Article", 
    description: "Rich text content, tutorials, and guides" 
  },
  { 
    id: "FILE" as const, 
    name: "File Upload", 
    description: "Documents, presentations, PDFs, and more" 
  },
] as const

// Training Service Class
export class TrainingService {
  private static readonly API_BASE = '/api/training'

  static async getResources(): Promise<TrainingResource[]> {
    try {
      const response = await fetch(`${this.API_BASE}`)
      if (!response.ok) throw new Error('Failed to fetch resources')
      return await response.json()
    } catch (error) {
      logger.error('Error fetching resources:', error)
      return []
    }
  }

  static async createResource(data: CreateResourceRequest): Promise<TrainingResource | null> {
    try {
      const response = await fetch(`${this.API_BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) throw new Error('Failed to create resource')
      return await response.json()
    } catch (error) {
      logger.error('Error creating resource:', error)
      return null
    }
  }

  static async deleteResource(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/${id}`, {
        method: 'DELETE'
      })
      return response.ok
    } catch (error) {
      logger.error('Error deleting resource:', error)
      return false
    }
  }

  static async updateViews(id: number): Promise<void> {
    try {
      await fetch(`${this.API_BASE}/${id}/views`, {
        method: 'PATCH'
      })
    } catch (error) {
      logger.error('Error updating views:', error)
    }
  }

  // Video URL processing utility
  static processVideoUrl(url: string): { url: string; type: 'youtube' | 'drive' | 'direct' } | null {
    if (!url) return null

    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    const youtubeMatch = url.match(youtubeRegex)
    if (youtubeMatch) {
      return {
        url: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
        type: 'youtube'
      }
    }

    // Google Drive URL patterns
    const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
    const driveMatch = url.match(driveRegex)
    if (driveMatch) {
      return {
        url: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
        type: 'drive'
      }
    }

    // Direct video file
    const videoExtensions = /\.(mp4|webm|ogg|avi|mov)(\?.*)?$/i
    if (videoExtensions.test(url)) {
      return {
        url: url,
        type: 'direct'
      }
    }

    return null
  }
}
