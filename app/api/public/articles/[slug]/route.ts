import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limiter'
import { handleApiError } from '@/lib/error-handler'

// GET /api/public/articles/[slug] - Get specific published article by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.GENERAL)
    if (rateLimitResult) return rateLimitResult

    const { slug } = await params
    const article = await prisma.article.findUnique({
      where: { 
        slug,
        status: 'PUBLISHED',
        isPublic: true,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json(article)
  } catch (error) {
    logger.error('Error fetching article:', error)
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
