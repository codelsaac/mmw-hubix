import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AnnouncementManagement } from "@/components/admin/announcement-management"

export default function AnnouncementManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <AnnouncementManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
