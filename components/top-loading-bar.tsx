'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Configure NProgress
NProgress.configure({ 
  showSpinner: false,
  speed: 300,
  minimum: 0.08,
  trickleSpeed: 200,
})

export function TopLoadingBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.done()
  }, [pathname, searchParams])

  return null
}

// CSS override for NProgress to match our theme
if (typeof window !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    #nprogress {
      pointer-events: none;
    }

    #nprogress .bar {
      background: oklch(0.8 0.18 80); /* Secondary/accent color */
      position: fixed;
      z-index: 9999;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
    }

    #nprogress .peg {
      display: block;
      position: absolute;
      right: 0px;
      width: 100px;
      height: 100%;
      box-shadow: 0 0 10px oklch(0.8 0.18 80), 0 0 5px oklch(0.8 0.18 80);
      opacity: 1.0;
      transform: rotate(3deg) translate(0px, -4px);
    }

    .dark #nprogress .bar {
      background: oklch(0.85 0.2 80); /* Brighter in dark mode */
    }

    .dark #nprogress .peg {
      box-shadow: 0 0 10px oklch(0.85 0.2 80), 0 0 5px oklch(0.85 0.2 80);
    }
  `
  document.head.appendChild(style)
}
