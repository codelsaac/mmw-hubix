"use client"

import Link from "next/link"
import { useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTraining } from "@/hooks/use-training"
import { useCalendar, type CalendarEvent } from "@/hooks/use-calendar"
import type { TrainingResource } from "@/lib/training"
import {
  Calendar,
  CalendarClock,
  File,
  FileText,
  Monitor,
  Megaphone,
  PlayCircle,
  Users,
  Video,
  Heart,
  Wrench,
  GraduationCap,
} from "lucide-react"

const HERO_IMAGE: string | null = "/windows-computer.png"

const EVENT_TYPE_META: Record<CalendarEvent["eventType"], {
  label: string
  icon: typeof Users
  accent: string
  badge: string
}> = {
  meeting: {
    label: "Meeting",
    icon: Users,
    accent: "bg-sky-100 text-sky-700",
    badge: "border-sky-100 text-sky-700",
  },
  training: {
    label: "Training",
    icon: GraduationCap,
    accent: "bg-emerald-100 text-emerald-700",
    badge: "border-emerald-100 text-emerald-700",
  },
  maintenance: {
    label: "Maintenance",
    icon: Wrench,
    accent: "bg-amber-100 text-amber-700",
    badge: "border-amber-100 text-amber-700",
  },
  orientation: {
    label: "Orientation",
    icon: CalendarClock,
    accent: "bg-fuchsia-100 text-fuchsia-700",
    badge: "border-fuchsia-100 text-fuchsia-700",
  },
  general: {
    label: "General",
    icon: Megaphone,
    accent: "bg-slate-100 text-slate-700",
    badge: "border-slate-200 text-slate-700",
  },
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
})

function getEventMeta(eventType: CalendarEvent["eventType"] | undefined) {
  return EVENT_TYPE_META[eventType ?? "general"] ?? EVENT_TYPE_META.general
}

function formatEventDateRange(event: CalendarEvent) {
  const start = event.startTime ? new Date(event.startTime) : null
  const end = event.endTime ? new Date(event.endTime) : null

  if (!start) return "Date TBA"

  const base = dateFormatter.format(start)
  if (!end) {
    return `${base} · ${timeFormatter.format(start)}`
  }

  const sameDay = start.toDateString() === end.toDateString()
  if (sameDay) {
    return `${base} · ${timeFormatter.format(start)} – ${timeFormatter.format(end)}`
  }

  return `${base} – ${dateFormatter.format(end)}`
}

function resourceIcon(resource: TrainingResource) {
  if (resource.contentType === "VIDEO") return Video
  if (resource.contentType === "TEXT") return FileText
  return File
}

export function ItPerfectHub() {
  const { resources, loading } = useTraining()
  const { events: calendarEvents, loading: calendarLoading } = useCalendar()

  const latestResources = useMemo(() => {
    if (!resources || resources.length === 0) return [] as TrainingResource[]
    const sorted = [...resources].sort((a, b) => {
      const aDate = a.dateAdded ? new Date(a.dateAdded).getTime() : 0
      const bDate = b.dateAdded ? new Date(b.dateAdded).getTime() : 0
      return bDate - aDate
    })
    return sorted.slice(0, 4)
  }, [resources])

  const recentCalendarEvents = useMemo(() => {
    if (!calendarEvents || calendarEvents.length === 0) return [] as CalendarEvent[]
    const sorted = [...calendarEvents].sort((a, b) => {
      const aTime = a.startTime ? new Date(a.startTime).getTime() : 0
      const bTime = b.startTime ? new Date(b.startTime).getTime() : 0
      return bTime - aTime
    })
    return sorted.slice(0, 3)
  }, [calendarEvents])

  return (
    <div className="space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-sky-50 via-slate-50 to-sky-100 p-6 lg:p-10">
          {HERO_IMAGE && (
            <div className="pointer-events-none absolute inset-0">
              <div
                className="h-full w-full bg-cover bg-center opacity-70"
                style={{ backgroundImage: `url(${HERO_IMAGE})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-sky-50/95 via-sky-50/70 to-slate-50/95" />
            </div>
          )}
          {!HERO_IMAGE && (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.2),transparent_55%)]" />
          )}

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center">
            <div className="max-w-xl space-y-4">
              <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground sm:text-4xl">
                IT Perfect Hub
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                IT Perfect is our student IT team. We help teachers and students use classroom equipment, support school
                events, and create IT promotional content for the whole campus.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard/training">
                  <Button size="sm">Browse Learning Resources</Button>
                </Link>
                <Link href="/dashboard/history">
                  <Button size="sm" variant="outline">
                    View Event History
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center gap-4">
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/80 shadow-lg"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Monitor className="h-8 w-8 text-sky-600" />
              </motion.div>
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/80 shadow-lg"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Heart className="h-8 w-8 text-rose-500" />
              </motion.div>
              <motion.div
                className="hidden h-20 w-20 items-center justify-center rounded-2xl bg-white/80 shadow-lg sm:flex"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Megaphone className="h-8 w-8 text-emerald-600" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">What&apos;s New in IT Perfect</h3>
          <p className="text-xs text-muted-foreground">Recent activities and learning resources for the team.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-card/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Recent Moments
              </CardTitle>
              <Link href="/dashboard/history" className="text-xs font-medium text-primary hover:underline">
                View full history
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {calendarLoading && <p className="text-xs text-muted-foreground">Loading calendar events...</p>}
              {!calendarLoading && recentCalendarEvents.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No calendar activity yet. Add an event to see it appear here.
                </p>
              )}
              {!calendarLoading &&
                recentCalendarEvents.map((event) => {
                  const meta = getEventMeta(event.eventType)
                  const Icon = meta.icon
                  const startTime = event.startTime ? new Date(event.startTime) : null

                  return (
                    <div
                      key={event.id}
                      className="flex gap-3 rounded-lg border bg-background/60 p-3 hover:border-primary/60 transition"
                    >
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-md ${meta.accent}`}
                        aria-hidden
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {startTime && (
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${meta.badge}`}>
                              {startTime.getFullYear()}
                            </Badge>
                          )}
                          <p className="text-sm font-medium leading-tight">{event.title}</p>
                          {event.isInternal && (
                            <Badge variant="secondary" className="text-[10px]">Internal</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {meta.label} · {formatEventDateRange(event)}
                        </p>
                        {event.location && (
                          <p className="text-xs text-muted-foreground">Location: {event.location}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PlayCircle className="h-4 w-4" />
                Latest Learning Resources
              </CardTitle>
              <Link href="/dashboard/training" className="text-xs font-medium text-primary hover:underline">
                Browse all resources
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading && <p className="text-xs text-muted-foreground">Loading resources...</p>}
              {!loading && latestResources.length === 0 && (
                <p className="text-xs text-muted-foreground">No learning resources have been added yet.</p>
              )}
              {!loading &&
                latestResources.map((resource) => {
                  const Icon = resourceIcon(resource)
                  return (
                    <div
                      key={resource.id}
                      className="flex items-start gap-3 rounded-lg border bg-background/60 p-2 hover:border-primary/60 transition"
                    >
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-tight line-clamp-1">{resource.title}</p>
                        {resource.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{resource.description}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
