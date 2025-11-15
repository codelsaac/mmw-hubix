import { z } from 'zod'

// Common validation patterns
const usernamePattern = /^[a-zA-Z0-9_-]{3,50}$/
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/

// Base schemas
const booleanLike = z.coerce.boolean({ invalid_type_error: "Value must be a boolean" })
const numberLike = z.coerce.number({ invalid_type_error: "Value must be a number" })

export const BaseSchemas = {
  id: z.string().min(1, 'ID is required'),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username too long')
    .regex(usernamePattern, 'Username can only contain letters, numbers, hyphens, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordPattern, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .optional(),
  url: z.string().url('Invalid URL format'),
  date: z.string().datetime('Invalid date format'),
  text: z.string().max(10000, 'Text too long'),
  shortText: z.string().max(500, 'Text too long'),
  longText: z.string().max(50000, 'Text too long'),
}

export const SettingsSchemas = {
  update: z.object({
    siteName: z.string().min(1, "Site name is required").max(150, "Site name too long"),
    siteDescription: z.string().max(500, "Description too long"),
    maxFileSize: numberLike.min(1, "Max file size must be at least 1 MB"),
    allowedFileTypes: z.string().min(1, "Allowed file types are required"),
    maintenanceMode: booleanLike,
    registrationEnabled: booleanLike,
    sessionTimeout: numberLike.min(1, "Session timeout must be at least 1 minute"),
    maxLoginAttempts: numberLike.min(1, "Max login attempts must be at least 1"),
    autoBackup: booleanLike,
    backupFrequency: z.enum(["daily", "weekly", "monthly"], {
      errorMap: () => ({ message: "Backup frequency must be daily, weekly, or monthly" }),
    }),
    // Legacy flag kept for backwards compatibility
    isMaintenanceMode: booleanLike.optional(),
  })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one setting must be provided",
      path: [],
    }),
}

// User schemas
export const UserSchemas = {
  create: z.object({
    name: BaseSchemas.name,
    email: BaseSchemas.email,
    username: BaseSchemas.username,
    password: BaseSchemas.password,
    role: z.enum(['ADMIN', 'HELPER', 'GUEST'], {
      errorMap: () => ({ message: 'Role must be ADMIN, HELPER, or GUEST' })
    }),
    department: z.string().min(1, 'Department is required').max(100, 'Department name too long'),
    isActive: z.boolean().default(true)
  }),

  update: z.object({
    name: BaseSchemas.name.optional(),
    email: BaseSchemas.email.optional(),
    username: BaseSchemas.username.optional(),
    role: z.enum(['ADMIN', 'HELPER', 'GUEST']).optional(),
    department: z.string().min(1).max(100).optional(),
    isActive: z.boolean().optional()
  }),

  login: z.object({
    username: BaseSchemas.username,
    password: z.string().min(1, 'Password is required')
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your new password')
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),

  profileUpdate: z.object({
    name: BaseSchemas.name.optional(),
    email: BaseSchemas.email.optional(),
    department: z.string().min(1).max(100).optional()
  })
}

// Announcement schemas
export const AnnouncementSchemas = {
  create: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    club: z.string().min(1, 'Club is required').max(100, 'Club name too long'),
    date: z.string().datetime('Invalid date format'),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    location: z.string().max(200, 'Location too long').optional(),
    description: BaseSchemas.longText.optional(),
    maxAttendees: z.number().int().min(1, 'Max attendees must be at least 1').max(10000, 'Max attendees too high').optional(),
    type: z.string().max(50, 'Type too long').default('general'),
    isPublic: z.boolean().default(true)
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    club: z.string().min(1).max(100).optional(),
    date: z.string().datetime().optional(),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    location: z.string().max(200).optional(),
    description: BaseSchemas.longText.optional(),
    maxAttendees: z.number().int().min(1).max(10000).optional(),
    type: z.string().max(50).optional(),
    isPublic: z.boolean().optional(),
    status: z.enum(['active', 'cancelled', 'completed']).optional()
  })
}

// Event schemas
export const EventSchemas = {
  create: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: BaseSchemas.longText.optional(),
    startTime: z.string().datetime('Invalid start time format'),
    endTime: z.string().datetime('Invalid end time format'),
    location: z.string().max(200, 'Location too long').optional(),
    eventType: z.string().max(50, 'Event type too long').default('general'),
    isVisible: z.boolean().default(true)
  }).refine(data => new Date(data.startTime) < new Date(data.endTime), {
    message: 'End time must be after start time',
    path: ['endTime']
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    description: BaseSchemas.longText.optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    location: z.string().max(200).optional(),
    eventType: z.string().max(50).optional(),
    isVisible: z.boolean().optional()
  })
}

// Helper function to validate external URLs
const isExternalUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    // Block localhost and internal admin routes
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      return false
    }
    // Block relative URLs and internal paths containing /admin/, /api/, /dashboard/
    const blockedPaths = ['/admin', '/api', '/dashboard', '/auth']
    if (blockedPaths.some(path => urlObj.pathname.includes(path))) {
      return false
    }
    return true
  } catch {
    return false
  }
}

// Resource schemas
export const ResourceSchemas = {
  create: z.object({
    name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
    url: BaseSchemas.url.refine(
      (url) => isExternalUrl(url),
      { message: 'URL must be an external link (not localhost, admin, or internal routes)' }
    ),
    description: BaseSchemas.longText,
    category: z.string().min(1, 'Category is required').max(100, 'Category too long'),
    status: z.enum(['active', 'inactive', 'archived']).default('active')
  }),

  update: z.object({
    name: z.string().min(1).max(200).optional(),
    url: BaseSchemas.url.refine(
      (url) => isExternalUrl(url),
      { message: 'URL must be an external link (not localhost, admin, or internal routes)' }
    ).optional(),
    description: BaseSchemas.longText.optional(),
    category: z.string().min(1).max(100).optional(),
    status: z.enum(['active', 'inactive', 'archived']).optional()
  })
}

// Task schemas
export const TaskSchemas = {
  create: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: BaseSchemas.longText.optional(),
    dueDate: z.string().datetime('Invalid due date format'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    assignedTo: z.string().min(1, 'Assigned to is required').optional()
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    description: BaseSchemas.longText.optional(),
    dueDate: z.string().datetime().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    assignedTo: z.string().min(1).optional()
  })
}

// Activity schemas
export const ActivitySchemas = {
  create: z.object({
    type: z.string().min(1, 'Type is required').max(50, 'Type too long'),
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: BaseSchemas.longText,
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    assignedTo: z.string().min(1, 'Assigned to is required').optional()
  }),

  update: z.object({
    type: z.string().min(1).max(50).optional(),
    title: z.string().min(1).max(200).optional(),
    description: BaseSchemas.longText.optional(),
    status: z.enum(['new', 'in_progress', 'completed', 'cancelled']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    assignedTo: z.string().min(1).optional()
  })
}

// File upload schemas
export const FileSchemas = {
  upload: z.object({
    file: z.instanceof(File, { message: 'File is required' }),
    category: z.string().min(1, 'Category is required').max(50, 'Category too long').optional(),
    description: BaseSchemas.shortText.optional()
  })
}

// Chat schemas
export const ChatSchemas = {
  message: z.object({
    messages: z.array(z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1, 'Message content is required').max(4000, 'Message too long')
    })).min(1, 'At least one message is required').max(20, 'Too many messages')
  })
}

// Search schemas
export const SearchSchemas = {
  query: z.object({
    q: z.string().min(1, 'Search query is required').max(200, 'Query too long'),
    type: z.enum(['all', 'announcements', 'events', 'resources', 'users']).default('all'),
    limit: z.number().int().min(1).max(100).default(20),
    offset: z.number().int().min(0).default(0)
  })
}

// Pagination schemas
export const PaginationSchemas = {
  params: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    sort: z.string().max(50).optional(),
    order: z.enum(['asc', 'desc']).default('desc')
  })
}

// Export all schemas
export const ValidationSchemas = {
  Base: BaseSchemas,
  User: UserSchemas,
  Announcement: AnnouncementSchemas,
  Event: EventSchemas,
  Resource: ResourceSchemas,
  Task: TaskSchemas,
  Activity: ActivitySchemas,
  File: FileSchemas,
  Chat: ChatSchemas,
  Search: SearchSchemas,
  Pagination: PaginationSchemas
}

// Sanitization helpers
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Validation helper functions
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return { success: false, error: errorMessage }
    }
    return { success: false, error: 'Invalid input format' }
  }
}

export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true
  data: T
} | {
  success: false
  errors: string[]
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return {
      success: false,
      errors: ['Invalid data format']
    }
  }
}

// API response helpers (moved from validation.ts)
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