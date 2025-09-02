import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { UserManagement } from "@/components/admin/user-management"

export default function UserManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <UserManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
