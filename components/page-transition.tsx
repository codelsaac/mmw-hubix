"use client"

import { usePathname } from "next/navigation"

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      className="animate-in fade-in duration-300"
    >
      {children}
    </div>
  )
}
