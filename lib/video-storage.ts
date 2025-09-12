export interface VideoFile {
  id: string
  originalName: string
  fileName: string
  size: number
  type: string
  uploadDate: string
}

class VideoStorageService {
  private static instance: VideoStorageService
  private videoFiles: Map<string, VideoFile> = new Map()

  private constructor() {
    this.loadVideoFiles()
  }

  static getInstance(): VideoStorageService {
    if (!VideoStorageService.instance) {
      VideoStorageService.instance = new VideoStorageService()
    }
    return VideoStorageService.instance
  }

  private loadVideoFiles(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem("mmw-video-files")
      if (stored) {
        const videoFilesArray = JSON.parse(stored)
        this.videoFiles = new Map(videoFilesArray.map((vf: VideoFile) => [vf.id, vf]))
      }
    } catch (error) {
      console.warn('Failed to load video files from localStorage:', error)
    }
  }

  private saveVideoFiles(): void {
    if (typeof window === 'undefined') return

    try {
      const videoFilesArray = Array.from(this.videoFiles.values())
      localStorage.setItem("mmw-video-files", JSON.stringify(videoFilesArray))
    } catch (error) {
      console.warn('Failed to save video files to localStorage:', error)
    }
  }

  async storeVideoFile(file: File): Promise<string> {
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fileName = `${videoId}_${file.name}`
    
    // Store file metadata
    const videoFile: VideoFile = {
      id: videoId,
      originalName: file.name,
      fileName: fileName,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString()
    }

    this.videoFiles.set(videoId, videoFile)
    this.saveVideoFiles()

    // In a real implementation, you would upload to a server or cloud storage
    // For now, we'll store in IndexedDB for persistence
    await this.storeFileInIndexedDB(videoId, file)

    return videoId
  }

  private async storeFileInIndexedDB(videoId: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MMWVideoStorage', 1)
      
      request.onerror = () => reject(request.error)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['videos'], 'readwrite')
        const store = transaction.objectStore('videos')
        
        store.put({ id: videoId, file: file })
        
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      }
      
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains('videos')) {
          db.createObjectStore('videos', { keyPath: 'id' })
        }
      }
    })
  }

  async getVideoFile(videoId: string): Promise<File | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MMWVideoStorage', 1)
      
      request.onerror = () => reject(request.error)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['videos'], 'readonly')
        const store = transaction.objectStore('videos')
        const getRequest = store.get(videoId)
        
        getRequest.onsuccess = () => {
          const result = getRequest.result
          resolve(result ? result.file : null)
        }
        
        getRequest.onerror = () => reject(getRequest.error)
      }
    })
  }

  async getVideoUrl(videoId: string): Promise<string | null> {
    try {
      const file = await this.getVideoFile(videoId)
      if (file) {
        return URL.createObjectURL(file)
      }
      return null
    } catch (error) {
      console.error('Failed to get video URL:', error)
      return null
    }
  }

  getVideoMetadata(videoId: string): VideoFile | null {
    return this.videoFiles.get(videoId) || null
  }

  async deleteVideo(videoId: string): Promise<void> {
    // Remove from metadata
    this.videoFiles.delete(videoId)
    this.saveVideoFiles()

    // Remove from IndexedDB
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MMWVideoStorage', 1)
      
      request.onerror = () => reject(request.error)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['videos'], 'readwrite')
        const store = transaction.objectStore('videos')
        
        store.delete(videoId)
        
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
      }
    })
  }

  getAllVideoFiles(): VideoFile[] {
    return Array.from(this.videoFiles.values())
  }
}

export const videoStorageService = VideoStorageService.getInstance()
