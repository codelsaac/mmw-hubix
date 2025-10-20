import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { z } from 'zod'
import { logger } from "@/lib/logger"
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limiter'
import { handleApiError } from '@/lib/error-handler'

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

    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const userUpdates = getUserUpdates(userId)
    
    return NextResponse.json({
      id: session.user.id,
      username: session.user.username,
      name: userUpdates.name || session.user.name,
      email: userUpdates.email || session.user.email,
      department: userUpdates.department || session.user.department,
      role: session.user.role,
      image: session.user.image
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

    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    logger.log('[PROFILE_PATCH] Received body:', body)
    
    const validatedData = profileUpdateSchema.parse(body)
    logger.log('[PROFILE_PATCH] Validated data:', validatedData)
    
    const userId = session.user.id
    
    // Store the updates (in a real app, this would update the database)
    const currentUpdates = getUserUpdates(userId)
    const newUpdates = { ...currentUpdates, ...validatedData }
    userUpdates.set(userId, newUpdates)
    
    logger.log(`[PROFILE_UPDATE] User ${userId} updated profile:`, validatedData)
    
    return NextResponse.json({
      id: userId,
      username: session.user.username,
      name: newUpdates.name || session.user.name,
      email: newUpdates.email || session.user.email,
      department: newUpdates.department || session.user.department,
      role: session.user.role,
      image: session.user.image
    })
  } catch (error) {
    logger.error('[PROFILE_PATCH]', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to get user updates
function getUserUpdates(userId: string) {
  return userUpdates.get(userId) || {}
}
