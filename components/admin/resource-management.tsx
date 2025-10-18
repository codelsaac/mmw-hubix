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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, ExternalLink, Search, FolderOpen, Link2 } from "lucide-react"
import { toast } from "sonner"
import { logger } from "@/lib/logger"

interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  isActive: boolean
  sortOrder: number
}

interface Resource {
  id: string
  name: string
  url: string
  description: string
  categoryId: string
  clicks: number
  createdAt?: string
  updatedAt?: string
  category?: {
    id: string
    name: string
    icon?: string
    color?: string
  }
}

export function ResourceManagement() {
  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("resources")

  useEffect(() => {
    fetchResources()
    fetchCategories()
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

  async function fetchCategories() {
    try {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      logger.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || resource.categoryId === selectedCategory
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
      await fetchCategories()
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
      await fetchCategories()
    } catch (error) {
      logger.error('Error deleting resource:', error)
      toast.error('Failed to delete resource')
    }
  }

  async function handleSaveCategory(categoryData: any) {
    try {
      if (editingCategory) {
        // Update existing category
        const response = await fetch('/api/admin/categories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([{ id: editingCategory.id, ...categoryData }])
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.error || 'Failed to update category')
        }
        
        toast.success('Category updated successfully')
      } else {
        // Create new category
        const response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData)
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.error || 'Failed to create category')
        }
        
        toast.success('Category created successfully')
      }
      
      await fetchCategories()
      await fetchResources()
      setEditingCategory(null)
      setIsCategoryDialogOpen(false)
    } catch (error) {
      logger.error('Error saving category:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save category'
      toast.error(errorMessage)
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Are you sure you want to delete this category? You can only delete categories with no resources.')) return
    
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData || 'Failed to delete category')
      }
      
      toast.success('Category deleted successfully')
      await fetchCategories()
      await fetchResources()
    } catch (error) {
      logger.error('Error deleting category:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete category'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Online Resources</h2>
          <p className="text-muted-foreground">Manage homepage resource links and categories</p>
        </div>
        {activeTab === "resources" && (
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
              key={editingResource?.id || 'new'}
              resource={editingResource}
              onSave={handleSaveResource}
              onCancel={() => {
                setEditingResource(null)
                setIsDialogOpen(false)
              }}
              categories={categories}
            />
          </Dialog>
        )}
        {activeTab === "categories" && (
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingCategory(null)
                  setIsCategoryDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <CategoryDialog
              key={editingCategory?.id || 'new'}
              category={editingCategory}
              onSave={handleSaveCategory}
              onCancel={() => {
                setEditingCategory(null)
                setIsCategoryDialogOpen(false)
              }}
            />
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4 mt-6">
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
            {categories.filter(cat => cat.isActive).map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
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
                    <Badge variant="outline" className="text-xs">
                      {resource.category?.name || 'Unknown Category'}
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
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 mt-6">
          {/* Categories Table */}
          <Card>
            <CardHeader>
              <CardTitle>Categories ({categories.length})</CardTitle>
              <CardDescription>Manage resource categories</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading categories...</div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No categories found</div>
              ) : (
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{category.name}</h4>
                        <Badge variant={category.isActive ? "default" : "secondary"} className="text-xs">
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {category.color && (
                          <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: category.color }} />
                        )}
                      </div>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Sort Order: {category.sortOrder}</span>
                        {(category as any)._count?.resources !== undefined && (
                          <span>{(category as any)._count.resources} resources</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category)
                          setIsCategoryDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={(category as any)._count?.resources > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CategoryDialog({
  category,
  onSave,
  onCancel,
}: {
  category: Category | null
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    icon: category?.icon || "",
    color: category?.color || "#3b82f6",
    isActive: category?.isActive ?? true,
    sortOrder: category?.sortOrder ?? 0,
  })

  useEffect(() => {
    setFormData({
      name: category?.name || "",
      description: category?.description || "",
      icon: category?.icon || "",
      color: category?.color || "#3b82f6",
      isActive: category?.isActive ?? true,
      sortOrder: category?.sortOrder ?? 0,
    });
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{category ? "Edit Category" : "Add New Category"}</DialogTitle>
        <DialogDescription>
          {category ? "Update the category information below." : "Add a new category for organizing resources."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category-name">Category Name</Label>
          <Input
            id="category-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Academic, Student Services"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category-description">Description</Label>
          <Textarea
            id="category-description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the category"
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category-color">Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="category-color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-sortOrder">Sort Order</Label>
            <Input
              id="category-sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              min="0"
              required
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="category-isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <Label htmlFor="category-isActive" className="font-normal cursor-pointer">
            Active (visible to users)
          </Label>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{category ? "Update" : "Add"} Category</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

function ResourceDialog({
  resource,
  onSave,
  onCancel,
  categories,
}: {
  resource: Resource | null
  onSave: (data: any) => void
  onCancel: () => void
  categories: Category[]
}) {
  console.log("ResourceDialog categories:", categories);
  const [formData, setFormData] = useState({
    name: resource?.name || "",
    url: resource?.url || "",
    description: resource?.description || "",
    categoryId: resource?.categoryId || "",
  })

  useEffect(() => {
    setFormData({
      name: resource?.name || "",
      url: resource?.url || "",
      description: resource?.description || "",
      categoryId: resource?.categoryId || "",
    });
  }, [resource]);

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
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.filter(cat => cat.isActive).map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
