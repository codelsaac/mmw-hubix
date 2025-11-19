"use client"

import Link from "next/link"
import { useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTraining } from "@/hooks/use-training"
import type { TrainingResource } from "@/lib/training"
import { Calendar, File, FileText, Monitor, Mic, Megaphone, PlayCircle, Video, Heart } from "lucide-react"

const HERO_IMAGE: string | null = "/windows-computer.png"

const RECENT_MOMENTS = [
  {
    id: "open-day",
    year: "2024",
    title: "Open Day AV Support",
    description: "Managed projection and sound for the open day programme.",
    imageUrl: "/windows-computer.png",
  },
  {
    id: "hall-upgrade",
    year: "2023",
    title: "Assembly Hall Upgrade",
    description: "Helped test the new projector and display setup in the hall.",
    imageUrl: "/security-lock.png",
  },
  {
    id: "promotion-week",
    year: "2023",
    title: "IT Promotion Week",
    description: "Prepared looping slides and visuals for IT promotion.",
    imageUrl: "/icon2.png",
  },
]

function resourceIcon(resource: TrainingResource) {
  if (resource.contentType === "VIDEO") return Video
  if (resource.contentType === "TEXT") return FileText
  return File
}

export function ItPerfectHub() {
  const { resources, loading } = useTraining()

  const latestResources = useMemo(() => {
    if (!resources || resources.length === 0) return [] as TrainingResource[]
    const sorted = [...resources].sort((a, b) => {
      const aDate = a.dateAdded ? new Date(a.dateAdded).getTime() : 0
      const bDate = b.dateAdded ? new Date(b.dateAdded).getTime() : 0
      return bDate - aDate
    })
    return sorted.slice(0, 4)
  }, [resources])

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
              {RECENT_MOMENTS.map((event) => (
                <div
                  key={event.id}
                  className="flex gap-3 rounded-lg border bg-background/60 p-2 hover:border-primary/60 transition"
                >
                  <div className="relative h-14 w-20 overflow-hidden rounded-md bg-muted">
                    <img src={event.imageUrl} alt={event.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {event.year}
                      </Badge>
                      <p className="text-sm font-medium leading-tight">{event.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                  </div>
                </div>
              ))}
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
