import { NextRequest, NextResponse } from 'next/server'
import { requireAuthForAPI } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { UserRole } from '@/lib/permissions'

// GET /api/admin/articles/[id] - Get specific article for admin
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthForAPI([UserRole.ADMIN])

    const article = await prisma.article.findUnique({
      where: { id: params.id },
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

    return NextResponse.json(article)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    logger.error('Error fetching article:', error)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}

// PUT /api/admin/articles/[id] - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthForAPI([UserRole.ADMIN])

    const data = await request.json()

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id: params.id },
    })

    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Generate new slug if title changed
    let slug = existingArticle.slug
    if (data.title && data.title !== existingArticle.title) {
      const newSlug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      // Ensure slug is unique
      let uniqueSlug = newSlug
      let counter = 1
      while (await prisma.article.findUnique({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${newSlug}-${counter}`
        counter++
      }
      slug = uniqueSlug
    }

    // Set publishedAt if status changes to PUBLISHED
    let publishedAt = existingArticle.publishedAt
    if (data.status === 'PUBLISHED' && existingArticle.status !== 'PUBLISHED') {
      publishedAt = new Date()
    }

    const article = await prisma.article.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: slug,
        content: data.content,
        excerpt: data.excerpt,
        status: data.status,
        isPublic: data.isPublic,
        publishedAt: publishedAt,
        tags: data.tags,
        category: data.category,
        featuredImage: data.featuredImage,
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

    return NextResponse.json(article)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    logger.error('Error updating article:', error)
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

// DELETE /api/admin/articles/[id] - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthForAPI([UserRole.ADMIN])

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id: params.id },
    })

    if (!existingArticle) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    await prisma.article.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Article deleted successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    logger.error('Error deleting article:', error)
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
