"use client"

import { motion } from "framer-motion"
import { ANIMATION_TIMING, COMPONENT_VARIANTS } from "@/lib/animations"
import { cn } from "@/lib/utils"

interface UnifiedLoaderProps {
  /**
   * Type of loader: 'spinner' | 'skeleton' | 'pulse' | 'dots'
   */
  type?: 'spinner' | 'skeleton' | 'pulse' | 'dots'
  /**
   * Size: 'sm' | 'md' | 'lg'
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Loading text to display
   */
  text?: string
  /**
   * Custom container className
   */
  className?: string
  /**
   * Show full screen overlay (for page loads)
   */
  fullScreen?: boolean
  /**
   * Number of skeleton lines
   */
  skeletonLines?: number
}

const sizeMap = {
  sm: { spinner: 'w-4 h-4', dots: 'w-2 h-2 gap-1.5' },
  md: { spinner: 'w-8 h-8', dots: 'w-3 h-3 gap-2' },
  lg: { spinner: 'w-12 h-12', dots: 'w-4 h-4 gap-2.5' },
} as const

/**
 * Spinner Loader - Rotating circle
 */
function SpinnerLoader({ size = 'md' }: { size: 'sm' | 'md' | 'lg' }) {
  return (
    <motion.div
      className={cn(
        'border-2 border-primary border-t-transparent rounded-full',
        sizeMap[size].spinner
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: ANIMATION_TIMING.LOADER_SPIN / 1000,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

/**
 * Skeleton Loader - Shimmer effect
 */
function SkeletonLoader({ lines = 3, size = 'md' }: { lines?: number; size: 'sm' | 'md' | 'lg' }) {
  const lineHeight = size === 'sm' ? 'h-2' : size === 'md' ? 'h-3' : 'h-4'
  const gapClass = size === 'sm' ? 'gap-2' : 'gap-3'
  
  return (
    <div className={cn('space-y-3', gapClass)}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className={cn('bg-gradient-to-r from-muted via-muted-foreground/20 to-muted rounded', lineHeight)}
          style={{
            backgroundSize: '200% 100%',
            width: `${100 - (i % 3) * 15}%`,
          }}
          animate={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            duration: ANIMATION_TIMING.SKELETON_SHIMMER / 1000,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

/**
 * Pulse Loader - Fading circles
 */
function PulseLoader({ size = 'md' }: { size: 'sm' | 'md' | 'lg' }) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
  const gap = size === 'sm' ? 'gap-1.5' : 'gap-2'
  
  return (
    <div className={cn('flex items-center', gap)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn('bg-primary rounded-full', dotSize)}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: ANIMATION_TIMING.PULSE / 1000,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Animated Dots Loader - Bouncing dots
 */
function DotsLoader({ size = 'md' }: { size: 'sm' | 'md' | 'lg' }) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
  const gap = size === 'sm' ? 'gap-1.5' : 'gap-2'
  
  return (
    <div className={cn('flex items-center', gap)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn('bg-primary rounded-full', dotSize)}
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Unified Loader Component
 * Provides consistent loading states across the application
 */
export function UnifiedLoader({
  type = 'spinner',
  size = 'md',
  text,
  className,
  fullScreen = false,
  skeletonLines = 3,
}: UnifiedLoaderProps) {
  const loaderContent = (
    <motion.div
      variants={COMPONENT_VARIANTS.fadeIn}
      initial="initial"
      animate="animate"
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        fullScreen && 'min-h-screen',
        !fullScreen && 'min-h-[200px]',
        className
      )}
    >
      {type === 'spinner' && <SpinnerLoader size={size} />}
      {type === 'skeleton' && <SkeletonLoader lines={skeletonLines} size={size} />}
      {type === 'pulse' && <PulseLoader size={size} />}
      {type === 'dots' && <DotsLoader size={size} />}

      {text && (
        <motion.p
          className="text-sm text-muted-foreground"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 flex items-center justify-center">
        {loaderContent}
      </div>
    )
  }

  return loaderContent
}

export default UnifiedLoader
