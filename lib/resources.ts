import { logger } from "@/lib/logger"
export interface Resource {
  id: string
  name: string
  url: string
  description: string
  category: string
  categoryId: string
  categoryIcon: string
  categoryColor: string
  status: "active" | "maintenance" | "inactive"
  clicks: number
  lastUpdated: string
}

const defaultResources: Resource[] = []

class ResourceService {
  private static instance: ResourceService
  private storageKey = "mmw-hubix-resources"

  static getInstance(): ResourceService {
    if (!ResourceService.instance) {
      ResourceService.instance = new ResourceService()
    }
    return ResourceService.instance
  }

  getResources(): Resource[] {
    if (typeof window === "undefined") return defaultResources

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      logger.error("Error loading resources:", error)
    }

    // Initialize with default resources if none exist
    this.saveResources(defaultResources)
    return defaultResources
  }

  saveResources(resources: Resource[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(resources))
      // Trigger storage event for other components
      window.dispatchEvent(new CustomEvent("resourcesUpdated", { detail: resources }))
    } catch (error) {
      logger.error("Error saving resources:", error)
    }
  }

  addResource(resource: Omit<Resource, "id" | "clicks" | "lastUpdated">): Resource {
    const resources = this.getResources()
    const newResource: Resource = {
      ...resource,
      id: `resource-${Date.now()}`,
      clicks: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
    }

    const updatedResources = [...resources, newResource]
    this.saveResources(updatedResources)
    return newResource
  }

  updateResource(id: string, updates: Partial<Resource>): Resource | null {
    const resources = this.getResources()
    const index = resources.findIndex((r) => r.id === id)

    if (index === -1) return null

    const updatedResource = {
      ...resources[index],
      ...updates,
      lastUpdated: new Date().toISOString().split("T")[0],
    }

    const updatedResources = [...resources]
    updatedResources[index] = updatedResource
    this.saveResources(updatedResources)
    return updatedResource
  }

  deleteResource(id: string): boolean {
    const resources = this.getResources()
    const filteredResources = resources.filter((r) => r.id !== id)

    if (filteredResources.length === resources.length) return false

    this.saveResources(filteredResources)
    return true
  }

  getResourcesByCategory(category: string): Resource[] {
    return this.getResources().filter((r) => r.category === category && r.status === "active")
  }
}

export const resourceService = ResourceService.getInstance()
