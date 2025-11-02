"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, Link2, Loader2, AlertCircle, ExternalLink } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CustomLink {
  id: string
  name: string
  url: string
  description?: string
  categoryId?: string
  category?: {
    id: string
    name: string
    icon?: string
    color?: string
  }
}

interface Category {
  id: string
  name: string
  icon?: string
  color?: string
}

interface CustomLinkManagerProps {
  trigger?: "button" | "icon"
  className?: string
}

export function CustomLinkManager({ trigger = "button", className = "" }: CustomLinkManagerProps) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [links, setLinks] = useState<CustomLink[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
    categoryId: "",
  })
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  // Load categories
  useEffect(() => {
    if (open) {
      fetchCategories()
      if (session?.user) {
        fetchUserLinks()
      } else {
        loadLocalStorageLinks()
      }
    }
  }, [open, session])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        let serverCategories: Category[] = Array.isArray(data) ? data : (data.categories || [])

        // Merge with local custom categories for non-logged-in users
        if (!session?.user) {
          try {
            const stored = localStorage.getItem("customCategories")
            const localCats: Category[] = stored ? JSON.parse(stored) : []
            // De-duplicate by name
            const names = new Set(serverCategories.map(c => c.name.toLowerCase()))
            const merged = [...serverCategories]
            for (const lc of localCats) {
              if (!names.has(lc.name.toLowerCase())) merged.push(lc)
            }
            setCategories(merged)
          } catch {
            setCategories(serverCategories)
          }
        } else {
          setCategories(serverCategories)
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchUserLinks = async () => {
    try {
      const response = await fetch("/api/user-resources")
      if (response.ok) {
        const data = await response.json()
        setLinks(data.resources || [])
      }
    } catch (error) {
      console.error("Error fetching user links:", error)
    }
  }

  const loadLocalStorageLinks = () => {
    try {
      const stored = localStorage.getItem("customLinks")
      if (stored) {
        setLinks(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error)
    }
  }

  const saveToLocalStorage = (updatedLinks: CustomLink[]) => {
    try {
      localStorage.setItem("customLinks", JSON.stringify(updatedLinks))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent("customLinksUpdated", { detail: updatedLinks }))
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      let finalCategoryId = formData.categoryId

      // Create new category if needed
      if (showNewCategory && newCategoryName.trim()) {
        try {
          if (session?.user) {
            // Create category in DB
            const categoryResponse = await fetch("/api/categories", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: newCategoryName.trim() }),
            })

            if (categoryResponse.ok) {
              const newCategory = await categoryResponse.json()
              finalCategoryId = newCategory.id
              // Refresh categories list
              await fetchCategories()
              setShowNewCategory(false)
              setNewCategoryName("")
            } else {
              const errorData = await categoryResponse.json()
              throw new Error(errorData.error || "Failed to create category")
            }
          } else {
            // Create local category
            const localId = `local-${Date.now()}`
            const newLocal = { id: localId, name: newCategoryName.trim() } as Category
            try {
              const stored = localStorage.getItem("customCategories")
              const list: Category[] = stored ? JSON.parse(stored) : []
              // Avoid duplicates by name (case-insensitive)
              if (!list.find(c => c.name.toLowerCase() === newLocal.name.toLowerCase())) {
                list.push(newLocal)
                localStorage.setItem("customCategories", JSON.stringify(list))
              }
            } catch {}
            // Update state
            setCategories(prev => {
              if (prev.find(c => c.name.toLowerCase() === newLocal.name.toLowerCase())) return prev
              return [...prev, newLocal]
            })
            finalCategoryId = localId
            setShowNewCategory(false)
            setNewCategoryName("")
          }
        } catch (err: any) {
          setError(err.message || "Failed to create category")
          setIsLoading(false)
          return
        }
      }

      if (session?.user) {
        // Logged-in user: Save to database
        const response = await fetch("/api/user-resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, categoryId: finalCategoryId }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to add link")
        }

        setLinks(prev => [data.resource, ...prev])
        setSuccess("Link added successfully!")
      } else {
        // Non-logged-in user: Save to localStorage
        const newLink: CustomLink = {
          id: `local-${Date.now()}`,
          name: formData.name,
          url: formData.url,
          description: formData.description,
          categoryId: finalCategoryId,
          category: categories.find(c => c.id === finalCategoryId),
        }

        const updatedLinks = [newLink, ...links]
        setLinks(updatedLinks)
        saveToLocalStorage(updatedLinks)
        setSuccess("Link added to your browser!")
      }

      // Reset form
      setFormData({
        name: "",
        url: "",
        description: "",
        categoryId: "",
      })
      setShowNewCategory(false)
      setNewCategoryName("")

      // Inform homepage to refresh its data without full reload
      if (!session?.user) {
        try {
          const stored = localStorage.getItem("customLinks")
          const current: CustomLink[] = stored ? JSON.parse(stored) : []
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent("customLinksUpdated", { detail: current }))
          }
        } catch {}
      }
    } catch (err: any) {
      setError(err.message || "Failed to add link")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (linkId: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return

    setIsLoading(true)
    try {
      if (session?.user && !linkId.startsWith("local-")) {
        // Delete from database
        const response = await fetch(`/api/user-resources?id=${linkId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to delete link")
        }

        setLinks(prev => prev.filter(link => link.id !== linkId))
      } else {
        // Delete from localStorage
        const updatedLinks = links.filter(link => link.id !== linkId)
        setLinks(updatedLinks)
        saveToLocalStorage(updatedLinks)
      }

      setSuccess("Link deleted successfully!")
      if (!session?.user) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent("customLinksUpdated", { detail: links }))
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete link")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger === "icon" ? (
          <Button
            variant="outline"
            size="sm"
            className={`h-9 w-9 p-0 rounded-full ${className}`}
            aria-label="Add Custom Link"
            title="Add Custom Link"
          >
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Custom Link
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            My Custom Links
          </DialogTitle>
          <DialogDescription>
            {session?.user
              ? "Add your personal links - visible only to you"
              : "Add custom links (saved in your browser)"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Link Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Link Name *</Label>
              <Input
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., My Google Drive"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                name="url"
                type="url"
                required
                value={formData.url}
                onChange={handleChange}
                placeholder="https://example.com"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of this link"
                disabled={isLoading}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="categoryId">Category</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  disabled={isLoading}
                  className="text-xs h-auto py-1"
                >
                  {showNewCategory ? "Select Existing" : "+ Create New"}
                </Button>
              </div>
              
              {showNewCategory ? (
                <Input
                  id="newCategory"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter new category name"
                  disabled={isLoading}
                />
              ) : (
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Link
                </>
              )}
            </Button>
          </form>

          {/* My Links List */}
          {links.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Your Links ({links.length})</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-start justify-between gap-2 p-3 bg-muted/50 rounded-md"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <p className="font-medium text-sm truncate">{link.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {link.url}
                      </p>
                      {link.description && (
                        <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
                      )}
                      {link.category && (
                        <span className="text-xs text-muted-foreground">
                          Category: {link.category.name}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(link.id)}
                      disabled={isLoading}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!session?.user && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                💡 Your links are saved in your browser. <strong>Sign in</strong> to sync them across devices!
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
