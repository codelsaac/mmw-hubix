import { NextRequest, NextResponse } from 'next/server'
import { UserRole, Permission, PermissionService } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { logger } from "@/lib/logger"
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limiter'
import { handleApiError } from '@/lib/error-handler'
import { z } from 'zod'
import { authenticateAdminRequest } from '@/lib/auth-server'

// GET /api/admin/announcements - Get all announcements for admin management
export async function GET(req: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.ADMIN)
    if (rateLimitResult) return rateLimitResult

    const { user, response: authResponse } = await authenticateAdminRequest(req.headers)
    if (authResponse) return authResponse
    
    // Debug user information
    logger.info('User info:', {
      userId: user.id,
      userRole: user.role,
      expectedRoles: [UserRole.ADMIN, UserRole.HELPER]
    })
    
    // Check if user has permission to manage announcements
    if (!PermissionService.hasPermission(user.role, Permission.MANAGE_ANNOUNCEMENTS, user.permissions)) {
      logger.error('Authorization failed:', {
        userId: user.id,
        userRole: user.role,
        requiredPermission: Permission.MANAGE_ANNOUNCEMENTS,
        userPermissions: user.permissions
      })
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const announcements = await prisma.announcement.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return NextResponse.json(announcements)
  } catch (error) {
    logger.error('Error fetching announcements:', error)
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

const announcementSchema = z.object({
  title: z.string().min(1).max(200),
  club: z.string().min(1).max(100),
  date: z.string(), // ISO date string
  time: z.string().default(''),
  location: z.string().max(200).default(''),
  description: z.string().min(1),
  maxAttendees: z.number().int().positive().optional().nullable(),
  attendees: z.number().int().nonnegative().default(0),
  type: z.string().default('event'),
  status: z.enum(['active', 'cancelled', 'completed']).default('active'),
  isPublic: z.boolean().default(true),
})

// POST /api/admin/announcements - Create new announcement
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.ADMIN)
    if (rateLimitResult) return rateLimitResult

    const { user, response: authResponse } = await authenticateAdminRequest(request.headers)
    if (authResponse) return authResponse
    
    // Check if user has permission to manage announcements
    if (!PermissionService.hasPermission(user.role, Permission.MANAGE_ANNOUNCEMENTS, user.permissions)) {
      logger.error('Authorization failed:', {
        userId: user.id,
        userRole: user.role,
        requiredPermission: Permission.MANAGE_ANNOUNCEMENTS,
        userPermissions: user.permissions
      })
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const data = await request.json()
    const validated = announcementSchema.parse(data)
    
    const announcement = await prisma.announcement.create({
      data: {
        title: validated.title,
        club: validated.club,
        date: new Date(validated.date),
        time: validated.time,
        location: validated.location,
        description: validated.description,
        maxAttendees: validated.maxAttendees,
        attendees: validated.attendees,
        type: validated.type,
        status: validated.status,
        isPublic: validated.isPublic,
        createdBy: user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    logger.error('Error creating announcement:', error)
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
