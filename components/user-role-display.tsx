"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { UserRole } from "@/lib/permissions"

interface UserRoleDisplayProps {
  showDescription?: boolean
  className?: string
}

export function UserRoleDisplay({ showDescription = true, className }: UserRoleDisplayProps) {
  const { user, getRoleDisplayName, getRoleDescription, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return (
      <Badge variant="outline" className={className}>
        Not Logged In
      </Badge>
    )
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "destructive" as const
      case UserRole.HELPER:
        return "default" as const
      default:
        return "outline" as const
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Badge variant={getRoleBadgeVariant(user.role as UserRole)}>
          {getRoleDisplayName()}
        </Badge>
        <span className="text-sm text-muted-foreground">{user.name}</span>
      </div>
      {showDescription && (
        <p className="text-xs text-muted-foreground mt-1">
          {getRoleDescription()}
        </p>
      )}
    </div>
  )
}

interface UserRoleCardProps {
  className?: string
}

export function UserRoleCard({ className }: UserRoleCardProps) {
  const { user, getRoleDisplayName, getRoleDescription, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm">User Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Please log in to the system</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <span>Current User</span>
          <Badge variant={user.role === UserRole.ADMIN ? "destructive" : 
                         user.role === UserRole.HELPER ? "default" : "secondary"}>
            {getRoleDisplayName()}
          </Badge>
        </CardTitle>
        <CardDescription>{user.name} • {user.department}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {getRoleDescription()}
        </p>
      </CardContent>
    </Card>
  )
}
