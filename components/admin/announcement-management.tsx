"use client"

import type React from "react"

import { useState } from "react"
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
import { Plus, Edit, Trash2, Calendar, MapPin, Users, Search, Eye } from "lucide-react"
import { useAnnouncements } from "@/hooks/use-announcements"
import type { Announcement } from "@/lib/announcements"

const clubOptions = ["Computer Club", "Science Society", "Debate Club", "Art Club", "Music Club"]
const eventTypes = ["Workshop", "Event", "Competition", "Meeting", "Seminar"]

export function AnnouncementManagement() {
  const { announcements, loading, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.club.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || announcement.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleSaveAnnouncement = (announcementData: any) => {
    if (editingAnnouncement) {
      updateAnnouncement(editingAnnouncement.id, announcementData)
    } else {
      addAnnouncement({
        ...announcementData,
        attendees: 0,
        status: announcementData.status || "active",
      })
    }
    setEditingAnnouncement(null)
    setIsDialogOpen(false)
  }

  const handleDeleteAnnouncement = (id: number) => {
    deleteAnnouncement(id)
  }

  const handleStatusChange = (id: number, status: string) => {
    updateAnnouncement(id, { status })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">Announcement Management</h2>
            <p className="text-muted-foreground">Manage club announcements and events</p>
          </div>
        </div>
        <div className="text-center py-8 text-muted-foreground">Loading announcements...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Announcement Management</h2>
          <p className="text-muted-foreground">Manage club announcements and events</p>
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
              Add Announcement
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            className="pl-10"
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
            {searchQuery || selectedStatus !== "all" ? "No announcements match your filters." : "No announcements yet."}
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
                    <Button variant="outline" size="sm">
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
  const [formData, setFormData] = useState({
    title: announcement?.title || "",
    club: announcement?.club || "",
    date: announcement?.date || "",
    time: announcement?.time || "",
    location: announcement?.location || "",
    description: announcement?.description || "",
    type: announcement?.type || "Event",
    maxAttendees: announcement?.maxAttendees || 50,
    status: announcement?.status || "active",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{announcement ? "Edit Announcement" : "Add New Announcement"}</DialogTitle>
        <DialogDescription>
          {announcement ? "Update the announcement details below." : "Create a new club announcement or event."}
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
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{announcement ? "Update" : "Create"} Announcement</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
