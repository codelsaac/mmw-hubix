"use client"

import { useSession } from "next-auth/react"
import { UserRole, Permission, PermissionService } from "@/lib/permissions"

interface AuthUser {
  id?: string
  email?: string | null
  name?: string | null
  image?: string | null
  role?: UserRole
  department?: string
  description?: string
}

export interface UseAuthPermissionsReturn {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
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
 * Client-side hook for authentication and permission checks
 */
export function useAuthPermissions(): UseAuthPermissionsReturn {
  const { data: session, status } = useSession()
  
  const user = session?.user as AuthUser || null
  const isAuthenticated = !!session?.user
  const isLoading = status === "loading"
  const userRole = user?.role as UserRole

  const hasPermission = (permission: Permission): boolean => {
    if (!userRole || !user) return false
    return PermissionService.hasPermission(userRole, permission)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!userRole || !user || !permissions) return false
    return PermissionService.hasAnyPermission(userRole, permissions)
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!userRole || !user || !permissions) return false
    return PermissionService.hasAllPermissions(userRole, permissions)
  }

  const canAccessAdmin = (): boolean => {
    if (!userRole) return false
    return PermissionService.canAccessAdmin(userRole)
  }

  const canManageITSystem = (): boolean => {
    if (!userRole) return false
    return PermissionService.canManageITSystem(userRole)
  }

  const isReadOnly = (): boolean => {
    if (!userRole) return true
    return PermissionService.isReadOnly(userRole)
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
    isAuthenticated,
    isLoading,
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
