"use client"

import { useState } from "react"
import { ResourceHub } from "@/components/resource-hub"
import { ClubAnnouncements } from "@/components/club-announcements"
import { MaintenancePage } from "@/components/maintenance-page"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { MessageCircle, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AIChat } from "@/components/ai-chat"

export default function HomePage() {
  const { settings, isHydrated } = useSettings()
  const [aiChatOpen, setAiChatOpen] = useState(false)

  // Don't render anything until hydration is complete to avoid mismatch
  if (!isHydrated) {
    return (
      <div className="relative">
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <ResourceHub />
            <ClubAnnouncements />
          </div>
        </main>
      </div>
    )
  }

  // Show maintenance page if maintenance mode is enabled
  if (settings.maintenanceMode) {
    return <MaintenancePage />
  }

  return (
    <div className="relative">
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <ResourceHub />
          <ClubAnnouncements />
        </div>
      </main>

      {/* Floating Chat Bubble & Panel */}
      {!aiChatOpen && (
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-in fade-in slide-in-from-bottom-4"
          onClick={() => setAiChatOpen(true)}
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="h-6 w-6 animate-pulse" />
        </Button>
      )}

      {aiChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[22rem] md:w-[28rem] bg-background border border-border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI Assistant</span>
              <Badge variant="secondary" className="text-[10px]">
                Beta
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
              onClick={() => setAiChatOpen(false)}
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="h-96">
            <AIChat />
          </div>
        </div>
      )}
    </div>
  )
}
