"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Eye, FileText, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import { usePublicArticles, type Article } from "@/hooks/use-articles"
import { notFound } from "next/navigation"

interface ArticlePageProps {
  params: { slug: string }
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const { fetchArticleBySlug } = usePublicArticles()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true)
        const data = await fetchArticleBySlug(params.slug)
        setArticle(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article')
        if (err instanceof Error && err.message.includes('404')) {
          notFound()
        }
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [params.slug, fetchArticleBySlug])

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        })
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8 text-muted-foreground">Loading article...</div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8 text-destructive">
            {error || 'Article not found'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Link href="/articles">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-2">
              {article.category && (
                <Badge variant="secondary" className="text-sm">
                  {article.category}
                </Badge>
              )}
              {article.tags && (
                <div className="flex flex-wrap gap-1">
                  {article.tags.split(',').map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <CardTitle className="text-3xl font-serif leading-tight">
              {article.title}
            </CardTitle>
            
            {article.excerpt && (
              <CardDescription className="text-lg">
                {article.excerpt}
              </CardDescription>
            )}

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

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Article Content */}
        <Card>
          <CardContent className="pt-6">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-base leading-relaxed">
                {article.content}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Image */}
        {article.featuredImage && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="max-w-full h-auto rounded-lg shadow-md"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back to Articles */}
        <div className="text-center">
          <Link href="/articles">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Articles
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
