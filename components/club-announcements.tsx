"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, ChevronRight } from "lucide-react"
import { useAnnouncements } from "@/hooks/use-announcements"

export function ClubAnnouncements() {
  const { announcements, loading, joinEvent } = useAnnouncements()

  const activeAnnouncements = announcements.filter((a) => a.status === "active")

  if (loading) {
    return (
      <section className="space-y-6" suppressHydrationWarning>
        <div className="flex items-center justify-between" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <h2 className="text-2xl font-serif font-bold text-foreground">Activity News</h2>
            <p className="text-muted-foreground">
              Stay updated with the latest events and activities from school clubs
            </p>
          </div>
        </div>
        <div className="text-center py-8 text-muted-foreground" suppressHydrationWarning>Loading activity news...</div>
      </section>
    )
  }

  return (
    <section className="space-y-6" suppressHydrationWarning>
      <div className="flex items-center justify-between" suppressHydrationWarning>
        <div suppressHydrationWarning>
          <h2 className="text-2xl font-serif font-bold text-foreground">Activity News</h2>
          <p className="text-muted-foreground">Stay updated with the latest events and activities from school clubs</p>
        </div>
        <Button variant="outline" size="sm">
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="grid gap-4" suppressHydrationWarning>
        {activeAnnouncements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" suppressHydrationWarning>No active activity news at the moment.</div>
        ) : (
          activeAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow" suppressHydrationWarning>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between" suppressHydrationWarning>
                  <div className="space-y-1" suppressHydrationWarning>
                    <div className="flex items-center gap-2" suppressHydrationWarning>
                      <Badge variant="secondary" className="text-xs">
                        {announcement.club}
                      </Badge>
                      <Badge variant={announcement.type === "Workshop" ? "default" : "outline"} className="text-xs">
                        {announcement.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-semibold">{announcement.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed">{announcement.description}</CardDescription>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground" suppressHydrationWarning>
                  <div className="flex items-center gap-1" suppressHydrationWarning>
                    <Calendar className="w-4 h-4" />
                    <span suppressHydrationWarning>
                      {new Date(announcement.date).toLocaleDateString()} at {announcement.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1" suppressHydrationWarning>
                    <MapPin className="w-4 h-4" />
                    <span>{announcement.location}</span>
                  </div>
                  <div className="flex items-center gap-1" suppressHydrationWarning>
                    <Users className="w-4 h-4" />
                    <span suppressHydrationWarning>
                      {announcement.attendees}/{announcement.maxAttendees} attending
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2" suppressHydrationWarning>
                  <div className="w-full bg-muted rounded-full h-2" suppressHydrationWarning>
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(announcement.attendees / announcement.maxAttendees) * 100}%` }}
                      suppressHydrationWarning
                    />
                  </div>
                  <Button
                    size="sm"
                    className="ml-4"
                    disabled={announcement.attendees >= announcement.maxAttendees}
                    onClick={() => joinEvent(announcement.id)}
                  >
                    {announcement.attendees >= announcement.maxAttendees ? "Full" : "Join Event"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  )
}
