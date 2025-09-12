"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useAuthPermissions } from "@/hooks/use-auth-permissions"
import { Permission } from "@/lib/permissions"

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
    description: "學習資源和材料",
    requiredPermissions: [Permission.VIEW_RESOURCES]
  },
  {
    title: "Activity News", 
    href: "/announcements",
    description: "學校最新消息",
    requiredPermissions: [Permission.VIEW_RESOURCES]
  },
  {
    title: "IT System",
    href: "/dashboard",
    description: "內部儀表板和IT系統管理",
    requiredPermissions: [Permission.VIEW_DASHBOARD],
    badge: "IT"
  },
  {
    title: "Admin Panel",
    href: "/admin",
    description: "系統管理",
    requiredPermissions: [Permission.MANAGE_WEBSITE],
    badge: "Admin"
  }
]

interface RoleBasedNavProps {
  className?: string
  showDescriptions?: boolean
}

export function RoleBasedNav({ className, showDescriptions = false }: RoleBasedNavProps) {
  const pathname = usePathname()
  const { hasAnyPermission, isAuthenticated } = useAuthPermissions()

  // Filter navigation items based on user permissions
  const visibleItems = navigationItems.filter(item => {
    if (!isAuthenticated) {
      // Show only public items for unauthenticated users
      return !item.requiredPermissions || item.href === "/" || item.href === "/announcements"
    }
    
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) return true
    return hasAnyPermission(item.requiredPermissions)
  })

  return (
    <nav className={cn("flex items-center gap-8 text-sm", className)} suppressHydrationWarning>
      {visibleItems.map((item) => (
        <div key={item.href} className="relative" suppressHydrationWarning>
          <Link
            href={item.href}
            className={cn(
              "transition-colors hover:text-foreground/80 flex items-center gap-2",
              pathname === item.href ? "text-foreground" : "text-foreground/60"
            )}
          >
            <span>{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="text-xs">
                {item.badge}
              </Badge>
            )}
          </Link>
          {showDescriptions && item.description && (
            <div className="absolute top-full left-0 mt-1 text-xs text-muted-foreground whitespace-nowrap">
              {item.description}
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}

interface RoleBasedMenuItemProps {
  requiredPermissions?: Permission[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleBasedMenuItem({ 
  requiredPermissions, 
  children, 
  fallback = null 
}: RoleBasedMenuItemProps) {
  const { hasAnyPermission, isAuthenticated } = useAuthPermissions()

  if (!isAuthenticated) return fallback
  
  if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
    return fallback
  }

  return <>{children}</>
}
