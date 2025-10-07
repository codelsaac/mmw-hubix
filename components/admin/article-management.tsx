"use client"

import type React from "react"
import { useState } from "react"
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
import { Plus, Edit, Trash2, Calendar, Eye, Search, FileText } from "lucide-react"
import { useArticles, type Article, type ArticleFormData } from "@/hooks/use-articles"

const categoryOptions = ["Technology", "Science", "Education", "News", "General"]
const statusOptions = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
]

export function ArticleManagement() {
  const { articles, loading, addArticle, updateArticle, deleteArticle } = useArticles()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || article.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleSaveArticle = async (articleData: ArticleFormData) => {
    try {
      if (editingArticle) {
        await updateArticle(editingArticle.id, articleData)
      } else {
        await addArticle(articleData)
      }
      setEditingArticle(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving article:', error)
    }
  }

  const handleDeleteArticle = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(id)
      } catch (error) {
        console.error('Error deleting article:', error)
      }
    }
  }

  const handleStatusChange = async (id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
    try {
      await updateArticle(id, { status })
    } catch (error) {
      console.error('Error updating article status:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">Article Management</h2>
            <p className="text-muted-foreground">Manage published articles and content</p>
          </div>
        </div>
        <div className="text-center py-8 text-muted-foreground">Loading articles...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Article Management</h2>
          <p className="text-muted-foreground">Manage published articles and content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingArticle(null)
                setIsDialogOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Article
            </Button>
          </DialogTrigger>
          <ArticleDialog
            article={editingArticle}
            onSave={handleSaveArticle}
            onCancel={() => {
              setEditingArticle(null)
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
            placeholder="Search articles..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery || selectedStatus !== "all" ? "No articles match your filters." : "No articles yet."}
          </div>
        ) : (
          filteredArticles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {article.category && (
                        <Badge variant="secondary" className="text-xs">
                          {article.category}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          article.status === "PUBLISHED"
                            ? "default"
                            : article.status === "ARCHIVED"
                              ? "destructive"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {article.status}
                      </Badge>
                      {article.isPublic && (
                        <Badge variant="outline" className="text-xs">
                          Public
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    {article.excerpt && (
                      <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingArticle(article)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteArticle(article.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {article.publishedAt 
                        ? `Published ${new Date(article.publishedAt).toLocaleDateString()}`
                        : `Created ${new Date(article.createdAt).toLocaleDateString()}`
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{article.views} views</span>
                  </div>
                  {article.creator && (
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>By {article.creator.name || article.creator.username}</span>
                    </div>
                  )}
                </div>

                {article.tags && (
                  <div className="flex flex-wrap gap-1">
                    {article.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Slug: {article.slug}
                  </div>
                  <div className="flex items-center gap-2">
                    {article.status === "DRAFT" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(article.id, "PUBLISHED")}
                      >
                        Publish
                      </Button>
                    )}
                    {article.status === "PUBLISHED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(article.id, "ARCHIVED")}
                      >
                        Archive
                      </Button>
                    )}
                    {article.status === "ARCHIVED" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(article.id, "PUBLISHED")}
                      >
                        Republish
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function ArticleDialog({
  article,
  onSave,
  onCancel,
}: {
  article: Article | null
  onSave: (data: ArticleFormData) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<ArticleFormData>({
    title: article?.title || "",
    content: article?.content || "",
    excerpt: article?.excerpt || "",
    status: article?.status || "DRAFT",
    isPublic: article?.isPublic ?? true,
    tags: article?.tags || "",
    category: article?.category || "",
    featuredImage: article?.featuredImage || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{article ? "Edit Article" : "Add New Article"}</DialogTitle>
        <DialogDescription>
          {article ? "Update the article details below." : "Create a new article."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Article Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Introduction to Web Development"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: "DRAFT" | "PUBLISHED" | "ARCHIVED") => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="Brief description of the article..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write your article content here..."
            rows={10}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="e.g., web development, tutorial, beginner"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="featuredImage">Featured Image URL</Label>
          <Input
            id="featuredImage"
            value={formData.featuredImage}
            onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="isPublic">Make this article public</Label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{article ? "Update" : "Create"} Article</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
