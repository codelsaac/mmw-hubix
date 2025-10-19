import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ActivityNewsManagement } from "@/components/admin/activity-news-management"

export default function ActivityNewsManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <ActivityNewsManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
