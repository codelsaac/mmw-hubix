import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET /api/public/articles/[slug] - Get specific published article by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const article = await prisma.article.findUnique({
      where: {
        slug: params.slug,
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
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}
