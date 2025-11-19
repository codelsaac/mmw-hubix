import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PermissionService, Permission, UserRole } from "@/lib/permissions"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    // Get all active categories from database
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        sortOrder: 'asc'
      },
      select: {
        name: true
      }
    })

    // Return just the category names
    const categoryNames = categories.map(c => c.name)
    return NextResponse.json(categoryNames)
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
        role: (session.user.role as UserRole) || UserRole.STUDENT,
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
      
      try {
        // Check if category already exists
        const existing = await prisma.category.findUnique({
          where: { name: newCategoryName }
        })
        
        if (existing) {
          return NextResponse.json(
            { error: 'Category already exists' },
            { status: 400 }
          )
        }
        
        // Create new category in database
        await prisma.category.create({
          data: {
            name: newCategoryName,
            createdBy: user.id,
            isActive: true
          }
        })
        
        return NextResponse.json({ success: true, message: 'Category created successfully' })
      } catch (error) {
        logger.error('Error creating category:', error)
        return NextResponse.json(
          { error: 'Failed to create category' },
          { status: 500 }
        )
      }
    }

    // Removed deleteAll action - not needed

    if (action === 'edit') {
      if (!categoryName || !newCategoryName) {
        return NextResponse.json(
          { error: 'Category name and new category name are required' },
          { status: 400 }
        )
      }

      try {
        // Update category in database if it exists
        const existingCategory = await prisma.category.findUnique({
          where: { name: categoryName }
        })
        
        if (existingCategory) {
          await prisma.category.update({
            where: { name: categoryName },
            data: { name: newCategoryName }
          })
          logger.log(`Updated category "${categoryName}" to "${newCategoryName}" in database`)
        } else {
          logger.log(`Category "${categoryName}" doesn't exist in database, skipping database update`)
        }
        
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
        // Delete category from database (soft delete by setting isActive = false)
        // Check if category exists first
        const existingCategory = await prisma.category.findUnique({
          where: { name: categoryName }
        })
        
        if (existingCategory) {
          await prisma.category.update({
            where: { name: categoryName },
            data: { isActive: false }
          })
          logger.log(`Soft deleted category "${categoryName}" from database`)
        } else {
          logger.log(`Category "${categoryName}" doesn't exist in database, skipping database deletion`)
        }
        
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
