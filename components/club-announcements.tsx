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
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">Club Announcements</h2>
            <p className="text-muted-foreground">
              Stay updated with the latest events and activities from school clubs
            </p>
          </div>
        </div>
        <div className="text-center py-8 text-muted-foreground">Loading announcements...</div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Club Announcements</h2>
          <p className="text-muted-foreground">Stay updated with the latest events and activities from school clubs</p>
        </div>
        <Button variant="outline" size="sm">
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="grid gap-4">
        {activeAnnouncements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No active announcements at the moment.</div>
        ) : (
          activeAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
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

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(announcement.date).toLocaleDateString()} at {announcement.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{announcement.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {announcement.attendees}/{announcement.maxAttendees} attending
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(announcement.attendees / announcement.maxAttendees) * 100}%` }}
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
