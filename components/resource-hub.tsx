"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Calendar,
  FileText,
  Globe,
  Library,
  Mail,
  Search,
  Users,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react"
import { resourceService, type Resource } from "@/lib/resources"

// Icon mapping for different resource types
const getResourceIcon = (name: string, category: string) => {
  const lowerName = name.toLowerCase()

  if (lowerName.includes("portal") || lowerName.includes("student")) return BookOpen
  if (lowerName.includes("library")) return Library
  if (lowerName.includes("learning") || lowerName.includes("course")) return Globe
  if (lowerName.includes("exam") || lowerName.includes("schedule")) return Calendar
  if (lowerName.includes("map") || lowerName.includes("campus")) return MapPin
  if (lowerName.includes("bell") || lowerName.includes("time")) return Clock
  if (lowerName.includes("club") || lowerName.includes("student")) return Users
  if (lowerName.includes("event") || lowerName.includes("calendar")) return Calendar
  if (lowerName.includes("support") || lowerName.includes("help")) return Mail
  if (lowerName.includes("form") || lowerName.includes("document")) return FileText
  if (lowerName.includes("contact") || lowerName.includes("directory")) return Users

  // Default icons by category
  if (category === "Academics") return BookOpen
  if (category === "Student Life") return Users
  if (category === "Resources") return FileText

  return Globe // Default fallback
}

export function ResourceHub() {
  const [resources, setResources] = useState<Resource[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    
    if (typeof window !== 'undefined') {
      const loadedResources = resourceService.getResources()
      setResources(loadedResources)

      const handleResourcesUpdated = (event: CustomEvent) => {
        setResources(event.detail)
      }

      window.addEventListener("resourcesUpdated", handleResourcesUpdated as EventListener)
      return () => {
        window.removeEventListener("resourcesUpdated", handleResourcesUpdated as EventListener)
      }
    }
  }, [])

  const filteredResources = resources.filter(
    (resource) =>
      resource.status === "active" &&
      (resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const resourcesByCategory = filteredResources.reduce(
    (acc, resource) => {
      if (!acc[resource.category]) {
        acc[resource.category] = []
      }
      acc[resource.category].push(resource)
      return acc
    },
    {} as Record<string, Resource[]>,
  )

  const handleResourceClick = (resource: Resource) => {
    if (typeof window !== 'undefined') {
      resourceService.updateResource(resource.id, { clicks: resource.clicks + 1 })
      window.open(resource.url, "_blank", "noopener,noreferrer")
    }
  }

  // Don't render content until hydrated to prevent mismatch
  if (!isHydrated) {
    return (
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif font-bold text-foreground">Resource Hub</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Quick access to all essential school resources, tools, and information in one centralized location.
          </p>
        </div>
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="pl-10"
              value=""
              disabled
            />
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading resources...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif font-bold text-foreground">Resource Hub</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Quick access to all essential school resources, tools, and information in one centralized location.
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-8">
        {Object.entries(resourcesByCategory).map(([category, categoryResources]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-serif font-semibold text-foreground">{category}</h3>
              <Badge variant="secondary" className="text-xs">
                {categoryResources.length} resources
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryResources.map((resource) => {
                const IconComponent = getResourceIcon(resource.name, resource.category)
                return (
                  <Card
                    key={resource.id}
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => handleResourceClick(resource)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold flex items-center gap-2">
                            {resource.name}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm">{resource.description}</CardDescription>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? "No resources found matching your search." : "No resources available."}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
