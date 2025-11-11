import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from "@/lib/logger"
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limiter'
import { handleApiError } from '@/lib/error-handler'
import { requireAuthAPI } from "@/lib/auth-server"
import { UserRole } from "@/lib/permissions"

// For demo purposes, we'll store updated user data in a simple in-memory store
// In a real application, this would be stored in the database
const userUpdates = new Map<string, any>()

const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  email: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().email('Invalid email format').optional()
  ),
  department: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().max(100, 'Department name too long').optional()
  ),
})

export async function GET(req: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.AUTH)
    if (rateLimitResult) return rateLimitResult

    // Only ADMIN and HELPER may access profile data
    const user = await requireAuthAPI([UserRole.ADMIN, UserRole.HELPER])
    const userId = user.id
    const userUpdates = getUserUpdates(userId)
    
    return NextResponse.json({
      id: user.id,
      username: user.username,
      name: userUpdates.name || user.name,
      email: userUpdates.email || user.email,
      department: userUpdates.department || user.department,
      role: user.role,
      image: user.image
    })
  } catch (error) {
    logger.error('[PROFILE_GET]', error)
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.AUTH)
    if (rateLimitResult) return rateLimitResult

    // Only ADMIN and HELPER may update profile
    const user = await requireAuthAPI([UserRole.ADMIN, UserRole.HELPER])

    const body = await request.json()
    logger.log('[PROFILE_PATCH] Received body:', body)
    
    const validatedData = profileUpdateSchema.parse(body)
    logger.log('[PROFILE_PATCH] Validated data:', validatedData)
    
    const userId = user.id
    
    // Store the updates (in a real app, this would update the database)
    const currentUpdates = getUserUpdates(userId)
    const newUpdates = { ...currentUpdates, ...validatedData }
    userUpdates.set(userId, newUpdates)
    
    logger.log(`[PROFILE_UPDATE] User ${userId} updated profile:`, validatedData)
    
    return NextResponse.json({
      id: userId,
      username: user.username,
      name: newUpdates.name || user.name,
      email: newUpdates.email || user.email,
      department: newUpdates.department || user.department,
      role: user.role,
      image: user.image
    })
  } catch (error) {
    logger.error('[PROFILE_PATCH]', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 })
    }
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

// Helper function to get user updates
function getUserUpdates(userId: string) {
  return userUpdates.get(userId) || {}
}
