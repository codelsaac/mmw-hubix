"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Loader2 } from "lucide-react"

import { logger } from "@/lib/logger"
interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIChatProps {
  onMessageSent?: () => void
  onResponseReceived?: () => void
  avatarType?: 'pet' | 'icon'
}

export function AIChat({ onMessageSent, onResponseReceived, avatarType = 'icon' }: AIChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: avatarType === 'pet' 
        ? "Hello! 👋 I'm BYTE, your digital pet AI assistant! I'm here to help you with campus navigation, schedules, IT support, and school policies. What can I help you with today? ⚡"
        : "Hello! I am the MMW Hubix Assistant. I can help you with campus navigation, schedules, IT support, and school policies. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const SUGGESTED_ACTIONS = [
    { label: "📅 Events", text: "What are the upcoming events?" },
    { label: "📚 Library", text: "When is the library open?" },
    { label: "🔑 Wifi", text: "What is the wifi password?" },
    { label: "💻 IT Help", text: "How do I contact IT support?" },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSuggestionClick = (text: string) => {
    setInput(text)
    // Optional: auto-send
    // sendMessage(new Event('submit') as any, text) 
  }

  const sendMessage = async (e: React.FormEvent, overrideInput?: string) => {
    e.preventDefault()
    const messageText = overrideInput || input
    if (!messageText.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: messageText.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    onMessageSent?.()

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      onResponseReceived?.()
      setTimeout(() => onResponseReceived?.(), 2000)
    } catch (error) {
      logger.error("Chat error:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth scrollbar-hide">
        {messages.length === 1 && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in duration-500 slide-in-from-bottom-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-tr from-primary/20 to-primary/5 rounded-full flex items-center justify-center shadow-inner ring-1 ring-primary/10">
                <Bot className="w-10 h-10 text-primary/60" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center shadow-sm ring-1 ring-border/50">
                <span className="text-xs">✨</span>
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-foreground/80">Welcome to Hubix</p>
              <p className="text-xs text-muted-foreground">Ask me anything about the school!</p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/10 flex items-center justify-center shadow-sm mt-1">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                message.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-tr-sm" 
                  : "bg-muted/50 border border-border/50 text-foreground rounded-tl-sm"
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <p
                className={`text-[10px] mt-1.5 text-right ${
                  message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center shadow-sm mt-1">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start animate-in fade-in duration-300">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/10 flex items-center justify-center shadow-sm">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-background/50 backdrop-blur-sm border-t border-border/50">
        {messages.length <= 2 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-1 scrollbar-hide snap-x">
            {SUGGESTED_ACTIONS.map((action, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(action.text)}
                className="flex-shrink-0 text-xs bg-background/80 hover:bg-primary/10 border border-border/50 hover:border-primary/20 text-foreground/80 hover:text-primary px-3 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap snap-start shadow-sm"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={sendMessage} className="relative flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 pr-12 h-11 rounded-full border-border/50 bg-background/50 shadow-sm focus-visible:ring-primary/20"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 top-1.5 h-8 w-8 rounded-full shadow-sm transition-all duration-200 hover:scale-105"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
