import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ResourceManagement } from "@/components/admin/resource-management"

export default function ResourceManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <ResourceManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
