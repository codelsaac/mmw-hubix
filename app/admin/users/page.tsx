import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { EnhancedUserManagement } from "@/components/admin/enhanced-user-management"

export default function UserManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <EnhancedUserManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
