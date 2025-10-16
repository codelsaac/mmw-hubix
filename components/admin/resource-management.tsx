"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, ExternalLink, Search } from "lucide-react"
import { toast } from "sonner"
import { logger } from "@/lib/logger"

const resourceCategories = ["Academics", "Student Life", "Resources"]

interface Resource {
  id: string
  name: string
  url: string
  description: string
  category: string
  status: "active" | "maintenance" | "inactive"
  clicks: number
  createdAt?: string
  updatedAt?: string
}

export function ResourceManagement() {
  const [resources, setResources] = useState<Resource[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchResources()
  }, [])

  async function fetchResources() {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/resources')
      if (!response.ok) {
        throw new Error('Failed to fetch resources')
      }
      const data = await response.json()
      setResources(data)
    } catch (error) {
      logger.error('Error fetching resources:', error)
      toast.error('Failed to load resources')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  async function handleSaveResource(resourceData: any) {
    try {
      if (editingResource) {
        // Update existing resource
        const response = await fetch('/api/admin/resources', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([{ id: editingResource.id, ...resourceData }])
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          logger.error('Failed to update resource:', errorData)
          throw new Error(errorData.error || 'Failed to update resource')
        }
        
        toast.success('Resource updated successfully')
      } else {
        // Create new resource
        const response = await fetch('/api/admin/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resourceData)
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          logger.error('Failed to create resource:', { status: response.status, error: errorData })
          throw new Error(errorData.error || `Failed to create resource (${response.status})`)
        }
        
        toast.success('Resource created successfully')
      }
      
      await fetchResources()
      setEditingResource(null)
      setIsDialogOpen(false)
    } catch (error) {
      logger.error('Error saving resource:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save resource'
      toast.error(errorMessage)
    }
  }

  async function handleDeleteResource(id: string) {
    if (!confirm('Are you sure you want to delete this resource?')) return
    
    try {
      const response = await fetch('/api/admin/resources', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete resource')
      }
      
      toast.success('Resource deleted successfully')
      await fetchResources()
    } catch (error) {
      logger.error('Error deleting resource:', error)
      toast.error('Failed to delete resource')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Resource Management</h2>
          <p className="text-muted-foreground">Manage homepage resource links and categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingResource(null)
                setIsDialogOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <ResourceDialog
            resource={editingResource}
            onSave={handleSaveResource}
            onCancel={() => {
              setEditingResource(null)
              setIsDialogOpen(false)
            }}
          />
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
          <Input
            placeholder="Search resources..."
            className="pl-10 bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder:text-gray-500 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {resourceCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Links ({filteredResources.length})</CardTitle>
          <CardDescription>Manage all homepage resource links</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading resources...</div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No resources found</div>
          ) : (
          <div className="space-y-4">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{resource.name}</h4>
                    <Badge variant={resource.status === "active" ? "default" : "secondary"} className="text-xs">
                      {resource.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {resource.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {resource.url}
                    </span>
                    <span>{resource.clicks} clicks</span>
                    <span>Updated {resource.updatedAt ? new Date(resource.updatedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingResource(resource)
                      setIsDialogOpen(true)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteResource(resource.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ResourceDialog({
  resource,
  onSave,
  onCancel,
}: {
  resource: Resource | null
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: resource?.name || "",
    url: resource?.url || "",
    description: resource?.description || "",
    category: resource?.category || "Academics",
    status: resource?.status || "active",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{resource ? "Edit Resource" : "Add New Resource"}</DialogTitle>
        <DialogDescription>
          {resource ? "Update the resource information below." : "Add a new resource link to the homepage."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Resource Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Student Portal"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the resource"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {resourceCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' | 'maintenance' })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{resource ? "Update" : "Add"} Resource</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
