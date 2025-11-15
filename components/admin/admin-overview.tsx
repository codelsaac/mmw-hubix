"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, FileText, Calendar, PlayCircle, Activity, Shield, BookOpen, Tag } from "lucide-react"
import NextLink from "next/link"
import { useState, useEffect } from "react"

import { useTraining } from "@/hooks/use-training"

interface AdminStats {
  title: string
  value: string
  description: string
  icon: any
  trend: string
  href: string
}

const useAdminStats = () => {
  const { resources } = useTraining()
  const [stats, setStats] = useState<AdminStats[]>([
    {
      title: "Resource Links",
      value: "0",
      description: "Active homepage links",
      icon: PlayCircle,
      trend: "Loading...",
      href: "/admin/resources",
    },
    {
      title: "Categories",
      value: "0",
      description: "Resource categories",
      icon: Tag,
      trend: "Loading...",
      href: "/admin/categories",
    },
    {
      title: "Activity",
      value: "0",
      description: "Published club events",
      icon: FileText,
      trend: "Loading...",
      href: "/admin/announcements",
    },
    {
      title: "Articles",
      value: "0",
      description: "Published articles",
      icon: BookOpen,
      trend: "Loading...",
      href: "/admin/articles",
    },
    {
      title: "Training Resources",
      value: resources.length.toString(),
      description: "Available resources",
      icon: Calendar,
      trend: resources.length > 0 ? `${resources.length} resources uploaded` : "No resources uploaded",
      href: "/dashboard/training",
    },
  ])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all data in parallel
        const [resourcesRes, categoriesRes, announcementsRes, articlesRes] = await Promise.all([
          fetch('/api/resources'),
          fetch('/api/categories'),
          fetch('/api/announcements'),
          fetch('/api/public/articles')
        ])

        // Parse responses
        const [resourcesData, categoriesData, announcementsData, articlesData] = await Promise.all([
          resourcesRes.ok ? resourcesRes.json() : [],
          categoriesRes.ok ? categoriesRes.json() : [],
          announcementsRes.ok ? announcementsRes.json() : [],
          articlesRes.ok ? articlesRes.json() : []
        ])

        // Calculate stats
        const activeResources = Array.isArray(resourcesData) ? resourcesData.filter((r: any) => r.status === 'active').length : 0
        const activeCategories = Array.isArray(categoriesData) ? categoriesData.length : 0
        const activeAnnouncements = Array.isArray(announcementsData) ? announcementsData.filter((a: any) => a.status === 'active').length : 0
        const publishedArticles = articlesData.articles ? articlesData.articles.length : 0

        // Update stats
        setStats([
          {
            title: "Resource Links",
            value: activeResources.toString(),
            description: "Active homepage links",
            icon: PlayCircle,
            trend: activeResources > 0 ? `${activeResources} links configured` : "No links configured",
            href: "/admin/resources",
          },
          {
            title: "Categories",
            value: activeCategories.toString(),
            description: "Resource categories",
            icon: Tag,
            trend: activeCategories > 0 ? `${activeCategories} categories configured` : "No categories configured",
            href: "/admin/categories",
          },
          {
            title: "Activity",
            value: activeAnnouncements.toString(),
            description: "Published club events",
            icon: FileText,
            trend: activeAnnouncements > 0 ? `${activeAnnouncements} announcements` : "No announcements",
            href: "/admin/announcements",
          },
          {
            title: "Articles",
            value: publishedArticles.toString(),
            description: "Published articles",
            icon: BookOpen,
            trend: publishedArticles > 0 ? `${publishedArticles} articles published` : "No articles published",
            href: "/admin/articles",
          },
          {
            title: "Training Resources",
            value: resources.length.toString(),
            description: "Available resources",
            icon: Calendar,
            trend: resources.length > 0 ? `${resources.length} resources uploaded` : "No resources uploaded",
            href: "/dashboard/training",
          },
        ])
      } catch (error) {
        console.error('Error fetching admin stats:', error)
        // Keep default values on error
      }
    }

    fetchStats()
  }, [resources.length])

  return stats
}


export function AdminOverview() {
  const adminStats = useAdminStats()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage all aspects of the MMW Hubix portal</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminStats.map((stat: any) => (
          <NextLink key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <p className="text-xs text-primary mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          </NextLink>
        ))}
      </div>

    </div>
  )
}
