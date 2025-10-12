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
    
    // Clean up browser extension attributes that cause hydration issues
    const cleanupExtensionAttributes = () => {
      const elements = document.querySelectorAll('[bis_skin_checked]')
      elements.forEach(element => {
        element.removeAttribute('bis_skin_checked')
      })
    }

    // Run cleanup after extensions have finished modifying the DOM
    const timeoutId = setTimeout(cleanupExtensionAttributes, 100)
    
    return () => clearTimeout(timeoutId)
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
