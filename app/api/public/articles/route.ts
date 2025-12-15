import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limiter'
import { handleApiError } from '@/lib/error-handler'
import { cacheLife } from 'next/cache'

// Cached function for fetching articles (rate limiting happens outside)
async function getCachedArticles(page: number, limit: number, search: string | null) {
  'use cache'
  cacheLife('minutes')

  const skip = (page - 1) * limit

  // Build where clause
  const where: any = {
    status: 'PUBLISHED',
    isPublic: true,
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.article.count({ where }),
  ])

  return {
    articles,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

// GET /api/public/articles - Get all published public articles
export async function GET(request: NextRequest) {
  try {
    // Rate limiting must happen before cache check
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.GENERAL)
    if (rateLimitResult) return rateLimitResult

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const result = await getCachedArticles(page, limit, search)

    return NextResponse.json(result)
  } catch (error) {
    logger.error('Error fetching public articles:', error)
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
