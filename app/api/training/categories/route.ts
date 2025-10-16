import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PermissionService, Permission, UserRole } from "@/lib/permissions"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    // Get all unique categories from existing resources
    const resources = await prisma.trainingResource.findMany({
      select: {
        tags: true
      }
    })

    const categorySet = new Set<string>()
    resources.forEach(resource => {
      if (resource.tags) {
        try {
          const tags = JSON.parse(resource.tags)
          if (Array.isArray(tags)) {
            tags.forEach(tag => categorySet.add(tag))
          }
        } catch (error) {
          logger.error('Error parsing tags:', error)
        }
      }
    })

    const categories = Array.from(categorySet)
    return NextResponse.json(categories)
  } catch (error) {
    logger.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    logger.log('Categories API POST request received')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      logger.log('No session found, returning 401')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Ensure the user exists in the database first
    const user = await prisma.user.upsert({
      where: { id: session.user.id },
      update: {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role as UserRole,
        department: session.user.department,
      },
      create: {
        id: session.user.id,
        username: session.user.username || session.user.email?.split('@')[0] || 'user',
        name: session.user.name || 'User',
        email: session.user.email,
        role: (session.user.role as UserRole) || UserRole.GUEST,
        department: session.user.department || 'General',
      }
    })

    // Check permissions
    if (!PermissionService.hasPermission(user.role as UserRole, Permission.MANAGE_TRAINING_VIDEOS)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, categoryName, newCategoryName } = body
    
    logger.log('Request body:', { action, categoryName, newCategoryName })

    if (action === 'add') {
      if (!newCategoryName) {
        return NextResponse.json(
          { error: 'New category name is required' },
          { status: 400 }
        )
      }
      // Since categories are just tags, we don't need to do anything here.
      // The category will be created when a resource is created with it.
      return NextResponse.json({ success: true, message: 'Category will be created when used in a resource' })
    }

    if (action === 'deleteAll') {
      try {
        await prisma.trainingResource.updateMany({
          data: {
            tags: '[]'
          }
        })
        return NextResponse.json({ success: true, message: 'All categories have been deleted.' })
      } catch (error) {
        logger.error('Error deleting all categories:', error)
        return NextResponse.json(
          { error: 'Failed to delete all categories' },
          { status: 500 }
        )
      }
    }

    if (action === 'edit') {
      if (!categoryName || !newCategoryName) {
        return NextResponse.json(
          { error: 'Category name and new category name are required' },
          { status: 400 }
        )
      }

      try {
        // Update all resources that use this category
        const allResources = await prisma.trainingResource.findMany({
          where: {
            tags: {
              not: null
            }
          }
        })

        const resources = allResources.filter(resource => {
          if (!resource.tags) return false
          try {
            const tags = JSON.parse(resource.tags)
            return Array.isArray(tags) && tags.includes(categoryName)
          } catch {
            return false
          }
        })

        logger.log(`Found ${resources.length} resources using category "${categoryName}"`)

        for (const resource of resources) {
          if (resource.tags) {
            try {
              const tags = JSON.parse(resource.tags)
              if (Array.isArray(tags)) {
                const updatedTags = tags.map(tag => tag === categoryName ? newCategoryName : tag)
                await prisma.trainingResource.update({
                  where: { id: resource.id },
                  data: { tags: JSON.stringify(updatedTags) }
                })
                logger.log(`Updated resource ${resource.id} to rename category "${categoryName}" to "${newCategoryName}"`)
              }
            } catch (error) {
              logger.error(`Error updating resource ${resource.id} tags:`, error)
            }
          }
        }

        return NextResponse.json({ 
          success: true, 
          message: `Category updated successfully in ${resources.length} resources` 
        })
      } catch (error) {
        logger.error('Error editing category:', error)
        return NextResponse.json(
          { error: 'Failed to update category in database' },
          { status: 500 }
        )
      }
    }

    if (action === 'remove') {
      if (!categoryName) {
        return NextResponse.json(
          { error: 'Category name is required' },
          { status: 400 }
        )
      }

      logger.log(`Starting category removal for: "${categoryName}"`)

      try {
        // Remove category from all resources that use it
        const allResources = await prisma.trainingResource.findMany({
          where: {
            tags: {
              not: null
            }
          }
        })

        logger.log(`Found ${allResources.length} total resources with tags`)

        const resources = allResources.filter(resource => {
          if (!resource.tags) return false
          try {
            const tags = JSON.parse(resource.tags)
            return Array.isArray(tags) && tags.includes(categoryName)
          } catch (error) {
            logger.error(`Error parsing tags for resource ${resource.id}:`, error)
            return false
          }
        })

        logger.log(`Found ${resources.length} resources using category "${categoryName}"`)

        for (const resource of resources) {
          if (resource.tags) {
            try {
              const tags = JSON.parse(resource.tags)
              if (Array.isArray(tags)) {
                const updatedTags = tags.filter(tag => tag !== categoryName)
                await prisma.trainingResource.update({
                  where: { id: resource.id },
                  data: { tags: JSON.stringify(updatedTags) }
                })
                logger.log(`Updated resource ${resource.id} to remove category "${categoryName}"`)
              }
            } catch (error) {
              logger.error(`Error updating resource ${resource.id} tags:`, error)
            }
          }
        }

        logger.log(`Category removal completed successfully`)
        return NextResponse.json({ 
          success: true, 
          message: `Category removed successfully from ${resources.length} resources` 
        })
      } catch (error) {
        logger.error('Error removing category:', error)
        return NextResponse.json(
          { error: `Failed to remove category from database: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    logger.error('Error managing categories:', error)
    return NextResponse.json(
      { error: 'Failed to manage categories' },
      { status: 500 }
    )
  }
}
