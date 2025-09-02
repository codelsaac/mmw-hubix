import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AdminOverview } from "@/components/admin/admin-overview"

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <AdminOverview />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
