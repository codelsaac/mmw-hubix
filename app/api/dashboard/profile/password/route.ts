import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { z } from 'zod'
import { logger } from "@/lib/logger"
import { verifyCurrentPassword, updatePassword, getDemoAccount } from "@/lib/password-utils"
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limiter'
import { handleApiError } from '@/lib/error-handler'

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long')
})

export async function PATCH(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.AUTH)
    if (rateLimitResult) return rateLimitResult

    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = passwordChangeSchema.parse(body)
    
    const userId = session.user.id
    const username = session.user.username
    
    // Find the demo account
    const demoAccount = getDemoAccount(userId)
    if (!demoAccount) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 })
    }
    
    // Verify current password
    if (!verifyCurrentPassword(userId, currentPassword)) {
      return NextResponse.json({ 
        error: 'Current password is incorrect' 
      }, { status: 400 })
    }
    
    // Store the new password (in a real app, this would be hashed and stored in database)
    updatePassword(userId, newPassword)
    
    logger.log(`[PASSWORD_CHANGE] User ${userId} (${username}) changed password successfully`)
    
    return NextResponse.json({ 
      message: 'Password changed successfully' 
    })
  } catch (error) {
    logger.error('[PASSWORD_CHANGE]', error)
    
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

