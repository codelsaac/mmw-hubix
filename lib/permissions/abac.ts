import { User, Resource, Article } from '@prisma/client';
import { UserRole, Permission, PermissionService } from '@/lib/permissions';
import { createLogger } from '@/lib/logging/logger';

const logger = createLogger({ context: 'ABAC' });

/**
 * Permission Context
 * Contains all information needed to make access control decisions
 */
export interface PermissionContext {
  user: {
    id: string;
    role: UserRole;
    permissions?: string | null;
  };
  resource?: any; // The resource being accessed
  action: 'view' | 'create' | 'edit' | 'delete' | 'publish' | 'manage';
  timestamp?: Date;
  ipAddress?: string;
}

/**
 * ABAC (Attribute-Based Access Control) Service
 * 
 * Provides fine-grained permission checks based on:
 * - User attributes (role, permissions)
 * - Resource attributes (owner, status)
 * - Environmental attributes (time, location)
 * - Action type
 */
export class ABACService {
  /**
   * Check if user is the owner of a resource
   */
  static isResourceOwner(userId: string, resource: any): boolean {
    return resource?.createdBy === userId;
  }

  /**
   * Check if action is allowed during current time
   * For now, ADMIN users have no time restrictions
   */
  static isWithinTimeRestriction(context: PermissionContext): boolean {
    const timestamp = context.timestamp || new Date();
    const hour = timestamp.getHours();

    // ADMIN has no time restrictions
    if (context.user.role === UserRole.ADMIN) {
      return true;
    }

    // Work hours: 6:00 - 23:00 for HELPER
    if (context.user.role === UserRole.HELPER) {
      return hour >= 6 && hour < 23;
    }

    // GUEST can access anytime for view actions
    if (context.action === 'view') {
      return true;
    }

    return false;
  }

  /**
   * Check if resource status allows the action
   */
  static canModifyBasedOnStatus(resource: any, userRole: UserRole): boolean {
    // No status restriction
    if (!resource || !resource.status) {
      return true;
    }

    // ADMIN can modify anything
    if (userRole === UserRole.ADMIN) {
      return true;
    }

    // Published/Active content requires ADMIN permission to modify
    if (
      resource.status === 'PUBLISHED' ||
      resource.status === 'published' ||
      resource.status === 'active'
    ) {
      return false;
    }

    // Draft/Inactive content can be modified by HELPER
    return true;
  }

  /**
   * Comprehensive permission check
   */
  static async canAccessResource(context: PermissionContext): Promise<boolean> {
    const { user, resource, action } = context;

    try {
      // 1. Check base role permissions
      const hasRolePermission = this.checkRolePermission(user.role, action);
      if (!hasRolePermission) {
        logger.debug('Access denied: insufficient role permissions', {
          userId: user.id,
          role: user.role,
          action,
        });
        return false;
      }

      // 2. View action - generally allowed if role permission exists
      if (action === 'view') {
        return true;
      }

      // 3. Create action - check role permissions
      if (action === 'create') {
        return user.role === UserRole.ADMIN || user.role === UserRole.HELPER;
      }

      // 4. Modify actions (edit, delete, publish) - need resource context
      if (!resource) {
        logger.warn('Resource context required for modify actions', { action });
        return false;
      }

      // 5. Ownership check for non-ADMIN users
      if (user.role !== UserRole.ADMIN) {
        // HELPER can only modify their own resources
        if (action === 'edit' || action === 'delete') {
          if (!this.isResourceOwner(user.id, resource)) {
            logger.debug('Access denied: not resource owner', {
              userId: user.id,
              resourceId: resource.id,
            });
            return false;
          }
        }

        // Only ADMIN can publish
        if (action === 'publish') {
          return false;
        }
      }

      // 6. Status-based restrictions
      if (action === 'edit' || action === 'delete') {
        if (!this.canModifyBasedOnStatus(resource, user.role)) {
          logger.debug('Access denied: resource status restriction', {
            userId: user.id,
            resourceStatus: resource.status,
            role: user.role,
          });
          return false;
        }
      }

      // 7. Time-based restrictions
      if (!this.isWithinTimeRestriction(context)) {
        logger.debug('Access denied: outside allowed time window', {
          userId: user.id,
          role: user.role,
        });
        return false;
      }

      // All checks passed
      return true;
    } catch (error) {
      logger.error('Error in ABAC permission check', error as Error, {
        userId: user.id,
        action,
      });
      return false;
    }
  }

  /**
   * Role-based permission mapping
   */
  private static checkRolePermission(role: UserRole, action: string): boolean {
    switch (action) {
      case 'view':
        return true; // All roles can view
      case 'create':
        return role === UserRole.ADMIN || role === UserRole.HELPER;
      case 'edit':
      case 'delete':
        return role === UserRole.ADMIN || role === UserRole.HELPER;
      case 'publish':
      case 'manage':
        return role === UserRole.ADMIN;
      default:
        return false;
    }
  }

  /**
   * Get available actions for a user on a resource
   */
  static async getAvailableActions(
    user: { id: string; role: UserRole; permissions?: string | null },
    resource?: any
  ): Promise<string[]> {
    const actions = ['view', 'create', 'edit', 'delete', 'publish'] as const;
    const availableActions: string[] = [];

    for (const action of actions) {
      const canAccess = await this.canAccessResource({
        user,
        resource,
        action,
      });

      if (canAccess) {
        availableActions.push(action);
      }
    }

    return availableActions;
  }

  /**
   * Batch permission check for multiple resources
   */
  static async filterAccessibleResources<T extends { id: string; createdBy?: string | null }>(
    user: { id: string; role: UserRole; permissions?: string | null },
    resources: T[],
    action: 'view' | 'edit' | 'delete'
  ): Promise<T[]> {
    const accessibleResources: T[] = [];

    for (const resource of resources) {
      const canAccess = await this.canAccessResource({
        user,
        resource,
        action,
      });

      if (canAccess) {
        accessibleResources.push(resource);
      }
    }

    return accessibleResources;
  }

  /**
   * Check if user can access admin panel
   */
  static canAccessAdmin(user: { role: UserRole; permissions?: string | null }): boolean {
    return user.role === UserRole.ADMIN;
  }

  /**
   * Check if user can access IT system management
   */
  static canAccessITSystem(user: { role: UserRole; permissions?: string | null }): boolean {
    return user.role === UserRole.ADMIN || user.role === UserRole.HELPER;
  }

  /**
   * Check custom permission
   */
  static hasCustomPermission(
    user: { role: UserRole; permissions?: string | null },
    permission: Permission
  ): boolean {
    return PermissionService.hasPermission(
      user.role,
      permission,
      user.permissions
    );
  }

  /**
   * Require permission or throw error
   */
  static requirePermission(context: PermissionContext): void {
    const canAccess = this.canAccessResource(context);
    if (!canAccess) {
      throw new PermissionDeniedError(
        `Permission denied for action: ${context.action}`,
        context
      );
    }
  }
}

/**
 * Permission Denied Error
 */
export class PermissionDeniedError extends Error {
  constructor(
    message: string,
    public context: PermissionContext
  ) {
    super(message);
    this.name = 'PermissionDeniedError';
  }
}

/**
 * Middleware helper for API routes
 */
export async function requirePermission(
  user: { id: string; role: UserRole; permissions?: string | null } | null | undefined,
  action: 'view' | 'create' | 'edit' | 'delete' | 'publish' | 'manage',
  resource?: any
): Promise<void> {
  if (!user) {
    throw new PermissionDeniedError('Authentication required', {
      user: { id: '', role: UserRole.GUEST },
      action,
      resource,
    });
  }

  const canAccess = await ABACService.canAccessResource({
    user,
    resource,
    action,
  });

  if (!canAccess) {
    throw new PermissionDeniedError(`Permission denied for action: ${action}`, {
      user,
      action,
      resource,
    });
  }
}
