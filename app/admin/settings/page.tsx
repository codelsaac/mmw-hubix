import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SystemSettings } from "@/components/admin/system-settings"

export default function SystemSettingsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <SystemSettings />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
