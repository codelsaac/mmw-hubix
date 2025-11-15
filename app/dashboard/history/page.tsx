import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ItPerfectHistory } from "@/components/dashboard/it-perfect-history"

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ItPerfectHistory />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
