"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, Eye, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { usePublicArticles, type Article } from "@/hooks/use-articles"

const categoryOptions = ["Technology", "Science", "Education", "News", "General"]

export default function ArticlesPage() {
  const { articles, loading, error, pagination, fetchArticles } = usePublicArticles()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const handleSearch = () => {
    setCurrentPage(1)
    fetchArticles(1, 10, selectedCategory === "all" ? undefined : selectedCategory, searchQuery || undefined)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
    fetchArticles(1, 10, category === "all" ? undefined : category, searchQuery || undefined)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchArticles(page, 10, selectedCategory === "all" ? undefined : selectedCategory, searchQuery || undefined)
  }

  useEffect(() => {
    handleSearch()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8 text-muted-foreground">Loading articles...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8 text-destructive">
            Error loading articles: {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Articles</h1>
            <p className="text-muted-foreground">Explore our published articles and content</p>
          </div>
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
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryOptions.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>
            Search
          </Button>
        </div>

        {/* Articles List */}
        <div className="space-y-6">
          {articles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || selectedCategory !== "all" ? "No articles match your filters." : "No articles published yet."}
            </div>
          ) : (
            articles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {article.category && (
                        <Badge variant="secondary" className="text-xs">
                          {article.category}
                        </Badge>
                      )}
                      {article.tags && (
                        <div className="flex flex-wrap gap-1">
                          {article.tags.split(',').slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl">
                      <Link 
                        href={`/articles/${article.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {article.title}
                      </Link>
                    </CardTitle>
                    {article.excerpt && (
                      <CardDescription className="text-base line-clamp-2">
                        {article.excerpt}
                      </CardDescription>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {article.publishedAt 
                          ? new Date(article.publishedAt).toLocaleDateString()
                          : new Date(article.createdAt).toLocaleDateString()
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
                  
                  <Link href={`/articles/${article.slug}`}>
                    <Button variant="outline" size="sm">
                      Read More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.pages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
