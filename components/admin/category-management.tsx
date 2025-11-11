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
import { IconPicker } from "@/components/ui/icon-picker"
import { ColorPicker } from "@/components/ui/color-picker"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Palette,
  Type,
  BookOpen,
  Users,
  FileText,
  Laptop,
  Library,
  Building,
  Heart,
  Briefcase,
  DollarSign,
  Home,
  Car,
  PartyPopper,
  UserCheck,
  Microscope,
  Globe2,
  GraduationCap,
  Phone,
  Calendar,
  Mail,
  Clock,
  MapPin,
  ExternalLink,
  Search as SearchIcon,
  Settings,
  Shield,
  Star,
} from "lucide-react"
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
  createdAt?: string
  updatedAt?: string
  _count?: {
    resources: number
  }
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [iconOptions, setIconOptions] = useState<string[]>([]);
  const [colorOptions, setColorOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories()
    fetchMeta();
  }, [])

  async function fetchMeta() {
    try {
      const response = await fetch('/api/admin/categories/meta');
      if (!response.ok) {
        throw new Error('Failed to fetch meta');
      }
      const data = await response.json();
      setIconOptions(data.iconOptions);
      setColorOptions(data.colorOptions);
    } catch (error) {
      logger.error('Error fetching meta:', error);
      toast.error('Failed to load meta options');
    }
  }

  async function fetchCategories() {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      logger.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
          logger.error('Failed to update category:', errorData)
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
          logger.error('Failed to create category:', { status: response.status, error: errorData })
          throw new Error(errorData.error || `Failed to create category (${response.status})`)
        }
        
        toast.success('Category created successfully')
      }
      
      await fetchCategories()
      setEditingCategory(null)
      setIsDialogOpen(false)
    } catch (error) {
      logger.error('Error saving category:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save category'
      toast.error(errorMessage)
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) return
    
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to delete category')
      }
      
      toast.success('Category deleted successfully')
      await fetchCategories()
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
          <h2 className="text-2xl font-serif font-bold text-foreground">Category Management</h2>
          <p className="text-muted-foreground">Manage resource categories and their properties</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCategory(null)
                setIsDialogOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <CategoryDialog
            category={editingCategory}
            onSave={handleSaveCategory}
            onCancel={() => {
              setEditingCategory(null)
              setIsDialogOpen(false)
            }}
            iconOptions={iconOptions}
            colorOptions={colorOptions}
          />
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
        <Input
          placeholder="Search categories..."
          className="pl-10 bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder:text-gray-500 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Loading categories...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            {searchQuery ? "No categories found matching your search." : "No categories available."}
          </div>
        ) : (
          filteredCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const iconMap: Record<string, any> = {
                        BookOpen,
                        Users,
                        FileText,
                        Laptop,
                        Library,
                        Building,
                        Heart,
                        Briefcase,
                        DollarSign,
                        Home,
                        Car,
                        PartyPopper,
                        UserCheck,
                        Microscope,
                        Globe2,
                        GraduationCap,
                        Phone,
                        Calendar,
                        Mail,
                        Clock,
                        MapPin,
                        ExternalLink,
                        Search: SearchIcon,
                        Settings,
                        Shield,
                        Star,
                      }
                      const IconComp = iconMap[category.icon || "Globe2"] || Globe2
                      return (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                          {IconComp === Globe2 ? (
                            <span
                              className="w-3.5 h-3.5 rounded-full border"
                              style={{ backgroundColor: category.color || '#3b82f6', borderColor: (category.color || '#d1d5db') as string }}
                            />
                          ) : (
                            <IconComp className="w-4 h-4" style={{ color: category.color || '#3b82f6' }} />
                          )}
                        </div>
                      )
                    })()}
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={category.isActive ? "default" : "secondary"} className="text-xs">
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {category._count?.resources || 0} resources
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingCategory(category)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={!!(category._count?.resources && category._count.resources > 0)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {category.description && (
                  <CardDescription className="text-sm">{category.description}</CardDescription>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                  <span>Order: {category.sortOrder}</span>
                  {category.updatedAt && (
                    <span>Updated {new Date(category.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function CategoryDialog({
  category,
  onSave,
  onCancel,
  iconOptions,
  colorOptions,
}: {
  category: Category | null
  onSave: (data: any) => void
  onCancel: () => void
  iconOptions: string[];
  colorOptions: string[];
}) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    icon: category?.icon || "",
    color: category?.color || "#3b82f6",
    isActive: category?.isActive ?? true,
    sortOrder: category?.sortOrder || 0,
  })

  useEffect(() => {
    setFormData({
      name: category?.name || "",
      description: category?.description || "",
      icon: category?.icon || "",
      color: category?.color || "#3b82f6",
      isActive: category?.isActive ?? true,
      sortOrder: category?.sortOrder || 0,
    })
  }, [category])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{category ? "Edit Category" : "Add New Category"}</DialogTitle>
        <DialogDescription>
          {category ? "Update the category information below." : "Add a new resource category."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Academics"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the category"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <IconPicker
              value={formData.icon}
              onChange={(value) => setFormData({ ...formData, icon: value })}
              icons={iconOptions}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <ColorPicker
              value={formData.color}
              onChange={(value) => setFormData({ ...formData, color: value })}
              colors={colorOptions}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input
              id="sortOrder"
              type="number"
              min="0"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="isActive">Status</Label>
            <Select value={formData.isActive.toString()} onValueChange={(value) => setFormData({ ...formData, isActive: value === "true" })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
