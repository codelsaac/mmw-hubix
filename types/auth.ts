import { UserRole } from "@/lib/permissions"

/**
 * Server-side authenticated user type
 * Used in API routes and server components
 */
export interface AuthenticatedUser {
  id: string
  email?: string | null
  username?: string
  name?: string | null
  role: UserRole
  department?: string
  permissions?: string | null
}

/**
 * Client-side auth user type
 * Used in client components and hooks
 */
export interface AuthUser {
  id?: string
  name?: string | null
  email?: string | null
  username?: string
  image?: string | null
  role?: UserRole
  department?: string
  description?: string
  permissions?: string | null
}

