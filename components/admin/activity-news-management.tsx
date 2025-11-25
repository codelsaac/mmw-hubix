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
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Calendar, MapPin, Users, Search, Eye, CheckCircle, XCircle, Clock, PlusCircle, AlertCircle, Pencil, Info, UserCircle, Loader2, ClipboardList } from "lucide-react"
import { toast } from "sonner"
import { logger } from "@/lib/logger"
import { cn } from "@/lib/utils"
import type { ActivityNews } from "@/lib/activity-news"
import { ActivityRegistrations } from "@/components/admin/activity-registrations"

const clubOptions = ["Computer Club", "Science Society", "Debate Club", "Art Club", "Music Club"]
const eventTypes = ["Workshop", "Event", "Competition", "Meeting", "Seminar"]

export function ActivityNewsManagement() {
  const [activityNews, setActivityNews] = useState<ActivityNews[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [editingActivityNews, setEditingActivityNews] = useState<ActivityNews | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewingActivityNews, setViewingActivityNews] = useState<ActivityNews | null>(null);
  const [viewingRegistrations, setViewingRegistrations] = useState<{id: string, title: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivityNews();
  }, []);

  async function fetchActivityNews() {
    try {
      setError(null);
      const response = await fetch('/api/admin/announcements');
      if (!response.ok) {
        throw new Error('Failed to fetch activity news');
      }
      const data = await response.json();
      setActivityNews(data);
    } catch (error) {
      logger.error('Error fetching activity news:', error);
      setError('Failed to load activity news. Please try again later.');
    }
  }

  const filteredActivityNews = activityNews.filter((activityNewsItem) => {
    const matchesSearch =
      activityNewsItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activityNewsItem.club.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || activityNewsItem.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  async function handleSaveActivityNews(activityNewsData: any) {
    setIsSaving(true);
    setError(null);
    try {
      if (editingActivityNews?.id) {
        // Update existing activity news
        const response = await fetch(`/api/admin/announcements/${editingActivityNews.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(activityNewsData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update activity news');
        }
      } else {
        // Create new activity news
        const response = await fetch('/api/admin/announcements', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...activityNewsData,
            status: activityNewsData.status || "active",
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create activity news');
        }
      }
      await fetchActivityNews();
      setEditingActivityNews(null);
    } catch (error) {
      logger.error('Error saving activity news:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save activity news';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteActivityNews(id: string) {
    if (!window.confirm("Are you sure you want to delete this activity news?")) return;
    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error('Failed to delete activity news');
      }
      await fetchActivityNews();
    } catch (error) {
      logger.error('Error deleting activity news:', error);
      setError('Failed to delete activity news.');
    }
  }

  async function handleStatusChange(id: string, status: "active" | "cancelled" | "completed") {
    try {
      const activityNewsItem = activityNews.find(a => a.id === id);
      if (!activityNewsItem) return;
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...activityNewsItem, status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      await fetchActivityNews();
    } catch (error) {
      logger.error('Error updating status:', error);
      setError('Failed to update status.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Activity News Management</h2>
        <Button onClick={() => setEditingActivityNews({} as ActivityNews)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ActivityNewsDialog
        activityNews={editingActivityNews}
        onSave={handleSaveActivityNews}
        onClose={() => setEditingActivityNews(null)}
        isSaving={isSaving}
      />

      <div className="flex items-center space-x-4">
        <Input
          placeholder="Search activity news..."
          className="pl-10 bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder:text-gray-500 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity News List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredActivityNews.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-12">
            <p>No activity news found. Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredActivityNews.map((activityNewsItem) => (
            <Card key={activityNewsItem.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{activityNewsItem.club}</p>
                    <Badge variant={activityNewsItem.type === "Workshop" ? "default" : "outline"} className="text-xs">
                      {activityNewsItem.type}
                    </Badge>
                  </div>
                  <Badge
                    className={cn("text-xs", {
                      "bg-green-100 text-green-800": activityNewsItem.status === "active",
                      "bg-red-100 text-red-800": activityNewsItem.status === "cancelled",
                      "bg-blue-100 text-blue-800": activityNewsItem.status === "completed",
                    })}
                  >
                    {activityNewsItem.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{activityNewsItem.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="line-clamp-2 min-h-[40px]">{activityNewsItem.description}</CardDescription>
                <Separator />
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{new Date(activityNewsItem.date).toLocaleDateString()} at {activityNewsItem.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span className="truncate">{activityNewsItem.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>{activityNewsItem.attendees}/{activityNewsItem.maxAttendees} attending</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                      onClick={() => setViewingActivityNews(activityNewsItem)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                      onClick={() => setViewingRegistrations({id: activityNewsItem.id, title: activityNewsItem.title})}
                    >
                      <ClipboardList className="h-3 w-3 mr-1" />
                      Registrations ({activityNewsItem.attendees})
                    </Button>
                  </div>
                  {/* Edit/Delete Buttons */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                      onClick={() => setEditingActivityNews(activityNewsItem)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                      onClick={() => handleDeleteActivityNews(activityNewsItem.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                  {/* Status Change Buttons */}
                  {activityNewsItem.status === "active" && (
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-300 hover:border-green-400"
                        onClick={() => handleStatusChange(activityNewsItem.id, "completed")}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-300 hover:border-red-400"
                        onClick={() => handleStatusChange(activityNewsItem.id, "cancelled")}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                  {activityNewsItem.status !== "active" && (
                    <Button 
                      size="sm" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleStatusChange(activityNewsItem.id, "active")}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Reactivate
                    </Button>
                  )}
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Created on {new Date(activityNewsItem.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Registrations */}
      {viewingRegistrations && (
        <ActivityRegistrations
          activityId={viewingRegistrations.id}
          activityTitle={viewingRegistrations.title}
          isOpen={!!viewingRegistrations}
          onClose={() => setViewingRegistrations(null)}
        />
      )}

      {/* View Activity News Details Dialog */}
      {viewingActivityNews && (
        <Dialog open={!!viewingActivityNews} onOpenChange={() => setViewingActivityNews(null)}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{viewingActivityNews.title}</DialogTitle>
              <DialogDescription>
                <div className="flex justify-between items-start pt-2">
                  <div>
                    <Badge variant="secondary">{viewingActivityNews.club}</Badge>
                    <Badge variant="outline" className="ml-2">{viewingActivityNews.type}</Badge>
                  </div>
                  <Badge
                    className={cn("text-xs", {
                      "bg-green-100 text-green-800": viewingActivityNews.status === "active",
                      "bg-red-100 text-red-800": viewingActivityNews.status === "cancelled",
                      "bg-blue-100 text-blue-800": viewingActivityNews.status === "completed",
                    })}
                  >
                    {viewingActivityNews.status}
                  </Badge>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">{viewingActivityNews.description}</p>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{new Date(viewingActivityNews.date).toLocaleDateString()} at {viewingActivityNews.time}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{viewingActivityNews.location}</p>
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{viewingActivityNews.attendees}/{viewingActivityNews.maxAttendees}</span>
                </div>
                <div className="flex items-center">
                  <Info className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Created on {new Date(viewingActivityNews.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {viewingActivityNews.creator && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-2">Created By</h4>
                  <div className="flex items-center">
                    <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{viewingActivityNews.creator.name || viewingActivityNews.creator.email}</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ActivityNewsDialog({
  activityNews,
  onSave,
  onClose,
  isSaving,
}: {
  activityNews: ActivityNews | null;
  onSave: (data: any) => void;
  onClose: () => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    title: activityNews?.title || "",
    club: activityNews?.club || "",
    date: activityNews?.date ? (typeof activityNews.date === 'string' ? activityNews.date.split('T')[0] : new Date(activityNews.date).toISOString().split('T')[0]) : "",
    time: activityNews?.time || "",
    location: activityNews?.location || "",
    description: activityNews?.description || "",
    type: activityNews?.type || "Event",
    maxAttendees: activityNews?.maxAttendees || 50,
    status: (activityNews?.status as "active" | "cancelled" | "completed") || "active",
    isPublic: activityNews?.isPublic ?? true,
  });

  useEffect(() => {
    if (activityNews) {
      setFormData({
        title: activityNews?.title || "",
        club: activityNews?.club || "",
        date: activityNews?.date ? (typeof activityNews.date === 'string' ? activityNews.date.split('T')[0] : new Date(activityNews.date).toISOString().split('T')[0]) : "",
        time: activityNews?.time || "",
        location: activityNews?.location || "",
        description: activityNews?.description || "",
        type: activityNews?.type || "Event",
        maxAttendees: activityNews?.maxAttendees || 50,
        status: (activityNews?.status as "active" | "cancelled" | "completed") || "active",
        isPublic: activityNews?.isPublic ?? true,
      });
    }
  }, [activityNews]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!activityNews) return null;

  return (
    <Dialog open={!!activityNews} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{activityNews.id ? "Edit Activity News" : "Add New Activity News"}</DialogTitle>
          <DialogDescription>
            {activityNews.id ? "Update the activity news details below." : "Create a new club activity news or event."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Event Title
            </Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="club" className="text-right">
              Club
            </Label>
            <Input id="club" name="club" value={formData.club} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Time
            </Label>
            <Input id="time" name="time" type="time" value={formData.time} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input id="location" name="location" value={formData.location} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select name="type" value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Event">Event</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxAttendees" className="text-right">
              Max Attendees
            </Label>
            <Input
              id="maxAttendees"
              name="maxAttendees"
              type="number"
              value={formData.maxAttendees}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select name="status" value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            {activityNews.id ? "Update" : "Create"} Activity News
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
