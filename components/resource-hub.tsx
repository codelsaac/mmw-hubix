"use client"

import { useState, useEffect } from "react"
import type { FormEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { logger } from "@/lib/logger"
import Image from "next/image"
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

export function ResourceHub() {
  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isHydrated, setIsHydrated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
          setCategories(categoriesData)
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

    fetchData()

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

  const resourcesByCategory = (selectedCategory === "all" ? filteredBySearch : filteredResources).reduce(
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" shimmer />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" shimmer />
                    <Skeleton className="h-3 w-1/2" shimmer />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" shimmer />
                <Skeleton className="h-4 w-5/6" shimmer />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-5 w-16" shimmer />
                  <Skeleton className="h-4 w-12" shimmer />
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
          Quick access to all essential school resources, tools, and information in one centralized location.
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

        {/* Category Filter Tabs */}
        <div className="w-full px-4 sm:px-0">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2 min-w-max px-2 sm:px-0">
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
            const CategoryIcon = getCategoryIcon(category.name)
            const categoryResources = resourcesByCategory[category.name] || []
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
        </div>
      </div>

      <div className="grid gap-8">
        {selectedCategory === "all" ? (
          // Show all categories when "all" is selected
          Object.entries(resourcesByCategory).map(([category, categoryResources], index) => (
            <div key={category} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryResources.map((resource) => {
                  const iconColor = getCategoryColor(resource.category as any)
                  const resourceIconData = parseIconValue((resource as any).icon)
                  
                  // Determine which icon to display
                  let iconDisplay
                  if (resourceIconData.type === 'url') {
                    // Display favicon image
                    iconDisplay = (
                      <Image
                        src={resourceIconData.value || ""}
                        alt={resource.name}
                        width={20}
                        height={20}
                        unoptimized
                        className="w-5 h-5 transition-transform duration-300"
                        onError={(event) => {
                          event.currentTarget.classList.add("hidden")
                        }}
                      />
                    )
                  } else if (resourceIconData.type === 'icon') {
                    // Display Lucide icon from iconMap
                    const iconMap: Record<string, any> = {
                      BookOpen, Users, FileText, Laptop, Library, Building, Heart, Briefcase,
                      DollarSign, Home, Car, PartyPopper, UserCheck, Microscope, Globe2,
                      GraduationCap, Phone, Calendar, Mail, Clock, MapPin, ExternalLink
                    }
                    const IconComponent = iconMap[resourceIconData.value || ''] || Globe
                    iconDisplay = <IconComponent className="w-5 h-5 transition-transform duration-300" style={{ color: iconColor }} />
                  } else {
                    // Fallback to automatic icon selection
                    const IconComponent = getResourceIcon(resource.name, resource.category)
                    if (IconComponent === Globe || IconComponent === Globe2) {
                      iconDisplay = (
                        <span
                          className="w-3.5 h-3.5 rounded-full border"
                          style={{ backgroundColor: iconColor, borderColor: (iconColor || '#d1d5db') as string }}
                        />
                      )
                    } else {
                      iconDisplay = <IconComponent className="w-5 h-5 transition-transform duration-300" style={{ color: iconColor }} />
                    }
                  }
                  
                  return (
                    <Card
                      key={resource.id}
                      className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105 hover:border-primary/30"
                      onClick={() => handleResourceClick(resource)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 flex-shrink-0">
                            {iconDisplay}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                              <span className="truncate">{resource.name}</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 flex-shrink-0" />
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-sm line-clamp-2">{resource.description}</CardDescription>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          // Show only selected category
          (() => {
            const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)
            const categoryResources = filteredResources.filter(resource => resource.categoryId === selectedCategory)
            
            return selectedCategoryData && categoryResources.length > 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-2 flex-wrap">
                  {(() => {
                    return (
                      <span
                        className="w-3.5 h-3.5 rounded-full border flex-shrink-0"
                        style={{ backgroundColor: selectedCategoryData.color || undefined, borderColor: (selectedCategoryData.color || '#d1d5db') as string }}
                      />
                    )
                  })()}
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-foreground">{selectedCategoryData.name}</h3>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {categoryResources.length} resources
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryResources.map((resource) => {
                    const IconComponent = getResourceIcon(resource.name, resource.category)
                    const iconColor = getCategoryColor(resource.category as any)
                    return (
                      <Card
                        key={resource.id}
                        className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105 hover:border-primary/30"
                        onClick={() => handleResourceClick(resource)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 flex-shrink-0">
                              {IconComponent === Globe || IconComponent === Globe2 ? (
                                <span
                                  className="w-3.5 h-3.5 rounded-full border"
                                  style={{ backgroundColor: iconColor, borderColor: (iconColor || '#d1d5db') as string }}
                                />
                              ) : (
                                <IconComponent className="w-5 h-5 transition-transform duration-300" style={{ color: iconColor }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <span className="truncate">{resource.name}</span>
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 flex-shrink-0" />
                              </CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="text-sm line-clamp-2">{resource.description}</CardDescription>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })()
        )}

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