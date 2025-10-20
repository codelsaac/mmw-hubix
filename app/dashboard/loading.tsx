import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar skeleton */}
      <div className="w-64 border-r bg-muted/10 p-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-8 space-y-6">
        <Skeleton className="h-12 w-48" />
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-lg" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
