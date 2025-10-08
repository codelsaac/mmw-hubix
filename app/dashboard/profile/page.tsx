import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { UserProfile } from "@/components/dashboard/user-profile"

export default function UserProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <UserProfile />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
