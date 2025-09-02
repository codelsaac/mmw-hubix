import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { InternalCalendar } from "@/components/dashboard/internal-calendar"

export default function CalendarPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <InternalCalendar />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
