import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { UserRole, Permission, PermissionService } from "@/lib/permissions"

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: UserRole
  department: string
  description?: string
}

// Auth.js v5 already caches auth() calls internally
const cachedAuth = auth

/**
 * Server-side authentication check with caching
 */
export async function requireAuth(roles?: UserRole[]): Promise<AuthenticatedUser> {
  const session = await cachedAuth()

  if (!session?.user) {
    redirect('/')
  }

  const user = session.user as AuthenticatedUser

  if (roles && !roles.includes(user.role)) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Server-side permission check with caching
 */
export async function requirePermission(permission: Permission): Promise<AuthenticatedUser> {
  const user = await requireAuth()

  if (!PermissionService.hasPermission(user.role, permission)) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Server-side admin access check with caching
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuth()

  if (!PermissionService.canAccessAdmin(user.role)) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Server-side IT system management check with caching
 */
export async function requireITSystemAccess(): Promise<AuthenticatedUser> {
  const user = await requireAuth()

  if (!PermissionService.canManageITSystem(user.role)) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Check if user has any of the specified roles with caching
 */
export async function requireAnyRole(roles: UserRole[]): Promise<AuthenticatedUser> {
  const user = await requireAuth()

  if (!roles.includes(user.role)) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Get current user without redirecting (cached)
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await cachedAuth()
  return session?.user as AuthenticatedUser | null
}

/**
 * Check if current user has permission without redirecting (cached)
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  return PermissionService.hasPermission(user.role, permission)
}

/**
 * Check if current user can access admin panel (cached)
 */
export async function canAccessAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  return PermissionService.canAccessAdmin(user.role)
}

/**
 * Check if current user can manage IT system (cached)
 */
export async function canManageITSystem(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false

  return PermissionService.canManageITSystem(user.role)
}

/**
 * Server-side authentication check for API routes (throws errors instead of redirecting)
 */
export async function requireAuthForAPI(roles?: UserRole[]): Promise<AuthenticatedUser> {
  const session = await cachedAuth()

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const user = session.user as AuthenticatedUser

  if (roles && !roles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }

  return user
}