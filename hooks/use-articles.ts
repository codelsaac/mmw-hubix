"use client"

import { useState, useEffect, useCallback } from 'react'

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  isPublic: boolean
  publishedAt?: string
  views: number
  tags?: string
  featuredImage?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
  creator?: {
    id: string
    name?: string
    username: string
  }
}

export interface ArticleFormData {
  title: string
  content: string
  excerpt?: string
  isPublic: boolean
  tags?: string
  featuredImage?: string
}

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/articles')
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles')
      }
      
      const data = await response.json()
      setArticles(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const addArticle = async (articleData: ArticleFormData) => {
    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      })

      if (!response.ok) {
        throw new Error('Failed to create article')
      }

      const newArticle = await response.json()
      setArticles(prev => [newArticle, ...prev])
      return newArticle
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create article')
      throw err
    }
  }

  const updateArticle = async (id: string, articleData: Partial<ArticleFormData>) => {
    try {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      })

      if (!response.ok) {
        throw new Error('Failed to update article')
      }

      const updatedArticle = await response.json()
      setArticles(prev => prev.map(article => 
        article.id === id ? updatedArticle : article
      ))
      return updatedArticle
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update article')
      throw err
    }
  }

  const deleteArticle = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete article')
      }

      setArticles(prev => prev.filter(article => article.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete article')
      throw err
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  return {
    articles,
    loading,
    error,
    addArticle,
    updateArticle,
    deleteArticle,
    refetch: fetchArticles,
  }
}

export function usePublicArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  const fetchArticles = useCallback(async (page = 1, limit = 10, category?: string, search?: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      
      if (category) params.append('category', category)
      if (search) params.append('search', search)

      const response = await fetch(`/api/public/articles?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles')
      }
      
      const data = await response.json()
      setArticles(data.articles)
      setPagination(data.pagination)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchArticleBySlug = useCallback(async (slug: string) => {
    try {
      const response = await fetch(`/api/public/articles/${slug}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch article')
      }
      
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch article')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  return {
    articles,
    loading,
    error,
    pagination,
    fetchArticles,
    fetchArticleBySlug,
  }
}
