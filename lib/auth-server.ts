import { redirect } from "next/navigation";
import { cache } from "react";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { UserRole, Permission, PermissionService } from "@/lib/permissions";
import { AuthenticatedUser } from "@/types/auth";
import { auth } from "@/lib/better-auth";

// Cache authentication checks to reduce repeated session lookups
const cachedAuth = cache(async (h: Headers) => {
  const session = await auth.api.getSession({ headers: h });
  
  // If we have a user, fetch additional fields from the database
  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        department: true,
        permissions: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (dbUser) {
      // Create a new user object with properly typed properties
      const userData = {
        ...dbUser,
        // Ensure email is always a string (Better Auth expects string, not string | null)
        email: dbUser.email || "",
        // Ensure name is always a string
        name: dbUser.name || "",
        // Ensure permissions is always a string
        permissions: dbUser.permissions || ""
      };
      session.user = { ...session.user, ...userData };
    }
  }
  
  return session;
});

/**
 * Get current user without redirecting (cached)
 */
export async function getCurrentUser(h?: Headers): Promise<AuthenticatedUser | null> {
  try {
    const reqHeaders = h || await headers();
    const session = await cachedAuth(reqHeaders);
    return (session?.user || null) as AuthenticatedUser | null;
  } catch {
    return null;
  }
}

/**
 * Server-side authentication check for pages (redirects on failure)
 */
export async function requireAuth(roles?: UserRole[], h?: Headers): Promise<AuthenticatedUser> {
  // For Server Components, headers() works. For API routes, headers must be passed explicitly
  const reqHeaders = h || await headers();
  const session = await cachedAuth(reqHeaders);

  if (!session?.user) {
    redirect("/");
  }

  const user = session.user as unknown as AuthenticatedUser;

  if (roles && !roles.includes(user.role)) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Server-side authentication check for API routes (throws errors instead of redirecting)
 */
export async function requireAuthAPI(roles?: UserRole[], h?: Headers): Promise<AuthenticatedUser> {
  // In API routes, headers must be explicitly passed
  const reqHeaders = h || new Headers();
  const session = await cachedAuth(reqHeaders);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = session.user as unknown as AuthenticatedUser;

  if (roles && !roles.includes(user.role)) {
    throw new Error("Insufficient permissions");
  }

  return user;
}

/**
 * Server-side permission check (redirects on failure)
 */
export async function requirePermission(permission: Permission, h?: Headers): Promise<AuthenticatedUser> {
  const user = await requireAuth(undefined, h);

  if (!PermissionService.hasPermission(user.role, permission, user.permissions)) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Server-side admin access check (redirects on failure)
 */
export async function requireAdmin(h?: Headers): Promise<AuthenticatedUser> {
  const user = await requireAuth(undefined, h);

  if (!PermissionService.canAccessAdmin(user.role, user.permissions)) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Server-side IT system management check (redirects on failure)
 */
export async function requireITSystemAccess(h?: Headers): Promise<AuthenticatedUser> {
  const user = await requireAuth(undefined, h);

  if (!PermissionService.canManageITSystem(user.role, user.permissions)) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Check if user has any of the specified roles (redirects on failure)
 */
export async function requireAnyRole(roles: UserRole[], h?: Headers): Promise<AuthenticatedUser> {
  const user = await requireAuth(undefined, h);

  if (!roles.includes(user.role)) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Check if current user has permission without redirecting (cached)
 */
export async function checkPermission(permission: Permission, h?: Headers): Promise<boolean> {
  const user = await getCurrentUser(h);
  if (!user) return false;

  return PermissionService.hasPermission(user.role, permission, user.permissions);
}

/**
 * Check if current user can access admin panel (cached)
 */
export async function canAccessAdmin(h?: Headers): Promise<boolean> {
  const user = await getCurrentUser(h);
  if (!user) return false;

  return PermissionService.canAccessAdmin(user.role, user.permissions);
}

/**
 * Check if current user can manage IT system (cached)
 */
export async function canManageITSystem(h?: Headers): Promise<boolean> {
  const user = await getCurrentUser(h);
  if (!user) return false;

  return PermissionService.canManageITSystem(user.role, user.permissions);
}

/**
 * Helper functions for API routes with standardized error responses
 */
export function createErrorResponse(message: string, status: number = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function createSuccessResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Standardized API route authentication
 */
export async function authenticateRequest(h?: Headers): Promise<{ user: AuthenticatedUser; response?: Response }> {
  try {
    const user = await requireAuthAPI(undefined, h);
    return { user };
  } catch (error) {
    return {
      user: null as any,
      response: createErrorResponse("Authentication required", 401),
    };
  }
}

export async function authenticateAdminRequest(h?: Headers): Promise<{ user: AuthenticatedUser; response?: Response }> {
  try {
    const user = await requireAuthAPI([UserRole.ADMIN, UserRole.HELPER], h);
    return { user };
  } catch (error) {
    return {
      user: null as any,
      response: createErrorResponse("Admin access required", 403),
    };
  }
}
