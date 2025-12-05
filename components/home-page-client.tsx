"use client"

import { type ReactNode } from "react"
import { MaintenancePage } from "@/components/maintenance-page"
import { useSettings } from "@/hooks/use-settings"
import { NotificationWidget } from "@/components/notification-widget"

interface HomePageClientProps {
  children: ReactNode
}

export function HomePageClient({ children }: HomePageClientProps) {
  const { settings, isHydrated } = useSettings()

  // Don't render anything until hydration is complete to avoid mismatch
  if (!isHydrated) {
    return (
      <div className="relative">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
              <div className="space-y-8">
                {children}
              </div>
              <aside className="hidden lg:block">
                <div className="sticky top-6">
                  {/* Notification widget placeholder during loading */}
                </div>
              </aside>
            </div>
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
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            <div className="space-y-8">
              {children}
            </div>
            <aside className="hidden lg:block">
              <div className="sticky top-6">
                <NotificationWidget />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}



