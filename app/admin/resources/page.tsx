import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ResourceManagement } from "@/components/admin/resource-management"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function ResourceManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <ResourceManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
