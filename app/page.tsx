"use client"

import { ResourceHub } from "@/components/resource-hub"
import { ClubAnnouncements } from "@/components/club-announcements"
import { Sidebar } from "@/components/sidebar"
import { MaintenancePage } from "@/components/maintenance-page"
import { useSettings } from "@/hooks/use-settings"

export default function HomePage() {
  const { isMaintenanceMode } = useSettings()

  // Show maintenance page if maintenance mode is enabled
  if (isMaintenanceMode) {
    return <MaintenancePage />
  }

  return (
    <div className="flex">
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <ResourceHub />
          <ClubAnnouncements />
        </div>
      </main>
      <Sidebar />
    </div>
  )
}
