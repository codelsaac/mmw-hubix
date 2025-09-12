import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { UserRole, Permission, PermissionService } from "@/lib/permissions"

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: UserRole
  department: string
  description?: string
}

/**
 * Server-side authentication check
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/')
  }
  
  return session.user as AuthenticatedUser
}

/**
 * Server-side permission check
 */
export async function requirePermission(permission: Permission): Promise<AuthenticatedUser> {
  const user = await requireAuth()
  
  if (!PermissionService.hasPermission(user.role, permission)) {
    redirect('/unauthorized')
  }
  
  return user
}

/**
 * Server-side admin access check
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuth()
  
  if (!PermissionService.canAccessAdmin(user.role)) {
    redirect('/unauthorized')
  }
  
  return user
}

/**
 * Server-side IT system management check
 */
export async function requireITSystemAccess(): Promise<AuthenticatedUser> {
  const user = await requireAuth()
  
  if (!PermissionService.canManageITSystem(user.role)) {
    redirect('/unauthorized')
  }
  
  return user
}

/**
 * Check if user has any of the specified roles
 */
export async function requireAnyRole(roles: UserRole[]): Promise<AuthenticatedUser> {
  const user = await requireAuth()
  
  if (!roles.includes(user.role)) {
    redirect('/unauthorized')
  }
  
  return user
}

/**
 * Get current user without redirecting
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions)
  return session?.user as AuthenticatedUser || null
}

/**
 * Check if current user has permission without redirecting
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  
  return PermissionService.hasPermission(user.role, permission)
}

/**
 * Check if current user can access admin panel
 */
export async function canAccessAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  
  return PermissionService.canAccessAdmin(user.role)
}

/**
 * Check if current user can manage IT system
 */
export async function canManageITSystem(): Promise<boolean> {
  const user = await getCurrentUser()
  if (!user) return false
  
  return PermissionService.canManageITSystem(user.role)
}
