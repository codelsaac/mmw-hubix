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
import { resourceService, type Resource } from "@/lib/resources"

const resourceCategories = ["Academics", "Student Life", "Resources"]

export function ResourceManagement() {
  const [resources, setResources] = useState<Resource[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const loadedResources = resourceService.getResources()
    setResources(loadedResources)

    // Listen for resource updates from other components
    const handleResourcesUpdated = (event: CustomEvent) => {
      setResources(event.detail)
    }

    window.addEventListener("resourcesUpdated", handleResourcesUpdated as EventListener)
    return () => {
      window.removeEventListener("resourcesUpdated", handleResourcesUpdated as EventListener)
    }
  }, [])

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSaveResource = (resourceData: any) => {
    if (editingResource) {
      const updatedResource = resourceService.updateResource(editingResource.id, resourceData)
      if (updatedResource) {
        setResources(resourceService.getResources())
      }
    } else {
      resourceService.addResource(resourceData)
      setResources(resourceService.getResources())
    }
    setEditingResource(null)
    setIsDialogOpen(false)
  }

  const handleDeleteResource = (id: number) => {
    const success = resourceService.deleteResource(id)
    if (success) {
      setResources(resourceService.getResources())
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-10"
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
                    <span>Updated {resource.lastUpdated}</span>
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
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
