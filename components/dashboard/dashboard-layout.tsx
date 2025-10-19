"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { UserMenu } from "@/components/auth/user-menu"
import { UserRole } from "@/lib/permissions"
import {
  Users,
  Calendar,
  PlayCircle,
  Menu,
  X,
  ArrowLeft,
  Shield,
  Settings,
  LinkIcon,
  FileText,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Team Info", href: "/dashboard", icon: Users },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Training", href: "/dashboard/training", icon: PlayCircle },
]

const adminNavigation = [
  { name: "Admin Panel", href: "/admin", icon: Shield },
  { name: "Resources", href: "/admin/resources", icon: LinkIcon },
  { name: "Activity", href: "/admin/announcements", icon: FileText },
  { name: "Articles", href: "/admin/articles", icon: BookOpen },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  const isAdminRoute = pathname.startsWith("/admin")
  const currentNavigation = isAdminRoute ? adminNavigation : navigation

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>

              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Portal</span>
              </Link>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  {isAdminRoute ? (
                    <Shield className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Settings className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-serif font-bold text-foreground">
                    {isAdminRoute ? "Admin Dashboard" : "Dashboard"}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {isAdminRoute ? "Content Management System" : "Internal Management System"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.name}</p>
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant={user.role === UserRole.ADMIN ? "default" : "secondary"} 
                        className="text-xs"
                      >
                        {user.role === UserRole.ADMIN 
                          ? "Admin" 
                          : user.role === UserRole.HELPER 
                            ? "Helper" 
                            : "Guest"}
                      </Badge>
                    </div>
                  </div>
                  <UserMenu />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200 ease-in-out lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            "fixed lg:static inset-y-0 z-50 lg:z-auto",
          )}
        >
          <nav className="p-6 space-y-6">
            {/* Main Navigation */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isAdminRoute ? "Admin" : "Dashboard"}
              </h3>
              {currentNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn("w-full justify-start", isActive && "bg-primary text-primary-foreground")}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
            </div>

            {/* Cross Navigation */}
            {user?.role === UserRole.ADMIN && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isAdminRoute ? "Dashboard" : "Admin"}
                </h3>
                {(isAdminRoute ? navigation : adminNavigation).slice(0, 2).map((item) => (
                  <Link key={item.name} href={item.href}>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setSidebarOpen(false)}>
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
