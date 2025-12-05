import { getCachedResources, getCachedCategories } from "@/components/server/resource-data"
import { ResourceHubClient } from "./resource-hub-client"
import { ResourceSkeleton } from "./resource-skeleton"
import { Suspense } from "react"

// Server component that fetches cached data
export async function ResourceHubServer() {
  const [resources, categories] = await Promise.all([
    getCachedResources(),
    getCachedCategories()
  ])

  return (
    <Suspense fallback={<ResourceSkeleton />}>
      <ResourceHubClient initialResources={resources} initialCategories={categories} />
    </Suspense>
  )
}
