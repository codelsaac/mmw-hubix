"use client"

import type { FormEvent } from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useHistoryEvents } from "@/hooks/use-history-events"
import { useAuth } from "@/hooks/use-auth"
import type { CreateHistoryEventRequest, HistoryEventItem } from "@/lib/history-events"
import { CalendarDays, Clock, MapPin, Sparkles, Pencil, Plus, Trash2 } from "lucide-react"

type HistoryFormValues = {
  title: string
  description: string
  date: string
  location: string
  imageUrl: string
  tags: string
}

export function ItPerfectHistory() {
  const { events, loading, addEvent, updateEvent, deleteEvent } = useHistoryEvents()
  const { isAdmin, isHelper } = useAuth()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<HistoryEventItem | null>(null)
  const [formValues, setFormValues] = useState<HistoryFormValues>({
    title: "",
    description: "",
    date: "",
    location: "",
    imageUrl: "",
    tags: "",
  })

  const canManage = isAdmin || isHelper
  const hasEvents = events.length > 0
  const timelineEvents: HistoryEventItem[] = events

  const openAddDialog = () => {
    setEditingEvent(null)
    setFormValues({
      title: "",
      description: "",
      date: "",
      location: "",
      imageUrl: "",
      tags: "",
    })
    setDialogOpen(true)
  }

  const openEditDialog = (event: HistoryEventItem) => {
    setEditingEvent(event)
    setFormValues({
      title: event.title,
      description: event.description || "",
      date: event.rawDate ? event.rawDate.slice(0, 10) : "",
      location: event.location || "",
      imageUrl: event.imageUrl || "",
      tags: event.tags.join(", "),
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const tags = formValues.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    const payload: CreateHistoryEventRequest = {
      title: formValues.title.trim(),
      description: formValues.description.trim() || undefined,
      date: formValues.date,
      location: formValues.location.trim() || undefined,
      imageUrl: formValues.imageUrl.trim() || undefined,
      tags,
      status: "active",
    }

    if (editingEvent) {
      await updateEvent(editingEvent.id, payload)
    } else {
      await addEvent(payload)
    }

    setDialogOpen(false)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-serif font-bold text-foreground">IT Perfect History</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Explore key events, training moments, and milestones from the IT Perfect team. This timeline highlights how
          students support classroom equipment, school events, and IT promotion across the years.
        </p>
      </div>

      <Card className="relative overflow-hidden border bg-gradient-to-b from-sky-50/80 via-background to-background">
        <CardHeader className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Timeline of Highlights
          </CardTitle>
          {canManage && (
            <Button size="sm" variant="outline" onClick={openAddDialog} disabled={loading}>
              <Plus className="h-4 w-4 mr-1" />
              Add event
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!loading && !hasEvents && (
            <p className="text-xs text-muted-foreground">
              No history events have been added yet. Admins and helpers can add the first one using the button above.
            </p>
          )}
          {hasEvents && (
            <div className="relative ml-5 space-y-8 border-l border-sky-200/80 pl-6">
              {timelineEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="relative flex gap-4"
                >
                  <div className="absolute -left-8 mt-1 flex h-4 w-4 items-center justify-center">
                    <div className="h-3 w-3 rounded-full border-2 border-sky-500 bg-background shadow-[0_0_0_4px_rgba(56,189,248,0.25)]" />
                  </div>

                <div className="flex-1 overflow-hidden rounded-xl border bg-card/70 shadow-sm">
                  <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                    <div className="relative h-32 w-full overflow-hidden bg-muted md:h-40">
                      <img
                        src={event.imageUrl || "/windows-computer.png"}
                        alt={event.title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col justify-between p-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="px-1.5 py-0 text-[10px] uppercase tracking-wide">
                            {event.year}
                          </Badge>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {event.dateLabel}
                          </p>
                        </div>
                        <h3 className="text-sm font-semibold leading-tight md:text-base">{event.title}</h3>
                        {event.description && (
                          <p className="text-xs text-muted-foreground md:text-sm">{event.description}</p>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Ongoing learning & practice
                        </span>
                        {event.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        )}
                        {event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {event.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-[10px]">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {canManage && hasEvents && (
                        <div className="mt-3 flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => openEditDialog(event)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete event</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove this history event from the timeline. This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => deleteEvent(event.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit history event" : "Add history event"}</DialogTitle>
            <DialogDescription>
              Maintain the IT Perfect Hub timeline by adding key moments, or updating existing entries as needed.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Title</p>
              <Input
                value={formValues.title}
                onChange={(e) => setFormValues((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Event title"
                required
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Date</p>
              <Input
                type="date"
                value={formValues.date}
                onChange={(e) => setFormValues((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Location</p>
              <Input
                value={formValues.location}
                onChange={(e) => setFormValues((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. School Hall"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Image URL</p>
              <Input
                value={formValues.imageUrl}
                onChange={(e) => setFormValues((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="Optional image URL for this event"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Description</p>
              <Textarea
                value={formValues.description}
                onChange={(e) => setFormValues((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Short description of what happened"
                rows={3}
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Tags</p>
              <Input
                value={formValues.tags}
                onChange={(e) => setFormValues((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="Comma-separated tags, e.g. AV, Students, Event"
              />
            </div>

            <DialogFooter>
              <Button type="submit" size="sm" disabled={loading}>
                {editingEvent ? "Save changes" : "Add event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
