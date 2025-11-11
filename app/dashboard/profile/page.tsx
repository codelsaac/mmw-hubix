import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { UserProfile } from "@/components/dashboard/user-profile"
import { requireAuth } from "@/lib/auth-server"
import { UserRole } from "@/lib/permissions"

export default async function UserProfilePage() {
  // Block GUEST from accessing profile page (server-side redirect)
  await requireAuth([UserRole.ADMIN, UserRole.HELPER])
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <UserProfile />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
