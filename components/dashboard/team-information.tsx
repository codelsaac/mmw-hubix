"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Award, Shield } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"


export function TeamInformation() {
  const { user } = useAuth()
  const [teamNotes, setTeamNotes] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch team notes from API
  useEffect(() => {
    async function fetchTeamNotes() {
      try {
        const response = await fetch("/api/dashboard/team-notes")
        if (response.ok) {
          const data = await response.json()
          setTeamNotes(data.content || "")
        }
      } catch (error) {
        console.error("Failed to fetch team notes:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTeamNotes()
  }, [])

  // Save team notes to API (admin only)
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/dashboard/team-notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: teamNotes }),
      })

      if (response.ok) {
        toast.success("Team information saved")
      } else {
        toast.error("Save failed, please try again")
      }
    } catch (error) {
      console.error("Failed to save team notes:", error)
      toast.error("Save failed, please try again")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground">Team Information</h2>
        <p className="text-muted-foreground">Learn about our mission, history, and milestones</p>
      </div>

      {/* Mission & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">
              To provide exceptional technical support and maintain robust IT infrastructure that enables seamless
              learning and administrative operations throughout our school community.
            </p>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Core Values:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Excellence in technical service delivery</li>
                <li>• Proactive problem-solving and innovation</li>
                <li>• Collaborative teamwork and knowledge sharing</li>
                <li>• Continuous learning and professional development</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Our Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Maintain 99% System Uptime</p>
                  <p className="text-xs text-muted-foreground">Ensure reliable access to all school systems</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Reduce Response Time</p>
                  <p className="text-xs text-muted-foreground">Respond to support requests within 15 minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Enhance Security</p>
                  <p className="text-xs text-muted-foreground">Implement advanced security protocols</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Expand Training</p>
                  <p className="text-xs text-muted-foreground">Develop comprehensive training programs</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            History
          </CardTitle>
          <CardDescription>Explore milestones and stories that shaped the IT Prefects</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="min-h-[160px] flex items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : user?.role === "ADMIN" ? (
            <div className="space-y-3">
              <Textarea
                value={teamNotes}
                onChange={(event) => setTeamNotes(event.target.value)}
                rows={18}
                className="min-h-[320px]"
                placeholder="Enter history notes or key milestones here."
                disabled={isSaving}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Content is stored in the database and visible to all members.</p>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="min-h-[160px] whitespace-pre-wrap rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm leading-6">
              {teamNotes || "No history records yet."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
