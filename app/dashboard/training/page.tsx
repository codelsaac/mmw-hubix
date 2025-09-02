import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TrainingLibrary } from "@/components/dashboard/training-library"

export default function TrainingPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TrainingLibrary />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
