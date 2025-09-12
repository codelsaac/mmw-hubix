export enum UserRole {
  ADMIN = 'ADMIN',
  HELPER = 'HELPER',
  GUEST = 'GUEST'
}

export enum Permission {
  // Website Administration
  MANAGE_WEBSITE = 'MANAGE_WEBSITE',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_SYSTEM_SETTINGS = 'MANAGE_SYSTEM_SETTINGS',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  MANAGE_ANNOUNCEMENTS = 'MANAGE_ANNOUNCEMENTS',
  
  // IT Perfect System Management
  MANAGE_IT_SYSTEM = 'MANAGE_IT_SYSTEM',
  MANAGE_RESOURCES = 'MANAGE_RESOURCES',
  MANAGE_TRAINING_VIDEOS = 'MANAGE_TRAINING_VIDEOS',
  MANAGE_TASKS = 'MANAGE_TASKS',
  MANAGE_ACTIVITIES = 'MANAGE_ACTIVITIES',
  MANAGE_CALENDAR = 'MANAGE_CALENDAR',
  
  // View Permissions
  VIEW_TRAINING_VIDEOS = 'VIEW_TRAINING_VIDEOS',
  VIEW_RESOURCES = 'VIEW_RESOURCES',
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  VIEW_CALENDAR = 'VIEW_CALENDAR',
  VIEW_TEAM_INFO = 'VIEW_TEAM_INFO'
}

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Full system access
    Permission.MANAGE_WEBSITE,
    Permission.MANAGE_USERS,
    Permission.MANAGE_SYSTEM_SETTINGS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_ANNOUNCEMENTS,
    Permission.MANAGE_IT_SYSTEM,
    Permission.MANAGE_RESOURCES,
    Permission.MANAGE_TRAINING_VIDEOS,
    Permission.MANAGE_TASKS,
    Permission.MANAGE_ACTIVITIES,
    Permission.MANAGE_CALENDAR,
    Permission.VIEW_TRAINING_VIDEOS,
    Permission.VIEW_RESOURCES,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CALENDAR,
    Permission.VIEW_TEAM_INFO
  ],
  [UserRole.HELPER]: [
    // IT Perfect system management only
    Permission.MANAGE_IT_SYSTEM,
    Permission.MANAGE_RESOURCES,
    Permission.MANAGE_TRAINING_VIDEOS,
    Permission.MANAGE_TASKS,
    Permission.MANAGE_ACTIVITIES,
    Permission.MANAGE_CALENDAR,
    Permission.VIEW_TRAINING_VIDEOS,
    Permission.VIEW_RESOURCES,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CALENDAR,
    Permission.VIEW_TEAM_INFO
  ],
  [UserRole.GUEST]: [
    // Public access with training materials
    Permission.VIEW_TRAINING_VIDEOS,
    Permission.VIEW_RESOURCES,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CALENDAR,
    Permission.VIEW_TEAM_INFO
  ]
}

export class PermissionService {
  /**
   * Check if a user has a specific permission
   */
  static hasPermission(userRole: UserRole, permission: Permission): boolean {
    if (!userRole) return false
    const rolePermissions = ROLE_PERMISSIONS[userRole]
    if (!rolePermissions) return false
    return rolePermissions.includes(permission)
  }

  /**
   * Check if a user has any of the specified permissions
   */
  static hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
    if (!userRole || !permissions || permissions.length === 0) return false
    return permissions.some(permission => this.hasPermission(userRole, permission))
  }

  /**
   * Check if a user has all of the specified permissions
   */
  static hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
    if (!userRole || !permissions || permissions.length === 0) return false
    return permissions.every(permission => this.hasPermission(userRole, permission))
  }

  /**
   * Get all permissions for a user role
   */
  static getRolePermissions(userRole: UserRole): Permission[] {
    if (!userRole) return []
    return ROLE_PERMISSIONS[userRole] || []
  }

  /**
   * Check if user can access admin panel
   */
  static canAccessAdmin(userRole: UserRole): boolean {
    return this.hasPermission(userRole, Permission.MANAGE_WEBSITE)
  }

  /**
   * Check if user can manage IT Perfect system
   */
  static canManageITSystem(userRole: UserRole): boolean {
    return this.hasPermission(userRole, Permission.MANAGE_IT_SYSTEM)
  }

  /**
   * Check if user has read-only access
   */
  static isReadOnly(userRole: UserRole): boolean {
    return userRole === UserRole.GUEST
  }

  /**
   * Get user role display name
   */
  static getRoleDisplayName(userRole: UserRole): string {
    switch (userRole) {
      case UserRole.ADMIN:
        return 'System Administrator'
      case UserRole.HELPER:
        return 'IT Assistant'
      case UserRole.GUEST:
        return 'Guest User'
      default:
        return 'Unknown Role'
    }
  }

  /**
   * Get user role description
   */
  static getRoleDescription(userRole: UserRole): string {
    switch (userRole) {
      case UserRole.ADMIN:
        return 'Can manage entire website and IT Perfect system features'
      case UserRole.HELPER:
        return 'Can manage IT Perfect system but cannot access website admin features'
      case UserRole.GUEST:
        return 'Public access to training videos and learning materials'
      default:
        return 'No permission description'
    }
  }
}
