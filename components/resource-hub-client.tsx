"use client"

import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { logger } from "@/lib/logger"
import Image from "next/image"
import {
  ArrowUpDown,
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
  Laptop,
  Building,
  Heart,
  Briefcase,
  DollarSign,
  Home,
  Car,
  PartyPopper,
  UserCheck,
  Microscope,
  Globe2,
  GraduationCap,
  Phone,
} from "lucide-react"
import { resourceService, type Resource } from "@/lib/resources"
import { parseIconValue } from "@/lib/favicon-utils"
import { GoogleSearchButton } from "@/components/google-search-widget"

// Props interface for the client component
interface ResourceHubClientProps {
  initialResources: Resource[]
  initialCategories: any[]
}

// Category icon mapping
const getCategoryIcon = (category: string) => {
  const categoryIcons: Record<string, any> = {
    "Academics": BookOpen,
    "Student Life": Users,
    "Resources": FileText,
    "Technology": Laptop,
    "Library": Library,
    "Campus Services": Building,
    "Health & Wellness": Heart,
    "Career Services": Briefcase,
    "Financial Aid": DollarSign,
    "Housing": Home,
    "Transportation": Car,
    "Events & Activities": PartyPopper,
    "Clubs & Organizations": UserCheck,
    "Research": Microscope,
    "International Students": Globe2,
    "Alumni": GraduationCap,
    "Emergency Services": Phone,
  }
  return categoryIcons[category] || Globe
}

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

  // Use category icon as fallback
  return getCategoryIcon(category)
}

export function ResourceHubClient({ initialResources, initialCategories }: ResourceHubClientProps) {
  const [resources, setResources] = useState<Resource[]>(initialResources)
  const [categories, setCategories] = useState<any[]>(initialCategories)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  const [isHydrated, setIsHydrated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch both resources and categories
        const [resourcesResponse, categoriesResponse] = await Promise.all([
          fetch('/api/resources'),
          fetch('/api/categories')
        ])
        
        if (resourcesResponse.ok) {
          const resourcesData = await resourcesResponse.json()
          setResources(resourcesData)
        } else {
          // Fallback to localStorage if API fails
          const loadedResources = resourceService.getResources()
          setResources(loadedResources)
        }
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          logger.info('Categories fetched:', categoriesData)
          setCategories(categoriesData)
        } else {
          logger.warn('Categories API returned non-ok status:', categoriesResponse.status)
        }
      } catch (error) {
        logger.error('Error fetching data:', error)
        // Fallback to localStorage
        const loadedResources = resourceService.getResources()
        setResources(loadedResources)
      } finally {
        setIsLoading(false)
      }
    }

    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000)

    const handleResourcesUpdated = (event: CustomEvent) => {
      setResources(event.detail)
    }

    window.addEventListener("resourcesUpdated", handleResourcesUpdated as EventListener)
    return () => {
      clearInterval(interval)
      window.removeEventListener("resourcesUpdated", handleResourcesUpdated as EventListener)
    }
  }, [])

  const filteredBySearch = resources.filter(
    (resource) =>
      resource.status === "active" &&
      (resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.description || "").toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredResources = selectedCategory === "all"
    ? filteredBySearch
    : filteredBySearch.filter((r) => r.categoryId === selectedCategory)

  // Sorting logic
  const sortedResources = [...filteredResources].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name)
    if (sortBy === "popular") return (b.clicks || 0) - (a.clicks || 0)
    if (sortBy === "newest") return new Date(b.lastUpdated || 0).getTime() - new Date(a.lastUpdated || 0).getTime()
    return 0
  })

  const resourcesByCategory = (selectedCategory === "all" ? sortedResources : sortedResources).reduce(
    (acc, resource) => {
      if (!acc[resource.category]) {
        acc[resource.category] = []
      }
      acc[resource.category].push(resource)
      return acc
    },
    {} as Record<string, Resource[]>,
  )

  const getCategoryColor = (value: string) => {
    const cat = (categories as any[]).find((c) => c.id === value || c.name === value) as any
    return cat?.color || "#3b82f6"
  }

  const handleResourceClick = (resource: Resource) => {
    if (typeof window !== 'undefined') {
      resourceService.updateResource(resource.id, { clicks: resource.clicks + 1 })
      window.open(resource.url, "_blank", "noopener,noreferrer")
    }
  }

  const handleGoogleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) return

    if (typeof window !== 'undefined') {
      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmedQuery)}`
      window.open(googleSearchUrl, "_blank", "noopener,noreferrer")
    }
  }

  // Don't render content until hydrated to prevent mismatch
  if (!isHydrated) {
    return (
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif font-bold text-foreground">Resource Hub</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Quick access to all essential school resources, tools, and information in one location.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 bg-muted rounded w-full animate-pulse" />
                <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-5 bg-muted rounded w-16 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-12 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 sm:px-0">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground animate-in fade-in slide-in-from-top-4 duration-700">Resource Hub</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
          Quick access to all essential school resources, tools, and information in one location.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
        <form onSubmit={handleGoogleSearch} className="px-4 sm:px-0 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 transition-colors duration-300" />
            <Input
              placeholder="Search resources..."
              className="pl-10 bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder:text-gray-500 shadow-sm transition-all duration-300 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <GoogleSearchButton disabled={!searchQuery.trim()} />
        </form>

        {/* Controls: Categories & Sort */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between px-4 sm:px-0">
          {/* Category Filter Tabs */}
          <div className="w-full overflow-x-auto pb-2 scrollbar-hide flex-1">
            <div className="flex gap-2 min-w-max">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="text-xs whitespace-nowrap flex-shrink-0"
              >
                All Categories
                <Badge variant="secondary" className="ml-2 text-[10px]">
                  {resources.filter(r => r.status === "active").length}
                </Badge>
              </Button>
              {categories.map((category) => {
                const categoryResourcesById = filteredResources.filter(resource => resource.categoryId === category.id)
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="text-xs whitespace-nowrap flex-shrink-0"
                  >
                    <span
                      className="mr-1 inline-block w-2.5 h-2.5 rounded-full border"
                      style={{ backgroundColor: category.color || undefined, borderColor: (category.color || '#d1d5db') as string }}
                    />
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                    <Badge variant="secondary" className="ml-2 text-[10px]">
                      {categoryResourcesById.length}
                    </Badge>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Sort Dropdown - Compact */}
          <div className="flex items-center gap-2 min-w-[140px] flex-shrink-0">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full h-8 text-xs">
                <ArrowUpDown className="w-3 h-3 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="popular">Popularity</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        {Object.keys(resourcesByCategory).length > 0 ? (
          selectedCategory === "all" ? (
            Object.entries(resourcesByCategory).map(([category, categoryResources], index) => (
            <div
              key={category}
              className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                {(() => {
                  const iconColor = getCategoryColor(category)
                  return (
                    <span
                      className="w-3.5 h-3.5 rounded-full border flex-shrink-0"
                      style={{ backgroundColor: iconColor, borderColor: (iconColor || '#d1d5db') as string }}
                    />
                  )
                })()}
                <h3 className="text-lg sm:text-xl font-serif font-semibold text-foreground">{category}</h3>
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {categoryResources.length} resources
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                {categoryResources.map((resource) => {
                  const iconColor = getCategoryColor(resource.category as any)
                  const resourceIconData = parseIconValue((resource as any).icon)

                  let iconDisplay: React.ReactNode
                  if (resourceIconData?.type === "url" && resourceIconData.value) {
                    iconDisplay = (
                      <Image
                        src={resourceIconData.value}
                        alt={resource.name}
                        width={20}
                        height={20}
                        className="rounded object-contain"
                      />
                    )
                  } else if (resourceIconData?.type === "icon") {
                    const iconMap = {
                      BookOpen,
                      Calendar,
                      FileText,
                      Globe,
                      Library,
                      Mail,
                      Users,
                      Clock,
                      MapPin,
                      ExternalLink,
                      Laptop,
                      Building,
                      Heart,
                      Briefcase,
                      DollarSign,
                      Home,
                      Car,
                      PartyPopper,
                      UserCheck,
                      Microscope,
                      Globe2,
                      GraduationCap,
                      Phone,
                    }
                    const IconComponent = iconMap[resourceIconData.value as keyof typeof iconMap] || Globe
                    iconDisplay = <IconComponent className="w-4 h-4 transition-transform duration-300" style={{ color: iconColor }} />
                  } else {
                    const IconComponent = getResourceIcon(resource.name, resource.category)
                    if (IconComponent === Globe || IconComponent === Globe2) {
                      iconDisplay = (
                        <span
                          className="w-3.5 h-3.5 rounded-full border"
                          style={{ backgroundColor: iconColor, borderColor: (iconColor || '#d1d5db') as string }}
                        />
                      )
                    } else {
                      iconDisplay = <IconComponent className="w-4 h-4 transition-transform duration-300" style={{ color: iconColor }} />
                    }
                  }

                  return (
                    <TooltipProvider key={resource.id} delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Card
                            className="hover:shadow-md transition-all duration-300 cursor-pointer group hover:border-primary/30 hover:-translate-y-0.5 gap-3 p-4 sm:p-5"
                            onClick={() => handleResourceClick(resource)}
                          >
                            <CardHeader className="px-0 py-0">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 flex-shrink-0">
                                  {iconDisplay}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <span className="truncate">{resource.name}</span>
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 flex-shrink-0" />
                                  </CardTitle>
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                        </TooltipTrigger>
                        {resource.description && (
                          <TooltipContent
                            side="top"
                            className="hidden sm:block max-w-[200px] p-2 bg-gray-900 text-white border border-gray-700 shadow-xl"
                          >
                            <p className="text-xs leading-snug">{resource.description}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          (() => {
            const selectedCategoryData = categories.find((cat) => cat.id === selectedCategory)
            const categoryResources = filteredResources.filter((resource) => resource.categoryId === selectedCategory)

            if (!selectedCategoryData || categoryResources.length === 0) {
              return null
            }

            return (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="w-3.5 h-3.5 rounded-full border flex-shrink-0"
                    style={{
                      backgroundColor: selectedCategoryData.color || undefined,
                      borderColor: (selectedCategoryData.color || '#d1d5db') as string,
                    }}
                  />
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-foreground">{selectedCategoryData.name}</h3>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {categoryResources.length} resources
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                  {categoryResources.map((resource) => {
                    const IconComponent = getResourceIcon(resource.name, resource.category)
                    const iconColor = getCategoryColor(resource.category as any)
                    return (
                      <TooltipProvider key={resource.id} delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Card
                              className="hover:shadow-md transition-all duration-300 cursor-pointer group hover:border-primary/30 hover:-translate-y-0.5 gap-3 p-4 sm:p-5"
                              onClick={() => handleResourceClick(resource)}
                            >
                              <CardHeader className="px-0 py-0">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 flex-shrink-0">
                                    {IconComponent === Globe || IconComponent === Globe2 ? (
                                      <span
                                        className="w-3.5 h-3.5 rounded-full border"
                                        style={{ backgroundColor: iconColor, borderColor: (iconColor || '#d1d5db') as string }}
                                      />
                                    ) : (
                                      <IconComponent className="w-4 h-4 transition-transform duration-300" style={{ color: iconColor }} />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                      <span className="truncate">{resource.name}</span>
                                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 flex-shrink-0" />
                                    </CardTitle>
                                  </div>
                                </div>
                              </CardHeader>
                            </Card>
                          </TooltipTrigger>
                          {resource.description && (
                            <TooltipContent
                              side="top"
                              className="hidden sm:block max-w-[200px] p-2 bg-gray-900 text-white border border-gray-700 shadow-xl"
                            >
                              <p className="text-xs leading-snug">{resource.description}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              </div>
            )
          })()
          )
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/20">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No resources found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto text-sm">
              {searchQuery 
                ? `We couldn't find any resources matching "${searchQuery}". Try adjusting your search or filters.`
                : "No resources are currently available in this category."}
            </p>
            {searchQuery && (
              <Button 
                variant="link" 
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                }}
                className="mt-2"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
