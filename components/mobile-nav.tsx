"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { Permission } from "@/lib/permissions"
import { Menu } from "lucide-react"

interface NavItem {
  title: string
  href: string
  description?: string
  requiredPermissions?: Permission[]
  badge?: string
}

const navigationItems: NavItem[] = [
  {
    title: "Resource Hub",
    href: "/",
    description: "Learning resources and materials",
    requiredPermissions: [Permission.VIEW_RESOURCES]
  },
  {
    title: "Activity News", 
    href: "/activity-news",
    description: "Latest school news and updates",
    requiredPermissions: [Permission.VIEW_RESOURCES]
  },
  {
    title: "Articles",
    href: "/articles",
    description: "Published articles and content"
  },
  {
    title: "IT System",
    href: "/dashboard",
    description: "Internal dashboard and IT system management",
    requiredPermissions: [Permission.VIEW_DASHBOARD],
    badge: "IT"
  },
  {
    title: "Admin Panel",
    href: "/admin",
    description: "System administration",
    requiredPermissions: [Permission.MANAGE_WEBSITE],
    badge: "Admin"
  }
]

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const { hasAnyPermission, isAuthenticated } = useAuth()

  // Filter navigation items based on user permissions
  const visibleItems = navigationItems.filter(item => {
    if (!isAuthenticated) {
      // Show only public items for unauthenticated users
      return (
        !item.requiredPermissions ||
        item.href === "/" ||
        item.href.startsWith("/#")
      )
    }
    
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) return true
    return hasAnyPermission(item.requiredPermissions)
  })

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <Link
              href="/"
              className="flex items-center space-x-3"
              onClick={() => setOpen(false)}
            >
              <div className="h-10 w-10">
                <Icons.logo className="h-full w-full" />
              </div>
              <span className="font-bold text-lg">{siteConfig.name}</span>
            </Link>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-6">
            <nav className="space-y-2">
              {visibleItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.title}</span>
                        {item.badge && (
                          <Badge variant={item.badge === "Admin" ? "destructive" : "secondary"} className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </nav>
          </div>
          
          {/* Footer */}
          <div className="border-t p-6">
            <Link
              href={siteConfig.links.schoolSite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setOpen(false)}
            >
              <Icons.school className="h-4 w-4" />
              <span>School Website</span>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
