import { cacheLife } from "next/cache"
import { ResourceService } from "@/lib/services/resource.service"
import { prisma } from "@/lib/prisma"

// Cached resource data fetching
async function getCachedResources() {
  'use cache'
  cacheLife('hours')
  
  const resourceService = new ResourceService()
  const resources = await resourceService.getAllResources()
  
  // Transform to match the expected Resource interface
  return resources.map(resource => ({
    id: resource.id,
    name: resource.name,
    url: resource.url,
    description: resource.description || "",
    category: resource.category?.name || "Uncategorized",
    categoryId: resource.category?.id || "",
    categoryIcon: resource.category?.icon || "globe",
    categoryColor: resource.category?.color || "#6B7280",
    status: resource.status as "active" | "maintenance" | "inactive",
    clicks: resource.clicks,
    lastUpdated: new Date(resource.updatedAt).toISOString().split("T")[0],
    icon: resource.icon || null,
  }))
}

// Cached category data fetching
async function getCachedCategories() {
  'use cache'
  cacheLife('hours')
  
  const categories = await prisma.category.findMany({
    where: {
      isActive: true
    },
    select: {
      id: true,
      name: true,
      description: true,
      icon: true,
      color: true,
      sortOrder: true,
      _count: {
        select: {
          resources: {
            where: {
              status: "active"
            }
          }
        }
      }
    },
    orderBy: [
      { sortOrder: 'asc' },
      { name: 'asc' }
    ]
  })
  
  return categories
}

export { getCachedResources, getCachedCategories }
