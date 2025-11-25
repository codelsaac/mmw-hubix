"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, ChevronRight } from "lucide-react"
import { useActivityNews } from "@/hooks/use-activity-news"
import { UnifiedLoader } from "@/components/unified-loader"
import { COMPONENT_VARIANTS, getStaggerDelay, ANIMATION_TIMING } from "@/lib/animations"

export function ClubAnnouncements() {
  const { activityNews, loading, joinEvent } = useActivityNews()

  const activeActivityNews = activityNews.filter((a) => a.status === "active")

  if (loading) {
    return (
      <section id="activity-news" className="space-y-6 scroll-mt-20 md:scroll-mt-24" suppressHydrationWarning>
        <div className="flex items-center justify-between" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <h2 className="text-xl font-serif font-bold text-foreground">Activity News</h2>
            <p className="text-muted-foreground">
              Stay updated with the latest events and activities from school clubs
            </p>
          </div>
        </div>
        <UnifiedLoader type="pulse" text="Loading activity news..." />
      </section>
    )
  }

  return (
    <motion.section
      id="activity-news"
      variants={COMPONENT_VARIANTS.slideUp}
      initial="initial"
      animate="animate"
      className="space-y-6 scroll-mt-20 md:scroll-mt-24"
      suppressHydrationWarning
    >
      <motion.div
        variants={COMPONENT_VARIANTS.slideLeft}
        initial="initial"
        animate="animate"
        className="flex items-center justify-between"
        suppressHydrationWarning
      >
        <div suppressHydrationWarning>
          <h2 className="text-2xl font-serif font-bold text-foreground">Activity News</h2>
          <p className="text-muted-foreground">Stay updated with the latest events and activities from school clubs</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" size="sm" className="transition-shadow duration-300 hover:shadow-md">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>
      </motion.div>

      <div className="grid gap-4" suppressHydrationWarning>
        {activeActivityNews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" suppressHydrationWarning>No active activity news at the moment.</div>
        ) : (
          activeActivityNews.map((activityNews, index) => (
            <motion.div
              key={activityNews.id}
              variants={COMPONENT_VARIANTS.slideUp}
              initial="initial"
              animate="animate"
              transition={{ delay: getStaggerDelay(index, ANIMATION_TIMING.STAGGER_LARGE) }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary/30" suppressHydrationWarning>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between" suppressHydrationWarning>
                  <div className="space-y-1" suppressHydrationWarning>
                    <div className="flex items-center gap-2" suppressHydrationWarning>
                      <Badge variant="secondary" className="text-xs">
                        {activityNews.club}
                      </Badge>
                      <Badge variant={activityNews.type === "Workshop" ? "default" : "outline"} className="text-xs">
                        {activityNews.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-semibold">{activityNews.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed">{activityNews.description}</CardDescription>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground" suppressHydrationWarning>
                  <div className="flex items-center gap-1" suppressHydrationWarning>
                    <Calendar className="w-4 h-4" />
                    <span suppressHydrationWarning>
                      {new Date(activityNews.date).toLocaleDateString()} at {activityNews.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1" suppressHydrationWarning>
                    <MapPin className="w-4 h-4" />
                    <span>{activityNews.location}</span>
                  </div>
                  <div className="flex items-center gap-1" suppressHydrationWarning>
                    <Users className="w-4 h-4" />
                    <span suppressHydrationWarning>
                      {activityNews.attendees}/{activityNews.maxAttendees} attending
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2" suppressHydrationWarning>
                  <div className="w-full bg-muted rounded-full h-2" suppressHydrationWarning>
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(activityNews.attendees / activityNews.maxAttendees) * 100}%` }}
                      suppressHydrationWarning
                    />
                  </div>
                  <Button
                    size="sm"
                    className="ml-4 transition-all duration-300 hover:scale-105"
                    disabled={activityNews.attendees >= activityNews.maxAttendees}
                    onClick={() => joinEvent(activityNews.id)}
                  >
                    {activityNews.attendees >= activityNews.maxAttendees ? "Full" : "Join Event"}
                  </Button>
                </div>
              </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.section>
  )
}
