import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    // Mark as hydrated
    setIsHydrated(true)
    
    // Only run on client side
    if (typeof window === 'undefined') return

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Use modern event listener API with proper cleanup
    mql.addEventListener("change", onChange)
    
    // Cleanup function to prevent memory leaks
    return () => {
      mql.removeEventListener("change", onChange)
    }
  }, [])

  // Return false during SSR to prevent hydration mismatch
  return isHydrated ? isMobile : false
}
