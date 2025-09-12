"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogIn, ExternalLink, ChevronDown } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { LoginDialog } from "@/components/auth/login-dialog"
import { UserMenu } from "@/components/auth/user-menu"
import { AIChat } from "@/components/ai-chat"

export function Sidebar() {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [itCardOpen, setItCardOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()

  return (
    <>
      <aside className="w-80 bg-sidebar border-l border-sidebar-border p-6 space-y-6">
        {/* IT Prefect Login/User Menu */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LogIn className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">IT Prefect System</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={itCardOpen ? "Collapse" : "Expand"}
                onClick={() => setItCardOpen((v) => !v)}
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${itCardOpen ? "rotate-0" : "-rotate-90"}`} />
              </Button>
            </div>
            <CardDescription className="text-sm">
              {isAuthenticated
                ? "Access your dashboard and management tools"
                : "Access internal dashboard and management tools"}
            </CardDescription>
          </CardHeader>
          {itCardOpen && (
            <CardContent>
              {isAuthenticated && user ? (
                <Link href="/dashboard">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer">
                    <UserMenu />
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
          )}
        </Card>

        {/* System Status */}
      </aside>

      <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </>
  )
}
