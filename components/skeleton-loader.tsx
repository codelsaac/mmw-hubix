import { cn } from "@/lib/utils"

interface SkeletonLoaderProps {
  className?: string
  lines?: number
  variant?: "default" | "card" | "list"
}

export function SkeletonLoader({ 
  className, 
  lines = 3, 
  variant = "default" 
}: SkeletonLoaderProps) {
  const variants = {
    default: "space-y-4",
    card: "space-y-4 p-6 border rounded-lg",
    list: "space-y-3"
  }

  return (
    <div className={cn("animate-pulse", variants[variant], className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-muted rounded"
          style={{
            width: `${Math.random() * 40 + 60}%`, // Random width between 60-100%
          }}
        />
      ))}
    </div>
  )
}

// Card skeleton for article cards
export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4 animate-pulse">
      <div className="space-y-3">
        <div className="h-6 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
        <div className="flex justify-between items-center pt-4">
          <div className="h-3 bg-muted rounded w-20"></div>
          <div className="h-3 bg-muted rounded w-16"></div>
        </div>
      </div>
    </div>
  )
}

// List skeleton for navigation items
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse flex items-center space-x-3"
        >
          <div className="h-4 w-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded flex-1"></div>
        </div>
      ))}
    </div>
  )
}
