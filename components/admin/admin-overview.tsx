"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Users, FileText, Calendar, PlayCircle, Activity, Shield, BookOpen, Tag } from "lucide-react"
import NextLink from "next/link"

import { useTraining } from "@/hooks/use-training"

const useAdminStats = () => {
  const { resources } = useTraining()
  
  return [
    {
      title: "Resource Links",
      value: "0",
      description: "Active homepage links",
      icon: PlayCircle,
      trend: "No links configured",
      href: "/admin/resources",
    },
    {
      title: "Categories",
      value: "0",
      description: "Resource categories",
      icon: Tag,
      trend: "No categories configured",
      href: "/admin/categories",
    },
    {
      title: "Announcements",
      value: "0",
      description: "Published club events",
      icon: FileText,
      trend: "No announcements",
      href: "/admin/announcements",
    },
    {
      title: "Articles",
      value: "0",
      description: "Published articles",
      icon: BookOpen,
      trend: "No articles published",
      href: "/admin/articles",
    },
    {
      title: "Team Members",
      value: "6",
      description: "Active IT Prefects",
      icon: Users,
      trend: "Demo accounts active",
      href: "/admin/users",
    },
    {
      title: "Training Resources",
      value: resources.length.toString(),
      description: "Available resources",
      icon: Calendar,
      trend: resources.length > 0 ? `${resources.length} resources uploaded` : "No resources uploaded",
      href: "/dashboard/training",
    },
  ]
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
