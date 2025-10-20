import { cn } from "@/lib/utils"

function Skeleton({ 
  className, 
  shimmer = true,
  ...props 
}: React.ComponentProps<"div"> & { shimmer?: boolean }) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-md",
        shimmer ? "skeleton-shimmer" : "bg-muted animate-pulse",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
