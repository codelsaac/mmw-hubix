"use client"

import { useState } from "react"
import { MessageCircle, X } from "lucide-react"

import { AIChat } from "@/components/ai-chat"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {!isOpen && (
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-in fade-in slide-in-from-bottom-4"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="h-6 w-6 animate-pulse" />
        </Button>
      )}

      {isOpen && (
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
              onClick={() => setIsOpen(false)}
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
    </>
  )
}
