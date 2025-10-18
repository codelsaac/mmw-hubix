import { logger } from "@/lib/logger"
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
    category: "Library",
    status: "active",
    clicks: 890,
    lastUpdated: "2024-01-08",
  },
  {
    id: 3,
    name: "Campus Map",
    url: "https://map.school.edu",
    description: "Navigate the school campus easily",
    category: "Campus Services",
    status: "active",
    clicks: 567,
    lastUpdated: "2024-01-05",
  },
  {
    id: 4,
    name: "IT Support",
    url: "https://support.school.edu",
    description: "Get help with technical issues",
    category: "Technology",
    status: "active",
    clicks: 234,
    lastUpdated: "2024-01-03",
  },
  {
    id: 5,
    name: "Health Center",
    url: "https://health.school.edu",
    description: "Student health services and appointments",
    category: "Health & Wellness",
    status: "active",
    clicks: 156,
    lastUpdated: "2024-01-02",
  },
  {
    id: 6,
    name: "Career Services",
    url: "https://careers.school.edu",
    description: "Job placement and career counseling",
    category: "Career Services",
    status: "active",
    clicks: 89,
    lastUpdated: "2024-01-01",
  },
  {
    id: 7,
    name: "Financial Aid Office",
    url: "https://finaid.school.edu",
    description: "Scholarships, grants, and financial assistance",
    category: "Financial Aid",
    status: "active",
    clicks: 445,
    lastUpdated: "2023-12-28",
  },
  {
    id: 8,
    name: "Student Housing",
    url: "https://housing.school.edu",
    description: "Dormitory information and housing applications",
    category: "Housing",
    status: "active",
    clicks: 234,
    lastUpdated: "2023-12-25",
  },
  {
    id: 9,
    name: "Campus Events",
    url: "https://events.school.edu",
    description: "Upcoming campus events and activities",
    category: "Events & Activities",
    status: "active",
    clicks: 178,
    lastUpdated: "2023-12-20",
  },
  {
    id: 10,
    name: "Emergency Services",
    url: "https://emergency.school.edu",
    description: "Campus security and emergency contacts",
    category: "Emergency Services",
    status: "active",
    clicks: 67,
    lastUpdated: "2023-12-15",
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
