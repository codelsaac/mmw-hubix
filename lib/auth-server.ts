import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { redirect } from "next/navigation"
import { UserRole, Permission, PermissionService } from "@/lib/permissions"
import { cache } from "react"
import { AuthenticatedUser } from "@/types/auth"

// Cache authentication checks to reduce database calls
const cachedAuth = cache(() => getServerSession(authOptions))

/**
 * Get current user without redirecting (cached)
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const session = await cachedAuth()
    return session?.user as AuthenticatedUser | null
  } catch (error) {
    return null
  }
}

/**
 * Server-side authentication check for pages (redirects on failure)
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
 * Server-side authentication check for API routes (throws errors instead of redirecting)
 */
export async function requireAuthAPI(roles?: UserRole[]): Promise<AuthenticatedUser> {
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

/**
 * Server-side permission check (redirects on failure)
 */
export async function requirePermission(permission: Permission): Promise<AuthenticatedUser> {
  const user = await requireAuth()

  if (!PermissionService.hasPermission(user.role, permission)) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Server-side admin access check (redirects on failure)
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuth()

  if (!PermissionService.canAccessAdmin(user.role)) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Server-side IT system management check (redirects on failure)
 */
export async function requireITSystemAccess(): Promise<AuthenticatedUser> {
  const user = await requireAuth()

  if (!PermissionService.canManageITSystem(user.role)) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Check if user has any of the specified roles (redirects on failure)
 */
export async function requireAnyRole(roles: UserRole[]): Promise<AuthenticatedUser> {
  const user = await requireAuth()

  if (!roles.includes(user.role)) {
    redirect('/unauthorized')
  }

  return user
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
 * Helper functions for API routes with standardized error responses
 */
export function createErrorResponse(message: string, status: number = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export function createSuccessResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * Standardized API route authentication
 */
export async function authenticateRequest(): Promise<{ user: AuthenticatedUser; response?: Response }> {
  try {
    const user = await requireAuthAPI()
    return { user }
  } catch (error) {
    return {
      user: null as any,
      response: createErrorResponse("Authentication required", 401)
    }
  }
}

export async function authenticateAdminRequest(): Promise<{ user: AuthenticatedUser; response?: Response }> {
  try {
    const user = await requireAuthAPI([UserRole.ADMIN])
    return { user }
  } catch (error) {
    return {
      user: null as any,
      response: createErrorResponse("Admin access required", 403)
    }
  }
}

