"use client"

import * as React from "react"
import { useEffect, useState } from "react"

interface HydrationSafeWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  className?: string
}

export function HydrationSafeWrapper({ 
  children, 
  fallback = null, 
  className 
}: HydrationSafeWrapperProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return fallback ? <div className={className}>{fallback}</div> : null
  }

  return <div className={className} suppressHydrationWarning>{children}</div>
}

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
