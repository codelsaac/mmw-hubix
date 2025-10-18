"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Calendar, MapPin, Users, Search, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import { logger } from "@/lib/logger"
import type { Announcement } from "@/lib/announcements"

const clubOptions = ["Computer Club", "Science Society", "Debate Club", "Art Club", "Music Club"]
const eventTypes = ["Workshop", "Event", "Competition", "Meeting", "Seminar"]

export function AnnouncementManagement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  async function fetchAnnouncements() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/announcements')
      if (!response.ok) {
        throw new Error('Failed to fetch announcements')
      }
      const data = await response.json()
      setAnnouncements(data)
    } catch (error) {
      logger.error('Error fetching announcements:', error)
      toast.error('Failed to load activity news')
    } finally {
      setLoading(false)
    }
  }

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.club.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || announcement.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  async function handleSaveAnnouncement(announcementData: any) {
    try {
      if (editingAnnouncement) {
        // Update existing announcement
        const response = await fetch(`/api/announcements/${editingAnnouncement.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(announcementData)
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.error || 'Failed to update announcement')
        }
        
        toast.success('Activity news updated successfully')
      } else {
        // Create new announcement
        const response = await fetch('/api/admin/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...announcementData,
            attendees: 0,
            status: announcementData.status || "active",
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.error || 'Failed to create announcement')
        }
        
        toast.success('Activity news created successfully')
      }
      
      await fetchAnnouncements()
      setEditingAnnouncement(null)
      setIsDialogOpen(false)
    } catch (error) {
      logger.error('Error saving announcement:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save announcement'
      toast.error(errorMessage)
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    if (!confirm('Are you sure you want to delete this activity news? This action cannot be undone.')) return
    
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete announcement')
      }
      
      toast.success('Activity news deleted successfully')
      await fetchAnnouncements()
    } catch (error) {
      logger.error('Error deleting announcement:', error)
      toast.error('Failed to delete activity news')
    }
  }

  async function handleStatusChange(id: string, status: "active" | "cancelled" | "completed") {
    try {
      const announcement = announcements.find(a => a.id === id)
      if (!announcement) return

      const response = await fetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...announcement,
          status
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update status')
      }
      
      const statusText = status === 'active' ? 'activated' : status === 'cancelled' ? 'cancelled' : 'completed'
      toast.success(`Activity news ${statusText} successfully`)
      await fetchAnnouncements()
    } catch (error) {
      logger.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">Activity News Management</h2>
            <p className="text-muted-foreground">Manage club activity news and events</p>
          </div>
        </div>
        <div className="text-center py-8 text-muted-foreground">Loading activity news...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Activity News Management</h2>
          <p className="text-muted-foreground">Manage club activity news and events</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingAnnouncement(null)
                setIsDialogOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Activity News
            </Button>
          </DialogTrigger>
          <AnnouncementDialog
            announcement={editingAnnouncement}
            onSave={handleSaveAnnouncement}
            onCancel={() => {
              setEditingAnnouncement(null)
              setIsDialogOpen(false)
            }}
          />
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
          <Input
            placeholder="Search activity news..."
            className="pl-10 bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder:text-gray-500 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery || selectedStatus !== "all" ? "No activity news match your filters." : "No activity news yet."}
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {announcement.club}
                      </Badge>
                      <Badge variant={announcement.type === "Workshop" ? "default" : "outline"} className="text-xs">
                        {announcement.type}
                      </Badge>
                      <Badge
                        variant={
                          announcement.status === "active"
                            ? "default"
                            : announcement.status === "cancelled"
                              ? "destructive"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {announcement.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setViewingAnnouncement(announcement)
                        setIsViewDialogOpen(true)
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingAnnouncement(announcement)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>{announcement.description}</CardDescription>

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

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Created on {new Date(announcement.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    {announcement.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(announcement.id, "completed")}
                      >
                        Mark Complete
                      </Button>
                    )}
                    {announcement.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(announcement.id, "cancelled")}
                      >
                        Cancel
                      </Button>
                    )}
                    {announcement.status !== "active" && (
                      <Button size="sm" onClick={() => handleStatusChange(announcement.id, "active")}>
                        Reactivate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Activity News Details</DialogTitle>
          </DialogHeader>
          {viewingAnnouncement && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{viewingAnnouncement.club}</Badge>
                  <Badge variant="outline">{viewingAnnouncement.type}</Badge>
                  <Badge
                    variant={
                      viewingAnnouncement.status === "active"
                        ? "default"
                        : viewingAnnouncement.status === "cancelled"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {viewingAnnouncement.status}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold">{viewingAnnouncement.title}</h3>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{viewingAnnouncement.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date & Time</p>
                    <p className="text-sm font-medium">
                      {new Date(viewingAnnouncement.date).toLocaleDateString()} at {viewingAnnouncement.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">{viewingAnnouncement.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Attendees</p>
                    <p className="text-sm font-medium">
                      {viewingAnnouncement.attendees}/{viewingAnnouncement.maxAttendees}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">
                      {new Date(viewingAnnouncement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {viewingAnnouncement.creator && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Created by</p>
                  <p className="text-sm font-medium">{viewingAnnouncement.creator.name || viewingAnnouncement.creator.email}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AnnouncementDialog({
  announcement,
  onSave,
  onCancel,
}: {
  announcement: Announcement | null
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<{
    title: string
    club: string
    date: string
    time: string
    location: string
    description: string
    type: string
    maxAttendees: number
    status: "active" | "cancelled" | "completed"
    isPublic: boolean
  }>({
    title: announcement?.title || "",
    club: announcement?.club || "",
    date: announcement?.date ? (typeof announcement.date === 'string' ? announcement.date.split('T')[0] : new Date(announcement.date).toISOString().split('T')[0]) : "",
    time: announcement?.time || "",
    location: announcement?.location || "",
    description: announcement?.description || "",
    type: announcement?.type || "Event",
    maxAttendees: announcement?.maxAttendees || 50,
    status: (announcement?.status as "active" | "cancelled" | "completed") || "active",
    isPublic: announcement?.isPublic ?? true,
  })

  useEffect(() => {
    setFormData({
      title: announcement?.title || "",
      club: announcement?.club || "",
      date: announcement?.date ? (typeof announcement.date === 'string' ? announcement.date.split('T')[0] : new Date(announcement.date).toISOString().split('T')[0]) : "",
      time: announcement?.time || "",
      location: announcement?.location || "",
      description: announcement?.description || "",
      type: announcement?.type || "Event",
      maxAttendees: announcement?.maxAttendees || 50,
      status: (announcement?.status as "active" | "cancelled" | "completed") || "active",
      isPublic: announcement?.isPublic ?? true,
    })
  }, [announcement])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{announcement ? "Edit Activity News" : "Add New Activity News"}</DialogTitle>
        <DialogDescription>
          {announcement ? "Update the activity news details below." : "Create a new club activity news or event."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Computer Club Workshop"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="club">Club</Label>
            <Select value={formData.club} onValueChange={(value) => setFormData({ ...formData, club: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select club" />
              </SelectTrigger>
              <SelectContent>
                {clubOptions.map((club) => (
                  <SelectItem key={club} value={club}>
                    {club}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Event Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxAttendees">Max Attendees</Label>
            <Input
              id="maxAttendees"
              type="number"
              value={formData.maxAttendees}
              onChange={(e) => setFormData({ ...formData, maxAttendees: Number.parseInt(e.target.value) })}
              min="1"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Computer Lab A"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the event..."
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: "active" | "cancelled" | "completed") => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="isPublic">Visibility</Label>
            <Select value={formData.isPublic ? "public" : "private"} onValueChange={(value) => setFormData({ ...formData, isPublic: value === "public" })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{announcement ? "Update" : "Create"} Activity News</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
