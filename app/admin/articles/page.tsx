import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ArticleManagement } from "@/components/admin/article-management"

export default function ArticleManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <ArticleManagement />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
