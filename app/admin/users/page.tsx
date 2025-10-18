import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { UserManagementSimple } from "@/components/admin/user-management-simple"

export default function UserManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <UserManagementSimple />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
