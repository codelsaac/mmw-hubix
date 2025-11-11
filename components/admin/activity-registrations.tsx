"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  User,
  Calendar,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Registration {
  id: string
  studentName: string
  studentEmail: string | null
  studentPhone: string | null
  studentClass: string | null
  studentNumber: string | null
  message: string | null
  status: string
  createdAt: Date | string
}

interface ActivityRegistrationsProps {
  activityId: string
  activityTitle: string
  isOpen: boolean
  onClose: () => void
}

export function ActivityRegistrations({
  activityId,
  activityTitle,
  isOpen,
  onClose,
}: ActivityRegistrationsProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchRegistrations = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/announcements/${activityId}/registrations`)
      if (!response.ok) {
        throw new Error("Failed to fetch registrations")
      }
      const data = await response.json()
      setRegistrations(data)
    } catch (error) {
      console.error("Error fetching registrations:", error)
      setError("Failed to load registrations")
    } finally {
      setIsLoading(false)
    }
  }, [activityId])

  useEffect(() => {
    if (isOpen && activityId) {
      fetchRegistrations()
    }
  }, [isOpen, activityId, fetchRegistrations])

  async function updateRegistrationStatus(registrationId: string, status: string) {
    setUpdatingId(registrationId)
    try {
      const response = await fetch(`/api/admin/announcements/${activityId}/registrations`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registrationId, status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update registration")
      }

      await fetchRegistrations()
      toast.success(`Registration ${status}`)
    } catch (error) {
      toast.error("Failed to update registration")
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      approved: { color: "bg-green-100 text-green-800", label: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={cn("text-xs", config.color)}>{config.label}</Badge>
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Registrations</DialogTitle>
          <DialogDescription>{activityTitle}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No registrations yet for this activity.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total Registrations: {registrations.length}</span>
              <div className="flex gap-2">
                <span>Pending: {registrations.filter((r) => r.status === "pending").length}</span>
                <span>Approved: {registrations.filter((r) => r.status === "approved").length}</span>
                <span>Rejected: {registrations.filter((r) => r.status === "rejected").length}</span>
              </div>
            </div>

            <Separator />

            {registrations.map((registration) => (
              <Card key={registration.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-lg">{registration.studentName}</span>
                        </div>
                        {registration.studentClass && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Class: {registration.studentClass}
                            {registration.studentNumber && ` • ID: ${registration.studentNumber}`}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(registration.status)}
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {registration.studentEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{registration.studentEmail}</span>
                        </div>
                      )}
                      {registration.studentPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{registration.studentPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    {registration.message && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span>Message:</span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-6">{registration.message}</p>
                      </div>
                    )}

                    {/* Registration Date */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Registered: {new Date(registration.createdAt).toLocaleString()}</span>
                    </div>

                    {/* Action Buttons */}
                    {registration.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => updateRegistrationStatus(registration.id, "approved")}
                          disabled={updatingId === registration.id}
                        >
                          {updatingId === registration.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => updateRegistrationStatus(registration.id, "rejected")}
                          disabled={updatingId === registration.id}
                        >
                          {updatingId === registration.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          Reject
                        </Button>
                      </div>
                    )}
                    {registration.status !== "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRegistrationStatus(registration.id, "pending")}
                        disabled={updatingId === registration.id}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Reset to Pending
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
