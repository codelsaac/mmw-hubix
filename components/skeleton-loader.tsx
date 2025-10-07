"use client"

import { motion } from "framer-motion"
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("animate-pulse", variants[variant], className)}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-muted rounded"
          style={{
            width: `${Math.random() * 40 + 60}%`, // Random width between 60-100%
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
        />
      ))}
    </motion.div>
  )
}

// Card skeleton for article cards
export function CardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg p-6 space-y-4"
    >
      <div className="animate-pulse space-y-3">
        <div className="h-6 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
        <div className="flex justify-between items-center pt-4">
          <div className="h-3 bg-muted rounded w-20"></div>
          <div className="h-3 bg-muted rounded w-16"></div>
        </div>
      </div>
    </motion.div>
  )
}

// List skeleton for navigation items
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="animate-pulse flex items-center space-x-3"
        >
          <div className="h-4 w-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded flex-1"></div>
        </motion.div>
      ))}
    </motion.div>
  )
}
