"use client"

import { useState, useEffect } from 'react'

/**
 * Hook to handle client-side hydration and prevent SSR mismatches
 * Returns true only after the component has hydrated on the client
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}
