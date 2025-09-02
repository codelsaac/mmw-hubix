import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SystemLogs } from "@/components/admin/system-logs"

export default function SystemLogsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <SystemLogs />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
