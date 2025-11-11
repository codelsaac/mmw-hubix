"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Code,
  Database,
  Tag,
  Plus,
  XCircle,
  Edit,
  Check,
  ChevronDown,
} from "lucide-react"
import { useTraining } from "@/hooks/use-training"
import { TrainingResource, TrainingService, ResourceContentType } from "@/lib/training"
import { VideoPlayer } from "@/components/video-player"
import { useAuth } from "@/hooks/use-auth"
import { PermissionService, Permission, UserRole } from "@/lib/permissions"

import { logger } from "@/lib/logger"

// Default categories that will be available
const defaultCategories = [
  { id: "it-basics", name: "IT Basics", icon: Monitor, color: "bg-blue-100 text-blue-800" },
  { id: "security", name: "Security", icon: Shield, color: "bg-red-100 text-red-800" },
  { id: "troubleshooting", name: "Troubleshooting", icon: Wrench, color: "bg-orange-100 text-orange-800" },
  { id: "networking", name: "Networking", icon: Users, color: "bg-green-100 text-green-800" },
  { id: "programming", name: "Programming", icon: Code, color: "bg-purple-100 text-purple-800" },
  { id: "database", name: "Database", icon: Database, color: "bg-indigo-100 text-indigo-800" },
]

const contentTypes = [
  { id: "VIDEO", name: "Video", icon: Video, description: "YouTube, Google Drive, or direct video links" },
  { id: "TEXT", name: "Text Article", icon: FileText, description: "Rich text content, tutorials, and guides" },
  { id: "FILE", name: "File Upload", icon: File, description: "Documents, presentations, PDFs, and more" },
]

// Helper function to normalize tags (handle both array and JSON string)
const normalizeTags = (tags: any): string[] => {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  try {
    return JSON.parse(tags)
  } catch {
    return []
  }
}

export function TrainingLibrary() {
  const { resources, loading, addResource, updateViews, deleteResource } = useTraining()
  const { user } = useAuth()
  const canManageResources = user?.role && PermissionService.hasPermission(user.role as UserRole, Permission.MANAGE_TRAINING_VIDEOS)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedResource, setSelectedResource] = useState<TrainingResource | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedContentType, setSelectedContentType] = useState<ResourceContentType>("VIDEO")
  const [watchedResources, setWatchedResources] = useState<Set<string>>(new Set())
  const [isUploading, setIsUploading] = useState(false)
  const [availableCategories, setAvailableCategories] = useState<typeof defaultCategories>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState("")
  const [isCategoryLoading, setIsCategoryLoading] = useState(false)

  // Memoize categories from resources to avoid recalculation on every render
  const allCategories = useMemo(() => {
    const categorySet = new Set<string>()
    resources.forEach(resource => {
      const tags = normalizeTags(resource.tags)
      tags.forEach(tag => categorySet.add(tag))
    })
    return Array.from(categorySet)
  }, [resources])

  // Load categories from database only
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/training/categories')
        const dbCategories = response.ok ? await response.json() : []
        
        // Map database categories to category objects with icons and colors
        const categories = dbCategories.map((name: string) => {
          // Check if it matches a default category (for icon and color)
          const defaultCat = defaultCategories.find(
            dc => dc.name.toLowerCase() === name.toLowerCase()
          )
          return defaultCat || {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            icon: Tag,
            color: "bg-gray-100 text-gray-800"
          }
        })
        
        setAvailableCategories(categories)
      } catch (error) {
        logger.error('Error loading categories:', error)
        // If API fails, show empty array (don't force defaults back)
        setAvailableCategories([])
      }
    }
    
    loadCategories()
    }, [])  // Only run once on mount to avoid constant refetching

  const filteredResources = resources.filter((resource) => {
    const tags = normalizeTags(resource.tags)
    const matchesCategory = selectedCategory === "all" || tags.includes(selectedCategory)
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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
      const videoUrl = formData.get("videoUrl") as string
      const textContent = formData.get("textContent") as string
      const file = formData.get("file") as File

      if (!title) {
        alert("請填寫必填欄位：標題")
        return
      }

      // Use selected categories from state (fallback to hidden input if needed)
      const categoriesValue = selectedCategories.length
        ? selectedCategories
        : ((formData.get("categories") as string) || "")
            .split(',')
            .map((category) => category.trim())
            .filter((category) => category.length > 0)

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
        tags: categoriesValue,
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

      logger.log(`[v0] ${selectedContentType} resource added to library:`, newResource)
      setShowUploadDialog(false)
    } catch (error) {
      logger.error('Error uploading resource:', error)
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

  const handleDeleteResource = (resourceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this resource?")) {
      deleteResource(resourceId)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || isCategoryLoading) return;

    const newCategory = {
      id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
      name: newCategoryName.trim(),
      icon: Tag,
      color: "bg-gray-100 text-gray-800"
    };

    if (availableCategories.find(cat => cat.name.toLowerCase() === newCategory.name.toLowerCase())) {
      alert('A category with this name already exists.');
      return;
    }

    setIsCategoryLoading(true);
    try {
      const response = await fetch('/api/training/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          newCategoryName: newCategory.name  // Fix: API expects newCategoryName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add category');
      }

      setAvailableCategories(prev => [...prev, newCategory]);
      setNewCategoryName("");
      setShowAddCategory(false);
    } catch (error) {
      logger.error('Error adding category:', error);
      alert('Failed to add category. Please try again.');
    } finally {
      setIsCategoryLoading(false);
    }
  };

  // Removed handleDeleteAllCategories - not needed

  const handleEditCategory = (categoryName: string) => {
    setEditingCategory(categoryName)
    setEditingCategoryName(categoryName)
  }

  const handleSaveCategoryEdit = async () => {
    if (!editingCategory || !editingCategoryName.trim() || isCategoryLoading) return
    
    const newName = editingCategoryName.trim()
    const oldName = editingCategory
    
    // Check if new name already exists
    if (newName !== oldName && availableCategories.find(cat => cat.name.toLowerCase() === newName.toLowerCase())) {
      alert('A category with this name already exists.')
      return
    }
    
    // Check if any resources are using this category
    const resourcesUsingCategory = resources.filter(resource => 
      normalizeTags(resource.tags).includes(oldName)
    )
    
    if (resourcesUsingCategory.length > 0) {
      const confirmMessage = `This category is used by ${resourcesUsingCategory.length} resource(s). Are you sure you want to rename it? This will update the category name in all resources.`
      if (!confirm(confirmMessage)) {
        return
      }
    }
    
    setIsCategoryLoading(true);
    try {
      // Update the category in the database
      const response = await fetch('/api/training/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit',
          categoryName: oldName,
          newCategoryName: newName
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update category')
      }

      // Update category in available categories
      setAvailableCategories(prev => prev.map(cat => 
        cat.name === oldName ? { ...cat, name: newName } : cat
      ))
      
      // If the edited category was selected, update the selection
      if (selectedCategory === oldName) {
        setSelectedCategory(newName)
      }
      
      // Reset editing state
      setEditingCategory(null)
      setEditingCategoryName("")
    } catch (error) {
      logger.error('Error updating category:', error)
      alert('Failed to update category. Please try again.')
    } finally {
      setIsCategoryLoading(false);
    }
  }

  const handleCancelCategoryEdit = () => {
    setEditingCategory(null)
    setEditingCategoryName("")
  }

  const handleRemoveCategory = async (categoryName: string) => {
    if (isCategoryLoading) return;
    
    // Check if any resources are using this category
    const resourcesUsingCategory = resources.filter(resource => 
      normalizeTags(resource.tags).includes(categoryName)
    )
    
    if (resourcesUsingCategory.length > 0) {
      const confirmMessage = `This category is used by ${resourcesUsingCategory.length} resource(s). Are you sure you want to remove it? This will remove the category from all resources.`
      if (!confirm(confirmMessage)) {
        return
      }
    } else {
      if (!confirm(`Are you sure you want to remove the category "${categoryName}"?`)) {
        return
      }
    }

    setIsCategoryLoading(true);
    try {
      // Remove the category from the database
      const response = await fetch('/api/training/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          categoryName: categoryName
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        logger.error('API Error:', { status: response.status, error: errorData })
        throw new Error(`Failed to remove category: ${errorData.error || 'Unknown error'}`)
      }

      const result = await response.json()
      logger.log('Category removal result:', result)

      // Remove category from available categories
      setAvailableCategories(prev => prev.filter(cat => cat.name !== categoryName))
      
      // If the removed category was selected, switch to "all"
      if (selectedCategory === categoryName) {
        setSelectedCategory("all")
      }
    } catch (error) {
      logger.error('Error removing category:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove category. Please try again.'
      alert(errorMessage)
    } finally {
      setIsCategoryLoading(false);
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
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Add Resource
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                className="space-y-4 rounded-xl bg-white/90 p-6 border border-slate-200 shadow-sm"
              >
                <div>
                  <Label htmlFor="title">Resource Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter resource title"
                    required
                    className="bg-white border border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the resource content"
                    className="bg-white border border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <Label>Categories</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between border-slate-300 text-slate-900 hover:bg-slate-50"
                      >
                        {selectedCategories.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[80%]">
                            {selectedCategories.map((category) => (
                              <Badge key={category} variant="secondary" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Select categories</span>
                        )}
                        <ChevronDown className="w-4 h-4 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 max-h-60 overflow-y-auto">
                      {availableCategories.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-slate-700">
                          No categories available. Add one from the sidebar.
                        </div>
                      ) : (
                        availableCategories.map((category) => (
                          <DropdownMenuCheckboxItem
                            key={category.id}
                            checked={selectedCategories.includes(category.name)}
                            onCheckedChange={(checked) => {
                              setSelectedCategories((prev) => {
                                if (checked) {
                                  return prev.includes(category.name)
                                    ? prev
                                    : [...prev, category.name]
                                }
                                return prev.filter((item) => item !== category.name)
                              })
                            }}
                          >
                            {category.name}
                          </DropdownMenuCheckboxItem>
                        ))
                      )}
                      {selectedCategories.length > 0 && (
                        <DropdownMenuCheckboxItem
                          checked={false}
                          className="text-sm text-destructive"
                          onSelect={(event) => {
                            event.preventDefault()
                            setSelectedCategories([])
                          }}
                        >
                          Clear selection
                        </DropdownMenuCheckboxItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <input type="hidden" name="categories" value={selectedCategories.join(',')} />
                  <p className="text-xs text-slate-700 mt-1">
                    Choose one or more categories for this resource
                  </p>
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
                      className="bg-white border border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:ring-2 focus:ring-slate-400"
                    />
                    <p className="text-xs text-slate-700 mt-1">
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
                      className="min-h-[200px] bg-white border border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-slate-500 focus:ring-2 focus:ring-slate-400"
                      required
                    />
                    <p className="text-xs text-slate-700 mt-1">
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
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.ogg,.avi,.mov"
                      required
                      className="bg-white border border-slate-300 text-slate-900 file:text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-400"
                    />
                    <p className="text-xs text-slate-700 mt-1">
                      <strong>Documents:</strong> PDF, Word, Excel, PowerPoint, Text, CSV<br/>
                      <strong>Images:</strong> JPEG, PNG, GIF, WebP<br/>
                      <strong>Videos:</strong> MP4, WebM, OGG, AVI, MOV<br/>
                      <strong>Archives:</strong> ZIP, RAR, 7Z (Max 50MB)
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
          <Input
            placeholder="Search training videos..."
            className="pl-10 bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder:text-gray-500 shadow-sm"
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Categories</CardTitle>
                <div className="flex items-center">
                  {canManageResources && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddCategory(!showAddCategory)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                  {/* Removed Delete All Categories button */}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {showAddCategory && (
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="New category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <Button size="sm" onClick={handleAddCategory} disabled={isCategoryLoading}>
                    {isCategoryLoading ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              )}
              <Button
                variant={selectedCategory === "all" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedCategory("all")}
              >
                <BookOpen className="w-4 h-4 mr-3" />
                <span className="flex-1 text-left">All Resources</span>
                <Badge variant="secondary" className="text-xs">
                  {resources.length}
                </Badge>
              </Button>
              {availableCategories.map((category) => {
                const IconComponent = category.icon
                const count = resources.filter((r) => r.tags && r.tags.includes(category.name)).length
                const isEditing = editingCategory === category.name
                
                return (
                  <div key={category.id} className="flex items-center group">
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-muted-foreground" />
                        <Input
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveCategoryEdit()}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={handleSaveCategoryEdit}
                          title="Save changes"
                          disabled={isCategoryLoading}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                          onClick={handleCancelCategoryEdit}
                          title="Cancel editing"
                          disabled={isCategoryLoading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant={selectedCategory === category.name ? "default" : "ghost"}
                          className="flex-1 justify-start"
                          onClick={() => setSelectedCategory(category.name)}
                        >
                          <IconComponent className="w-4 h-4 mr-3" />
                          <span className="flex-1 text-left">{category.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {count}
                          </Badge>
                        </Button>
                        {canManageResources && (
                          <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditCategory(category.name)
                              }}
                              title={`Edit category "${category.name}"`}
                              disabled={isCategoryLoading}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveCategory(category.name)
                              }}
                              title={`Remove category "${category.name}"`}
                              disabled={isCategoryLoading}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
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
                <span className="text-muted-foreground">Videos</span>
                <span className="font-medium">{resources.filter((r) => r.contentType === 'VIDEO').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Documents/Files</span>
                <span className="font-medium">{resources.filter((r) => r.contentType === 'FILE').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Articles</span>
                <span className="font-medium">{resources.filter((r) => r.contentType === 'TEXT').length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              // Skeleton loaders for loading state
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <Skeleton className="w-full h-32 rounded-t-lg" shimmer />
                  <CardContent className="pt-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" shimmer />
                    <Skeleton className="h-4 w-full" shimmer />
                    <Skeleton className="h-4 w-5/6" shimmer />
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-4 w-20" shimmer />
                      <Skeleton className="h-4 w-16" shimmer />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredResources.map((resource, index) => (
              <Card 
                key={resource.id} 
                className="hover:shadow-md transition-shadow cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
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
                  </div>
                  {canManageResources && (
                    <div className="absolute bottom-2 right-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={(e) => handleDeleteResource(resource.id, e)}
                        title="Delete resource"
                      >
                        <Trash2 className="w-4 h-4" />
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

                  {/* Display categories */}
                  {(() => {
                    const tags = normalizeTags(resource.tags)
                    return tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 3).map((category: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                        {tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )
                  })()}

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
                    View
                  </Button>
                </CardContent>
              </Card>
            ))
            )}
          </div>

          {!loading && filteredResources.length === 0 && (
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
        <DialogContent className="max-w-4xl max-h-[90vh] bg-white text-slate-900 border border-slate-200 shadow-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedResource?.title}</DialogTitle>
            <DialogDescription className="mt-2">{selectedResource?.description}</DialogDescription>
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
            
            {selectedResource?.contentType === 'FILE' && (() => {
              const fileUrl = selectedResource?.fileUrl || ''
              const mimeType = selectedResource?.mimeType || ''
              const isImage = mimeType.startsWith('image/')
              const isPDF = mimeType === 'application/pdf'
              const isVideo = mimeType.startsWith('video/')
              
              return (
                <div className="bg-gray-50 rounded-lg p-6">
                  {/* Image Preview */}
                  {isImage && (
                    <div className="mb-4">
                      <img 
                        src={fileUrl} 
                        alt={selectedResource?.fileName}
                        className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  
                  {/* PDF Preview */}
                  {isPDF && (
                    <div className="mb-4">
                      <iframe
                        src={fileUrl}
                        className="w-full h-[600px] border-0 rounded-lg"
                        title={selectedResource?.fileName}
                      />
                    </div>
                  )}
                  
                  {/* Video Preview */}
                  {isVideo && (
                    <div className="mb-4">
                      <video 
                        controls 
                        className="w-full max-h-96 rounded-lg"
                        src={fileUrl}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  
                  {/* File Info for non-previewable files */}
                  {!isImage && !isPDF && !isVideo && (
                    <div className="text-center mb-4">
                      <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    </div>
                  )}
                  
                  {/* File Details */}
                  <div className="text-center">
                    <h3 className="font-medium mb-2">{selectedResource?.fileName}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedResource?.fileSize && `Size: ${(selectedResource.fileSize / 1024 / 1024).toFixed(2)} MB`}
                      {mimeType && ` • ${mimeType.split('/')[1].toUpperCase()}`}
                    </p>
                    <Button asChild>
                      <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Download File
                      </a>
                    </Button>
                  </div>
                </div>
              )
            })()}
            
            {/* Display categories in detail view */}
            {selectedResource?.tags && selectedResource.tags.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedResource.tags.map((category, index) => (
                    <Badge key={index} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
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
