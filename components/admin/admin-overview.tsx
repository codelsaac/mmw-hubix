"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Users, FileText, Calendar, PlayCircle, Activity, Shield, Link, Video } from "lucide-react"
import NextLink from "next/link"
import { useEffect, useState } from "react"

interface AdminStats {
  announcements: {
    total: number
    published: number
    pending: number
  }
  resources: {
    total: number
    active: number
  }
  users: {
    total: number
    admins: number
    prefects: number
  }
  trainingVideos: {
    total: number
    active: number
  }
}

interface RecentActivity {
  id: string
  type: string
  title: string
  description: string
  user: string
  time: string
  status: string
}

export function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, activityResponse] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/recent-activity')
        ])

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        if (activityResponse.ok) {
          const activityData = await activityResponse.json()
          setRecentActivity(activityData)
        }
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Unable to load admin data</CardTitle>
            <CardDescription>Please try refreshing the page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const adminStats = [
    {
      title: "Resource Links",
      value: stats.resources.total.toString(),
      description: "Total resources",
      icon: Link,
      trend: `${stats.resources.active} active`,
      href: "/admin/resources",
    },
    {
      title: "Announcements",
      value: stats.announcements.total.toString(),
      description: "Total announcements",
      icon: FileText,
      trend: `${stats.announcements.pending} pending`,
      href: "/admin/announcements",
    },
    {
      title: "Team Members",
      value: stats.users.total.toString(),
      description: "IT Prefect members",
      icon: Users,
      trend: `${stats.users.admins} admins`,
      href: "/admin/users",
    },
    {
      title: "Training Videos",
      value: stats.trainingVideos.total.toString(),
      description: "Available videos",
      icon: Video,
      trend: `${stats.trainingVideos.active} active`,
      href: "/dashboard/training",
    },
  ]

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
        {adminStats.map((stat) => (
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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Admin Activity
          </CardTitle>
          <CardDescription>Latest content management actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <Badge
                      variant={
                        activity.status === "completed"
                          ? "default"
                          : activity.status === "published"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    by {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity to display
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <NextLink href="/admin/resources">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Link className="w-4 h-4 mr-2" />
                Manage Resources
              </Button>
            </NextLink>
            <NextLink href="/admin/announcements">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="w-4 h-4 mr-2" />
                Manage Events
              </Button>
            </NextLink>
            <NextLink href="/admin/users">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </NextLink>
            <NextLink href="/admin/settings">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </NextLink>
            <NextLink href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Activity className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </NextLink>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
