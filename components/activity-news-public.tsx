"use client"

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
} from "@/components/ui/dialog"
import { Calendar, MapPin, Users, Clock, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Announcement {
  id: string
  title: string
  club: string
  date: Date | string
  time: string
  location: string | null
  description: string | null
  maxAttendees: number | null
  attendees: number
  type: string
  creator?: {
    name: string | null
  } | null
}

interface ActivityNewsPublicProps {
  initialAnnouncements: Announcement[]
}

export function ActivityNewsPublic({ initialAnnouncements }: ActivityNewsPublicProps) {
  const [announcements] = useState<Announcement[]>(initialAnnouncements)
  const [selectedActivity, setSelectedActivity] = useState<Announcement | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
    studentPhone: "",
    studentClass: "",
    studentNumber: "",
    message: "",
  })

  const handleJoinClick = (activity: Announcement) => {
    setSelectedActivity(activity)
    setShowSuccess(false)
    setFormData({
      studentName: "",
      studentEmail: "",
      studentPhone: "",
      studentClass: "",
      studentNumber: "",
      message: "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedActivity) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/announcements/${selectedActivity.id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to register")
      }

      setShowSuccess(true)
      toast.success("Registration successful!", {
        description: "Your registration has been submitted to the teacher for review.",
      })
    } catch (error) {
      toast.error("Registration failed", {
        description: error instanceof Error ? error.message : "Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const isFull = (activity: Announcement) =>
    activity.maxAttendees ? activity.attendees >= activity.maxAttendees : false

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-500">
      {/* Hero Section - Compact */}
      <div className="bg-gradient-to-r from-cyan-50 via-blue-50 to-cyan-50 border-b animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Activity News</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Join exciting activities and events organized by our school and other organizations !
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {announcements.length === 0 ? (
          <Card className="text-center py-16 border-dashed animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardContent className="pt-6">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg">No upcoming activities at the moment. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((activity) => (
              <Card
                key={activity.id}
                className={cn(
                  "group hover:shadow-xl transition-all duration-300 hover:border-primary/50 animate-in fade-in slide-in-from-bottom-4",
                  isFull(activity) && "opacity-75 saturate-50"
                )}
                style={{ animationDelay: `${announcements.indexOf(activity) * 75}ms` }}
              >
                <CardHeader className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <Badge variant="secondary" className="text-xs font-medium">
                      {activity.club}
                    </Badge>
                    <Badge
                      variant={activity.type === "Workshop" ? "default" : "outline"}
                      className="text-xs"
                    >
                      {activity.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-serif group-hover:text-primary transition-colors">
                    {activity.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {activity.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-2.5 h-4 w-4 text-primary/70" />
                      <span>{format(new Date(activity.date), "yyyy/MM/dd")}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2.5 h-4 w-4 text-primary/70" />
                      <span>{activity.time}</span>
                    </div>
                    {activity.location && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="mr-2.5 h-4 w-4 text-primary/70" />
                        <span className="truncate">{activity.location}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center text-muted-foreground">
                        <Users className="mr-2.5 h-4 w-4 text-primary/70" />
                        <span className="font-medium">
                          {activity.attendees}
                          {activity.maxAttendees ? `/${activity.maxAttendees}` : ""}
                        </span>
                      </div>
                      {activity.maxAttendees && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round((activity.attendees / activity.maxAttendees) * 100)}% full
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    className="w-full group-hover:shadow-md transition-shadow"
                    size="lg"
                    onClick={() => handleJoinClick(activity)}
                    disabled={isFull(activity)}
                  >
                    {isFull(activity) ? (
                      <>
                        <Users className="mr-2 h-4 w-4" />
                        Activity Full
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Join Activity
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Registration Dialog */}
        <Dialog open={!!selectedActivity && !showSuccess} onOpenChange={() => setSelectedActivity(null)}>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl">Join {selectedActivity?.title}</DialogTitle>
                  <DialogDescription className="mt-1.5">
                    Fill in your information to register. Fields marked with * are required.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              <div className="space-y-2">
                <Label htmlFor="studentName" className="text-sm font-medium">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="studentName"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="h-11"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentClass" className="text-sm font-medium">Class</Label>
                  <Input
                    id="studentClass"
                    name="studentClass"
                    value={formData.studentClass}
                    onChange={handleInputChange}
                    placeholder="e.g., F.1A"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentNumber" className="text-sm font-medium">Student Number</Label>
                  <Input
                    id="studentNumber"
                    name="studentNumber"
                    value={formData.studentNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 12345"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentEmail" className="text-sm font-medium">Email</Label>
                <Input
                  id="studentEmail"
                  name="studentEmail"
                  type="email"
                  value={formData.studentEmail}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentPhone" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="studentPhone"
                  name="studentPhone"
                  type="tel"
                  value={formData.studentPhone}
                  onChange={handleInputChange}
                  placeholder="e.g., 12345678"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">Message (Optional)</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Any questions or special requirements?"
                  rows={3}
                  className="resize-none"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedActivity(null)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Submit Registration
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={showSuccess} onOpenChange={() => setShowSuccess(false)}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <DialogTitle className="text-2xl">Registration Successful!</DialogTitle>
                <DialogDescription className="text-base">
                  Your registration has been submitted successfully. The teacher will review your application and contact you soon.
                </DialogDescription>
              </div>
            </DialogHeader>
            <DialogFooter className="sm:justify-center pt-4">
              <Button 
                onClick={() => {
                  setShowSuccess(false)
                  setSelectedActivity(null)
                }}
                size="lg"
                className="w-full sm:w-auto px-8"
              >
                Got it, thanks!
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
