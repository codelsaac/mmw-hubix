"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, AlertTriangle, Info, ArrowRight, Calendar, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import Link from "next/link"

interface Announcement {
  id: string
  title: string
  club: string
  date: Date | string
  time: string
  location: string | null
  description: string | null
  type: string
  status: string
}

interface NotificationItem {
  id: string
  type: "warning" | "info"
  title: string
  message: string
  date?: Date | string
  location?: string | null
}

export function NotificationWidget() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("/api/public/announcements")
        if (response.ok) {
          const data = await response.json()
          // Get the latest 3 announcements
          setAnnouncements(data.slice(0, 3))
        }
      } catch (error) {
        console.error("Failed to fetch announcements:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncements()
  }, [])

  // Convert announcements to notification format
  const notifications: NotificationItem[] = announcements.map((announcement) => ({
    id: announcement.id,
    type: announcement.type === "urgent" ? "warning" : "info",
    title: announcement.title,
    message: announcement.description || `${announcement.club} event`,
    date: announcement.date,
    location: announcement.location,
  }))

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Loading notifications...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-primary" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
          <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No notifications at the moment</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm",
                  notification.type === "warning"
                    ? "bg-orange-50 border-orange-200"
                    : "bg-blue-50 border-blue-200"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {notification.type === "warning" ? (
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                    {notification.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  {notification.date && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(notification.date), "MMM dd, yyyy")}</span>
                    </div>
                  )}
                  {notification.location && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{notification.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <Link href="/activity-news" className="block">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-xs hover:bg-primary/5"
              >
                View All Notifications
                <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  )
}
