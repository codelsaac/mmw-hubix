"use client"

import { useEffect, useState } from 'react'

/**
 * Hook to handle browser extension interference with hydration
 * Specifically addresses issues with password managers and form fillers
 * that add attributes like bis_skin_checked to DOM elements
 */
export function useBrowserExtensionSafe() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Clean up any browser extension attributes that might cause hydration issues
    const cleanupExtensionAttributes = () => {
      const elements = document.querySelectorAll('[bis_skin_checked]')
      elements.forEach(element => {
        element.removeAttribute('bis_skin_checked')
      })
    }

    // Run cleanup after a short delay to allow extensions to finish
    const timeoutId = setTimeout(cleanupExtensionAttributes, 100)
    
    return () => clearTimeout(timeoutId)
  }, [])

  return isClient
}
