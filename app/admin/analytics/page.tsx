import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Analytics } from "@/components/admin/analytics"

export default function AnalyticsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <Analytics />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
