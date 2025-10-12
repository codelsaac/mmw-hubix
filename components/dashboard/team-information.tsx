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
        toast.success("團隊資訊已儲存")
      } else {
        toast.error("儲存失敗，請重試")
      }
    } catch (error) {
      console.error("Failed to save team notes:", error)
      toast.error("儲存失敗，請重試")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground">Team Information</h2>
        <p className="text-muted-foreground">Learn about our mission, structure, and team members</p>
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

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Team Members
          </CardTitle>
          <CardDescription>Meet our dedicated IT Prefect team</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="min-h-[160px] flex items-center justify-center text-muted-foreground">
              載入中...
            </div>
          ) : user?.role === "ADMIN" ? (
            <div className="space-y-3">
              <Textarea
                value={teamNotes}
                onChange={(event) => setTeamNotes(event.target.value)}
                rows={18}
                className="min-h-[320px]"
                placeholder="請在此輸入隊伍資訊或備註。"
                disabled={isSaving}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">內容儲存在資料庫，所有成員皆可查看。</p>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "儲存中..." : "儲存"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="min-h-[160px] whitespace-pre-wrap rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm leading-6">
              {teamNotes || "暫時未有隊伍資訊。"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
