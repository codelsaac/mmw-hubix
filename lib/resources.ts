export interface Resource {
  id: number
  name: string
  url: string
  description: string
  category: string
  status: "active" | "maintenance" | "inactive"
  clicks: number
  lastUpdated: string
}

const defaultResources: Resource[] = [
  {
    id: 1,
    name: "Student Portal",
    url: "https://portal.school.edu",
    description: "Access grades, assignments, and course materials",
    category: "Academics",
    status: "active",
    clicks: 1250,
    lastUpdated: "2024-01-10",
  },
  {
    id: 2,
    name: "Library System",
    url: "https://library.school.edu",
    description: "Search books, reserve materials, and renew loans",
    category: "Academics",
    status: "active",
    clicks: 890,
    lastUpdated: "2024-01-08",
  },
  {
    id: 3,
    name: "Campus Map",
    url: "https://map.school.edu",
    description: "Navigate the school campus easily",
    category: "Student Life",
    status: "active",
    clicks: 567,
    lastUpdated: "2024-01-05",
  },
  {
    id: 4,
    name: "IT Support",
    url: "https://support.school.edu",
    description: "Get help with technical issues",
    category: "Resources",
    status: "maintenance",
    clicks: 234,
    lastUpdated: "2024-01-03",
  },
]

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
      console.error("Error loading resources:", error)
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
      console.error("Error saving resources:", error)
    }
  }

  addResource(resource: Omit<Resource, "id" | "clicks" | "lastUpdated">): Resource {
    const resources = this.getResources()
    const newResource: Resource = {
      ...resource,
      id: Date.now(),
      clicks: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
    }

    const updatedResources = [...resources, newResource]
    this.saveResources(updatedResources)
    return newResource
  }

  updateResource(id: number, updates: Partial<Resource>): Resource | null {
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

  deleteResource(id: number): boolean {
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
