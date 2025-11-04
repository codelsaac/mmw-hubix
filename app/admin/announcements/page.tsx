import { Suspense } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ActivityNewsManagement } from "@/components/admin/activity-news-management"

export default function ActivityNewsManagementPage() {
  return (
    <Suspense
      fallback=
        {(
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading announcements...</p>
            </div>
          </div>
        )}
    >
      <ProtectedRoute requiredRole="admin">
        <DashboardLayout>
          <ActivityNewsManagement />
        </DashboardLayout>
      </ProtectedRoute>
    </Suspense>
  )
}
