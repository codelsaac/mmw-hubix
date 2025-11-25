"use client"

import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { ANIMATION_TIMING, PAGE_TRANSITION_VARIANTS } from "@/lib/animations"

interface PageTransitionProps {
  children: React.ReactNode
  variant?: 'fadeIn' | 'slideInUp' | 'slideInDown'
}

export function PageTransition({ children, variant = 'fadeIn' }: PageTransitionProps) {
  const pathname = usePathname()

  const variantConfig = PAGE_TRANSITION_VARIANTS[variant]

  return (
    <motion.div
      key={pathname}
      initial={variantConfig.initial}
      animate={variantConfig.animate}
      exit={variantConfig.exit}
      transition={variantConfig.transition}
    >
      {children}
    </motion.div>
  )
}
