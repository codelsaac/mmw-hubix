"use client"

import { ResourceHub } from "@/components/resource-hub"
import { MaintenancePage } from "@/components/maintenance-page"
import { useSettings } from "@/hooks/use-settings"

export default function HomePage() {
  const { settings, isHydrated } = useSettings()

  // Don't render anything until hydration is complete to avoid mismatch
  if (!isHydrated) {
    return (
      <div className="relative">
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <ResourceHub />
          </div>
        </main>
      </div>
    )
  }

  // Show maintenance page if maintenance mode is enabled
  if (settings.maintenanceMode) {
    return <MaintenancePage />
  }

  return (
    <div className="relative">
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <ResourceHub />
        </div>
      </main>
    </div>
  )
}
