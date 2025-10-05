import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { UserRole } from "@/lib/permissions"
import { createErrorResponse } from "./validation"

import { logger } from "@/lib/logger"
export interface AuthenticatedUser {
  id: string
  email?: string
  username?: string
  name?: string
  role: UserRole
  department?: string
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return null
    }
    return session.user as AuthenticatedUser
  } catch (error) {
    logger.error("Error getting authenticated user:", error)
    return null
  }
}

export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export async function requireRole(requiredRole: UserRole): Promise<AuthenticatedUser> {
  const user = await requireAuth()
  if (user.role !== requiredRole) {
    throw new Error(`Role ${requiredRole} required`)
  }
  return user
}

export async function requireAnyRole(roles: UserRole[]): Promise<AuthenticatedUser> {
  const user = await requireAuth()
  if (!roles.includes(user.role)) {
    throw new Error(`One of roles ${roles.join(', ')} required`)
  }
  return user
}

export function hasRole(user: AuthenticatedUser | null, role: UserRole): boolean {
  return user?.role === role
}

export function hasAnyRole(user: AuthenticatedUser | null, roles: UserRole[]): boolean {
  return user ? roles.includes(user.role) : false
}

// Standardized API route authentication
export async function authenticateRequest(): Promise<{ user: AuthenticatedUser; response?: Response }> {
  try {
    const user = await requireAuth()
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
    const user = await requireRole(UserRole.ADMIN)
    return { user }
  } catch (error) {
    return {
      user: null as any,
      response: createErrorResponse("Admin access required", 403)
    }
  }
}