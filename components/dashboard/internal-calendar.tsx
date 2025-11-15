"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Clock, MapPin, Users, Plus, ChevronLeft, ChevronRight, Loader2, AlertCircle, Globe } from "lucide-react"
import { useCalendar } from "@/hooks/use-calendar"
import { useDashboard } from "@/hooks/use-dashboard"
import { useAuth } from "@/hooks/use-auth"
import { PermissionService, Permission, UserRole } from "@/lib/permissions"

import { logger } from "@/lib/logger"
const eventTypes = {
  meeting: { color: "bg-blue-500", label: "Meeting" },
  training: { color: "bg-green-500", label: "Training" },
  maintenance: { color: "bg-orange-500", label: "Maintenance" },
  orientation: { color: "bg-purple-500", label: "Orientation" },
  general: { color: "bg-gray-500", label: "Uncategorized" },
}

export function InternalCalendar() {
  const { user, isAdmin } = useAuth()
  const canManageCalendar = user?.role && PermissionService.hasPermission(user.role as UserRole, Permission.MANAGE_CALENDAR)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [isCreatePublic, setIsCreatePublic] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    eventType: "meeting",
  })
  
  const { events, loading, error, createInternalEvent, createPublicEvent } = useCalendar()
  const { addActivity } = useDashboard()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.startDate || !newEvent.startTime) return
    
    setIsSubmitting(true)

    try {
      // Combine date and time into proper DateTime objects
      const startDateTime = new Date(`${newEvent.startDate}T${newEvent.startTime}`)
      
      // If no end date/time provided, default to 1 hour after start time
      let endDateTime: Date
      if (newEvent.endDate && newEvent.endTime) {
        endDateTime = new Date(`${newEvent.endDate}T${newEvent.endTime}`)
      } else if (newEvent.endTime) {
        // Same day, different end time
        endDateTime = new Date(`${newEvent.startDate}T${newEvent.endTime}`)
      } else {
        // Default 1 hour duration
        endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000)
      }

      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        startTime: startDateTime,
        endTime: endDateTime,
        location: newEvent.location,
        eventType: newEvent.eventType,
      }

      // Create either internal or public event based on toggle
      logger.log('Creating event:', { isCreatePublic, eventData, isAdmin })
      
      // Only allow admins to create public events
      if (isCreatePublic && !isAdmin) {
        throw new Error('Only administrators can create public events')
      }
      
      if (isCreatePublic && isAdmin) {
        logger.log('Creating public event with data:', { ...eventData, isVisible: true })
        await createPublicEvent({
          ...eventData,
          isVisible: true
        })
        addActivity({
          type: "system",
          title: "Public Event Created",
          description: `Created public event "${newEvent.title}" for ${formatDate(startDateTime)}`,
          time: "Just now",
          status: "new",
        })
      } else {
        logger.log('Creating internal event with data:', { ...eventData, attendees: [] })
        await createInternalEvent({
          ...eventData,
          attendees: []
        })
        addActivity({
          type: "system",
          title: "Internal Event Created",
          description: `Created internal event "${newEvent.title}" for ${formatDate(startDateTime)}`,
          time: "Just now",
          status: "new",
        })
      }

      // Reset form
      setNewEvent({
        title: "",
        description: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        location: "",
        eventType: "meeting",
      })
      setIsAddEventOpen(false)
      setIsCreatePublic(false)
    } catch (err) {
      logger.error('Error creating event:', err)
      // You could add toast notification here
    } finally {
      setIsSubmitting(false)
    }
  }

  const upcomingEvents = events
    .filter((event) => new Date(event.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 10)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading calendar events...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Internal Calendar</h2>
          <p className="text-muted-foreground">Team meetings, training sessions, and important events</p>
        </div>
        {canManageCalendar && (
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Enter event title"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">Start Time *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date (optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                      placeholder="Same as start date if empty"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">End Time (optional)</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      placeholder="1 hour duration if empty"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="eventType">Type</Label>
                    <Select value={newEvent.eventType} onValueChange={(value) => setNewEvent({ ...newEvent, eventType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="orientation">Orientation</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      placeholder="Enter location"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Enter event description"
                    rows={3}
                  />
                </div>

                {/* Only show public event option for admins */}
                {isAdmin && (
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="isPublic" 
                      checked={isCreatePublic}
                      onChange={(e) => setIsCreatePublic(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="isPublic" className="text-sm font-medium flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Make this a public event (visible to all students)
                    </label>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddEventOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEvent} disabled={isSubmitting || !newEvent.title || !newEvent.startDate || !newEvent.startTime}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Event
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming events</p>
                    <p className="text-sm">Create your first event to get started!</p>
                  </div>
                ) : (
                  upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${eventTypes[event.eventType as keyof typeof eventTypes]?.color || 'bg-gray-500'} mt-1`}
                          />
                          {event.isInternal ? (
                            <div className="w-3 h-3 rounded-full bg-gray-400" title="Private Event (Only visible to you)" />
                          ) : (
                            <Globe className="w-3 h-3 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {eventTypes[event.eventType as keyof typeof eventTypes]?.label || 'General'}
                              </Badge>
                              {event.isInternal ? (
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">Private</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Public</Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              <span>{formatDate(event.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {formatTime(event.startTime)} - {formatTime(event.endTime)}
                              </span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {event.attendees && event.attendees.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{event.attendees.length} attending</span>
                              </div>
                            )}
                          </div>

                          {event.description && (
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Details Sidebar */}
        <div className="space-y-4">
          {selectedEvent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  Event Details
                  {selectedEvent.isInternal ? (
                    <div className="w-4 h-4 rounded-full bg-gray-400" title="Private Event (Only visible to you)" />
                  ) : (
                    <Globe className="w-4 h-4 text-blue-600" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">{selectedEvent.title}</h4>
                  {selectedEvent.description && (
                    <p className="text-xs text-muted-foreground">{selectedEvent.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                    <span>{formatDate(selectedEvent.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span>
                      {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                    </span>
                  </div>
                  {selectedEvent.location && (
                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span>{selectedEvent.attendees.length} people attending</span>
                    </div>
                  )}
                  {selectedEvent.creator && (
                    <div className="flex items-center gap-2 text-xs">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span>Created by {selectedEvent.creator.name || selectedEvent.creator.email}</span>
                    </div>
                  )}
                </div>

                {selectedEvent.isInternal ? (
                  <div className="text-xs text-center text-muted-foreground">
                    This is a private event only visible to you
                  </div>
                ) : (
                  <div className="text-xs text-center text-muted-foreground">
                    This is a public event visible to all users
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Events</span>
                <span className="font-medium">{events.length} events</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Upcoming</span>
                <span className="font-medium">{upcomingEvents.length} events</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Internal Events</span>
                <span className="font-medium">{events.filter(e => e.isInternal).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Public Events</span>
                <span className="font-medium">{events.filter(e => !e.isInternal).length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

