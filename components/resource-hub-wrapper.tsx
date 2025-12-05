"use client"

import { Suspense } from "react"
import { ResourceHubClient } from "./resource-hub-client"
import { ResourceSkeleton } from "./resource-skeleton"

export function ResourceHubWrapper() {
  return (
    <Suspense fallback={<ResourceSkeleton />}>
      <ResourceHubClient />
    </Suspense>
  )
}
