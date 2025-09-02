import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TeamInformation } from "@/components/dashboard/team-information"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TeamInformation />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
