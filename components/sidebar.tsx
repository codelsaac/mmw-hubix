"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, LogIn, HelpCircle, Settings, ExternalLink, X, Shield } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { LoginDialog } from "@/components/auth/login-dialog"
import { UserMenu } from "@/components/auth/user-menu"
import { AIChat } from "@/components/ai-chat"

export function Sidebar() {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()

  return (
    <>
      <aside className="w-80 bg-sidebar border-l border-sidebar-border p-6 space-y-6">
        {/* AI Assistant */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">AI Assistant</CardTitle>
              <Badge variant="secondary" className="text-xs">
                Beta
              </Badge>
            </div>
            <CardDescription className="text-sm">
              Ask questions about campus, schedules, and school policies
            </CardDescription>
          </CardHeader>
          <CardContent>
            {aiChatOpen ? (
              <div className="space-y-3">
                <div className="h-96 border border-border rounded-lg overflow-hidden">
                  <AIChat />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                  onClick={() => setAiChatOpen(false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Close Chat
                </Button>
              </div>
            ) : (
              <Button className="w-full" size="sm" onClick={() => setAiChatOpen(true)}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
            )}
          </CardContent>
        </Card>

        {/* IT Prefect Login/User Menu */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">IT Prefect System</CardTitle>
            </div>
            <CardDescription className="text-sm">
              {isAuthenticated
                ? "Access your dashboard and management tools"
                : "Access internal dashboard and management tools"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAuthenticated && user ? (
              <Link href="/dashboard">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer">
                  <UserMenu user={user} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            ) : (
              <Button
                variant="outline"
                className="w-full bg-transparent"
                size="sm"
                onClick={() => setLoginDialogOpen(true)}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <HelpCircle className="w-4 h-4 mr-2" />
              IT Support
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Report Issue
            </Button>
            {isAuthenticated && user?.role === "admin" && (
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
      </aside>

      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </>
  )
}
