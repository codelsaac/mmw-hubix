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
  FileText,
  File,
  Video,
  Edit3,
  Download,
} from "lucide-react"
import { useTraining } from "@/hooks/use-training"
import { TrainingResource, TrainingService, ResourceContentType } from "@/lib/training"
import { VideoPlayer } from "@/components/video-player"
import { useAuth } from "@/hooks/use-auth"
import { PermissionService, Permission, UserRole } from "@/lib/permissions"

const categories = [
  { id: "all", name: "All Resources", icon: BookOpen, count: 0 },
  { id: "basics", name: "IT Basics", icon: Monitor, count: 0 },
  { id: "security", name: "Security", icon: Shield, count: 0 },
  { id: "troubleshooting", name: "Troubleshooting", icon: Wrench, count: 0 },
]

const contentTypes = [
  { id: "VIDEO", name: "Video", icon: Video, description: "YouTube, Google Drive, or direct video links" },
  { id: "TEXT", name: "Text Article", icon: FileText, description: "Rich text content, tutorials, and guides" },
  { id: "FILE", name: "File Upload", icon: File, description: "Documents, presentations, PDFs, and more" },
]

export function TrainingLibrary() {
  const { resources, addResource, updateViews, deleteResource, clearAllResources } = useTraining()
  const { user } = useAuth()
  const canManageResources = user?.role && PermissionService.hasPermission(user.role as UserRole, Permission.MANAGE_TRAINING_VIDEOS)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedResource, setSelectedResource] = useState<TrainingResource | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedContentType, setSelectedContentType] = useState<ResourceContentType>("VIDEO")
  const [watchedResources, setWatchedResources] = useState<Set<number>>(new Set())
  const [isUploading, setIsUploading] = useState(false)

  const filteredResources = resources.filter((resource) => {
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleViewResource = (resource: TrainingResource) => {
    setSelectedResource(resource)
    setWatchedResources((prev) => new Set([...prev, resource.id]))
    updateViews(resource.id)
  }

  const handleUploadResource = async (formData: FormData) => {
    setIsUploading(true)
    
    try {
      const title = formData.get("title") as string
      const description = formData.get("description") as string
      const category = formData.get("category") as string
      const difficulty = formData.get("difficulty") as string
      const videoUrl = formData.get("videoUrl") as string
      const textContent = formData.get("textContent") as string
      const file = formData.get("file") as File

      if (!title || !category || !difficulty) {
        alert("請填寫必填欄位：標題、類別和難度")
        return
      }

      // Validate content type specific requirements
      if (selectedContentType === 'VIDEO' && !videoUrl) {
        alert("請提供影片連結")
        return
      }

      if (selectedContentType === 'TEXT' && !textContent) {
        alert("請提供文字內容")
        return
      }

      if (selectedContentType === 'FILE' && (!file || file.size === 0)) {
        alert("請選擇要上傳的檔案")
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

      let resourceData: any = {
        title,
        description,
        category,
        difficulty: difficulty || "Beginner",
        contentType: selectedContentType,
      }

      if (selectedContentType === 'VIDEO') {
        const processedVideo = TrainingService.processVideoUrl(videoUrl)
        if (!processedVideo) {
          alert("Please enter a valid video URL (YouTube, Google Drive, or direct video file)")
          return
        }
        resourceData.videoUrl = processedVideo.url
        resourceData.duration = "-- min"
      } else if (selectedContentType === 'TEXT') {
        resourceData.textContent = textContent
      } else if (selectedContentType === 'FILE') {
        // Upload file first
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })
        
        const uploadResult = await response.json()
        
        if (!uploadResult.success) {
          alert(`File upload failed: ${uploadResult.error}`)
          return
        }
        
        resourceData.fileName = uploadResult.originalName
        resourceData.fileUrl = uploadResult.url
        resourceData.fileSize = uploadResult.size
        resourceData.mimeType = uploadResult.type
      }

      const newResource = addResource(resourceData)

      console.log(`[v0] ${selectedContentType} resource added to library:`, newResource)
      setShowUploadDialog(false)
    } catch (error) {
      console.error('Error uploading resource:', error)
      alert('Failed to upload resource. Please try again.')
    } finally {
      setIsUploading(false)
    }
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

  const handleDeleteResource = (resourceId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this resource?")) {
      deleteResource(resourceId)
    }
  }

  const handleClearAllResources = () => {
    if (confirm("Are you sure you want to delete all resources? This action cannot be undone.")) {
      clearAllResources()
      setWatchedResources(new Set())
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Training Library</h2>
          <p className="text-muted-foreground">Comprehensive training resources for IT Prefects</p>
        </div>
        {canManageResources && (
          <div className="flex gap-2">
            <Button variant="destructive" onClick={handleClearAllResources}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Add Resource
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Training Resource</DialogTitle>
                <DialogDescription>Add a new training resource to the library</DialogDescription>
              </DialogHeader>
              
              {/* Content Type Selection */}
              <Tabs value={selectedContentType} onValueChange={(value) => setSelectedContentType(value as ResourceContentType)}>
                <TabsList className="grid w-full grid-cols-3">
                  {contentTypes.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        {type.name}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
                
                {contentTypes.map((type) => (
                  <TabsContent key={type.id} value={type.id} className="mt-4">
                    <p className="text-sm text-muted-foreground mb-4">{type.description}</p>
                  </TabsContent>
                ))}
              </Tabs>
              
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  await handleUploadResource(formData)
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="title">Resource Title</Label>
                  <Input id="title" name="title" placeholder="Enter resource title" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Describe the resource content" />
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
                
                {/* Content Type Specific Fields */}
                {selectedContentType === 'VIDEO' && (
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
                )}
                
                {selectedContentType === 'TEXT' && (
                  <div>
                    <Label htmlFor="textContent">Text Content</Label>
                    <Textarea
                      id="textContent"
                      name="textContent"
                      placeholder="Enter your article content here..."
                      className="min-h-[200px]"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      You can use markdown formatting
                    </p>
                  </div>
                )}
                
                {selectedContentType === 'FILE' && (
                  <div>
                    <Label htmlFor="file">Upload File</Label>
                    <Input
                      id="file"
                      name="file"
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported: PDF, Word, Excel, PowerPoint, Text, Archives (Max 50MB)
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Adding...' : `Add ${contentTypes.find(t => t.id === selectedContentType)?.name}`}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        )}
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
                    {category.id === "all" ? resources.length : resources.filter((r) => r.category === category.id).length}
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
                <span className="text-muted-foreground">Total Resources</span>
                <span className="font-medium">{resources.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploaded Resources</span>
                <span className="font-medium">{resources.filter((r) => r.isPublic).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">This Month</span>
                <span className="font-medium">
                  {resources.filter((r) => new Date(r.dateAdded).getMonth() === new Date().getMonth()).length} new
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                <div className="relative">
                  {resource.contentType === 'VIDEO' ? (
                    <img
                      src={
                        resource.thumbnail ||
                        `/placeholder.svg?height=128&width=320&query=${encodeURIComponent(resource.title) || "/placeholder.svg"}`
                      }
                      alt={resource.title}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg flex items-center justify-center">
                      {resource.contentType === 'TEXT' ? (
                        <FileText className="w-12 h-12 text-blue-600" />
                      ) : (
                        <File className="w-12 h-12 text-green-600" />
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg flex items-center justify-center">
                    {resource.contentType === 'VIDEO' ? (
                      <PlayCircle className="w-12 h-12 text-white" />
                    ) : resource.contentType === 'TEXT' ? (
                      <Edit3 className="w-12 h-12 text-white" />
                    ) : (
                      <Download className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {resource.contentType === 'VIDEO' ? resource.duration : resource.contentType}
                    </Badge>
                    {resource.isPublic && (
                      <Badge variant="default" className="text-xs bg-blue-600">
                        Uploaded
                      </Badge>
                    )}
                    {watchedResources.has(resource.id) && (
                      <Badge variant="default" className="text-xs bg-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Viewed
                      </Badge>
                    )}
                  </div>
                  {resource.isPublic && (
                    <div className="absolute top-2 left-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteResource(resource.id, e)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold line-clamp-2">{resource.title}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">{resource.rating}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <CardDescription className="text-xs line-clamp-2">{resource.description}</CardDescription>


                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{resource.views} views</span>
                    </div>
                    <span>{new Date(resource.dateAdded).toLocaleDateString()}</span>
                  </div>

                  <Button size="sm" className="w-full" onClick={() => handleViewResource(resource)}>
                    {resource.contentType === 'VIDEO' ? (
                      <PlayCircle className="w-3 h-3 mr-2" />
                    ) : resource.contentType === 'TEXT' ? (
                      <Edit3 className="w-3 h-3 mr-2" />
                    ) : (
                      <Download className="w-3 h-3 mr-2" />
                    )}
                    {watchedResources.has(resource.id) ? "View Again" : 
                     resource.contentType === 'VIDEO' ? "Watch Now" :
                     resource.contentType === 'TEXT' ? "Read Now" : "Download"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No resources found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or category filter</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle>{selectedResource?.title}</DialogTitle>
                <DialogDescription className="mt-2">{selectedResource?.description}</DialogDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedResource(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {selectedResource?.contentType === 'VIDEO' && (
              <div className="aspect-video bg-black rounded-lg">
                <VideoPlayer 
                  videoUrl={selectedResource?.videoUrl}
                  title={selectedResource?.title}
                  className="w-full h-full"
                />
              </div>
            )}
            
            {selectedResource?.contentType === 'TEXT' && (
              <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans">{selectedResource?.textContent}</pre>
                </div>
              </div>
            )}
            
            {selectedResource?.contentType === 'FILE' && (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium mb-2">{selectedResource?.fileName}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedResource?.fileSize && `Size: ${(selectedResource.fileSize / 1024 / 1024).toFixed(2)} MB`}
                </p>
                <Button asChild>
                  <a href={selectedResource?.fileUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </a>
                </Button>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{selectedResource?.views} views</span>
              </div>
              <span>{selectedResource && new Date(selectedResource.dateAdded).toLocaleDateString()}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
