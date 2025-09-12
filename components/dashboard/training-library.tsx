"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PlayCircle,
  Search,
  Filter,
  Users,
  Star,
  BookOpen,
  Monitor,
  Shield,
  Wrench,
  Upload,
  X,
  CheckCircle,
  Trash2,
} from "lucide-react"
import { useTrainingVideos } from "@/hooks/use-training-videos"
import { VideoPlayer } from "@/components/video-player"

const categories = [
  { id: "all", name: "All Videos", icon: BookOpen, count: 24 },
  { id: "basics", name: "IT Basics", icon: Monitor, count: 8 },
  { id: "security", name: "Security", icon: Shield, count: 6 },
  { id: "troubleshooting", name: "Troubleshooting", icon: Wrench, count: 10 },
]

export function TrainingLibrary() {
  const { videos, addVideo, updateViews, deleteVideo, clearAllVideos } = useTrainingVideos()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [watchedVideos, setWatchedVideos] = useState<Set<number>>(new Set())

  const filteredVideos = videos.filter((video) => {
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleWatchVideo = (video: any) => {
    setSelectedVideo(video)
    setWatchedVideos((prev) => new Set([...prev, video.id]))
    updateViews(video.id)
  }

  const handleUploadVideo = async (formData: FormData) => {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const instructor = formData.get("instructor") as string
    const difficulty = formData.get("difficulty") as string
    const videoUrl = formData.get("videoUrl") as string

    if (!title || !category || !difficulty || !videoUrl) {
      alert("請填寫必填欄位：標題、類別、難度和影片連結")
      return
    }

    const processVideoUrl = (url: string) => {
      // YouTube URL processing
      const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
      const youtubeMatch = url.match(youtubeRegExp)
      
      if (youtubeMatch && youtubeMatch[2].length === 11) {
        const videoId = youtubeMatch[2]
        return {
          type: 'youtube',
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        }
      }

      // Google Drive URL processing
      const driveRegExp = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
      const driveMatch = url.match(driveRegExp)
      
      if (driveMatch) {
        const fileId = driveMatch[1]
        return {
          type: 'googledrive',
          embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
          thumbnail: "/placeholder.svg?height=128&width=320&text=Google+Drive+Video"
        }
      }

      // Direct video URL (MP4, etc.)
      if (url.match(/\.(mp4|webm|ogg|avi|mov)(\?.*)?$/i)) {
        return {
          type: 'direct',
          embedUrl: url,
          thumbnail: "/placeholder.svg?height=128&width=320&text=Video+File"
        }
      }

      return null
    }

    const processedVideo = processVideoUrl(videoUrl)
    
    if (!processedVideo) {
      alert("Please enter a valid video URL (YouTube, Google Drive, or direct video file)")
      return
    }

    const newVideo = addVideo({
      title,
      description,
      category,
      instructor: instructor || "IT Prefect",
      difficulty: difficulty || "Beginner",
      duration: "-- min",
      thumbnail: processedVideo.thumbnail,
      videoUrl: processedVideo.embedUrl,
    })

    console.log(`[v0] ${processedVideo.type} video added to library:`, newVideo)
    setShowUploadDialog(false)
  }

  const getVideoDuration = (file: File): Promise<number | null> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        resolve(video.duration)
      }
      
      video.onerror = () => {
        resolve(null)
      }
      
      video.src = URL.createObjectURL(file)
    })
  }

  const handleDeleteVideo = (videoId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this video?")) {
      deleteVideo(videoId)
    }
  }

  const handleClearAllVideos = () => {
    if (confirm("Are you sure you want to delete all videos? This action cannot be undone.")) {
      clearAllVideos()
      setWatchedVideos(new Set())
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Training Library</h2>
          <p className="text-muted-foreground">Comprehensive training resources for IT Prefects</p>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleClearAllVideos}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload Training Video</DialogTitle>
                <DialogDescription>Add a new training video to the library</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  await handleUploadVideo(formData)
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="title">Video Title</Label>
                  <Input id="title" name="title" placeholder="Enter video title" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Describe the video content" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basics">IT Basics</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select name="difficulty" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="instructor">Instructor (Optional)</Label>
                  <Input id="instructor" name="instructor" placeholder="Enter instructor name" />
                </div>
                
                <div>
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    type="url"
                    placeholder="YouTube, Google Drive, or direct video URL..."
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports YouTube, Google Drive, and direct video file links
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add Video
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search training videos..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <category.icon className="w-4 h-4 mr-3" />
                  <span className="flex-1 text-left">{category.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.id === "all" ? videos.length : videos.filter((v) => v.category === category.id).length}
                  </Badge>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Library Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Videos</span>
                <span className="font-medium">{videos.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploaded Videos</span>
                <span className="font-medium">{videos.filter((v) => v.isUploaded).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">This Month</span>
                <span className="font-medium">
                  {videos.filter((v) => new Date(v.dateAdded).getMonth() === new Date().getMonth()).length} new
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                <div className="relative">
                  <img
                    src={
                      video.thumbnail ||
                      `/placeholder.svg?height=128&width=320&query=${encodeURIComponent(video.title) || "/placeholder.svg"}`
                    }
                    alt={video.title}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {video.duration}
                    </Badge>
                    {video.isUploaded && (
                      <Badge variant="default" className="text-xs bg-blue-600">
                        Uploaded
                      </Badge>
                    )}
                    {watchedVideos.has(video.id) && (
                      <Badge variant="default" className="text-xs bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Watched
                      </Badge>
                    )}
                  </div>
                  {video.isUploaded && (
                    <div className="absolute top-2 left-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteVideo(video.id, e)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold line-clamp-2">{video.title}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">{video.rating}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <CardDescription className="text-xs line-clamp-2">{video.description}</CardDescription>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{video.instructor}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{video.views} views</span>
                    </div>
                    <span>{new Date(video.dateAdded).toLocaleDateString()}</span>
                  </div>

                  <Button size="sm" className="w-full" onClick={() => handleWatchVideo(video)}>
                    <PlayCircle className="w-3 h-3 mr-2" />
                    {watchedVideos.has(video.id) ? "Watch Again" : "Watch Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <PlayCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No videos found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or category filter</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle>{selectedVideo?.title}</DialogTitle>
                <DialogDescription className="mt-2">{selectedVideo?.description}</DialogDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedVideo(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg">
              <VideoPlayer 
                videoUrl={selectedVideo?.videoUrl}
                title={selectedVideo?.title}
                className="w-full h-full"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{selectedVideo?.views} views</span>
              </div>
              <span>{new Date(selectedVideo?.dateAdded).toLocaleDateString()}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
