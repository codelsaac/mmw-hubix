import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdminRequest } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limiter'
import { handleApiError } from '@/lib/error-handler'
import { z } from 'zod'

// GET /api/admin/articles - Get all articles for admin management
export async function GET(req: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(req, RATE_LIMITS.ADMIN)
    if (rateLimitResult) return rateLimitResult

    const { user, response } = await authenticateAdminRequest(req.headers);
    
    if (response) {
      return response;
    }

    const articles = await prisma.article.findMany({
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
        createdAt: 'desc',
      },
    })

    return NextResponse.json(articles)
  } catch (error) {
    logger.error('Error fetching articles:', error)
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

const articleSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  tags: z.string().optional(),
  featuredImage: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional().default(true),
})

// POST /api/admin/articles - Create new article
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await rateLimit(request, RATE_LIMITS.ADMIN)
    if (rateLimitResult) return rateLimitResult

    const { user, response } = await authenticateAdminRequest(request.headers);
    
    if (response) {
      return response;
    }

    const data = await request.json()
    const validated = articleSchema.parse(data)
    
    // Generate slug from title
    const slug = validated.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    // Ensure slug is unique
    let uniqueSlug = slug
    let counter = 1
    while (await prisma.article.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    const article = await prisma.article.create({
      data: {
        title: validated.title,
        slug: uniqueSlug,
        content: validated.content,
        excerpt: validated.excerpt,
        status: 'PUBLISHED',
        isPublic: validated.isPublic,
        publishedAt: new Date(),
        tags: validated.tags,
        featuredImage: validated.featuredImage,
        createdBy: user.id,
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

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    logger.error('Error creating article:', error)
    const { message, statusCode } = handleApiError(error)
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
