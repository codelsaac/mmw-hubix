"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { UserRole, Permission, PermissionService } from "@/lib/permissions"
import { AuthUser } from "@/types/auth"

export interface UseAuthReturn {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isHelper: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  canAccessAdmin: () => boolean
  canManageITSystem: () => boolean
  isReadOnly: () => boolean
  getRoleDisplayName: () => string
  getRoleDescription: () => string
}

/**
 * Unified client-side hook for authentication and permissions
 * Combines functionality from use-auth and use-auth-permissions
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  
  const user = (session?.user as AuthUser) || null
  const isAuthenticated = !!session?.user
  const isLoading = status === "loading"
  const userRole = user?.role as UserRole
  const customPermissions = user?.permissions || null

  const refreshUser = async () => {
    try {
      await update()
      router.refresh()
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const hasPermission = (permission: Permission): boolean => {
    if (!userRole || !user) return false
    return PermissionService.hasPermission(userRole, permission, customPermissions)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!userRole || !user || !permissions) return false
    return PermissionService.hasAnyPermission(userRole, permissions, customPermissions)
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!userRole || !user || !permissions) return false
    return PermissionService.hasAllPermissions(userRole, permissions, customPermissions)
  }

  const canAccessAdmin = (): boolean => {
    if (!userRole) return false
    return PermissionService.canAccessAdmin(userRole, customPermissions)
  }

  const canManageITSystem = (): boolean => {
    if (!userRole) return false
    return PermissionService.canManageITSystem(userRole, customPermissions)
  }

  const isReadOnly = (): boolean => {
    if (!userRole) return true
    return PermissionService.isReadOnly(userRole, customPermissions)
  }

  const getRoleDisplayName = (): string => {
    if (!userRole) return "未登入"
    return PermissionService.getRoleDisplayName(userRole)
  }

  const getRoleDescription = (): string => {
    if (!userRole) return "請先登入系統"
    return PermissionService.getRoleDescription(userRole)
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin: user?.role === UserRole.ADMIN,
    isHelper: user?.role === UserRole.HELPER,
    signOut: handleSignOut,
    refreshUser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessAdmin,
    canManageITSystem,
    isReadOnly,
    getRoleDisplayName,
    getRoleDescription
  }
}
