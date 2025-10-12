"use client"

import { useEffect } from 'react'
import { initBrowserExtensionCleanup } from '@/lib/browser-extension-cleanup'

/**
 * Component that handles cleanup of browser extension attributes
 * that cause hydration mismatches in React applications.
 * 
 * This component should be placed high in the component tree
 * to ensure it runs early in the hydration process.
 */
export function BrowserExtensionCleanup() {
  useEffect(() => {
    const cleanup = initBrowserExtensionCleanup()
    
    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [])

  // This component doesn't render anything
  return null
}
