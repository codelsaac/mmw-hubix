/**
 * Unified animation configuration system
 * Centralized timing, easing, and animation constants
 * 
 * USAGE GUIDE:
 * 
 * 1. PAGE TRANSITIONS:
 *    import { PageTransition } from '@/components/page-transition'
 *    <PageTransition variant="slideInUp">{children}</PageTransition>
 * 
 * 2. LOADING STATES:
 *    import { UnifiedLoader } from '@/components/unified-loader'
 *    <UnifiedLoader type="spinner" size="md" text="Loading..." />
 *    <UnifiedLoader type="skeleton" skeletonLines={5} />
 * 
 * 3. STAGGERED LISTS (Framer Motion):
 *    import { COMPONENT_VARIANTS, getStaggerDelay } from '@/lib/animations'
 *    items.map((item, i) => (
 *      <motion.div
 *        key={item.id}
 *        variants={COMPONENT_VARIANTS.slideUp}
 *        transition={{ delay: getStaggerDelay(i) }}
 *      >
 *        {item.content}
 *      </motion.div>
 *    ))
 * 
 * 4. STAGGERED LISTS (Tailwind CSS):
 *    import { getCSSDelayMs } from '@/lib/animations'
 *    items.map((item, i) => (
 *      <div
 *        key={item.id}
 *        className="animate-fade-in"
 *        style={{ animationDelay: `${getCSSDelayMs(i)}ms` }}
 *      >
 *        {item.content}
 *      </div>
 *    ))
 */

export const ANIMATION_TIMING = {
  // Loading states
  LOADER_SPIN: 1000, // 1s for spinner rotation
  SKELETON_SHIMMER: 2000, // 2s for skeleton shimmer
  PULSE: 2000, // 2s for pulse animation
  
  // Page transitions
  PAGE_FADE: 300, // 0.3s for page fade
  PAGE_SLIDE: 400, // 0.4s for page slide
  
  // Component entry
  COMPONENT_FADE: 300, // 0.3s
  COMPONENT_SLIDE: 400, // 0.4s
  
  // Hover/micro-interactions
  MICRO: 200, // 0.2s
  QUICK: 150, // 0.15s
  
  // Stagger delays for lists
  STAGGER_BASE: 50, // 50ms between items
  STAGGER_LARGE: 100, // 100ms for larger lists
} as const

export const ANIMATION_EASING = {
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  linear: 'linear',
} as const

/**
 * Page transition variants for consistent page changes
 */
export const PAGE_TRANSITION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: ANIMATION_TIMING.PAGE_FADE / 1000 },
  },
  slideInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: ANIMATION_TIMING.PAGE_SLIDE / 1000, ease: 'easeOut' },
  },
  slideInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: ANIMATION_TIMING.PAGE_SLIDE / 1000, ease: 'easeOut' },
  },
} as const

/**
 * Component entry animation variants
 */
export const COMPONENT_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: ANIMATION_TIMING.COMPONENT_FADE / 1000 },
  },
  slideUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: ANIMATION_TIMING.COMPONENT_SLIDE / 1000, ease: 'easeOut' },
  },
  slideDown: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: ANIMATION_TIMING.COMPONENT_SLIDE / 1000, ease: 'easeOut' },
  },
  slideLeft: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: ANIMATION_TIMING.COMPONENT_SLIDE / 1000, ease: 'easeOut' },
  },
  slideRight: {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: ANIMATION_TIMING.COMPONENT_SLIDE / 1000, ease: 'easeOut' },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: ANIMATION_TIMING.COMPONENT_FADE / 1000, ease: 'easeOut' },
  },
} as const

/**
 * Stagger list animation helper
 * @param index Item index in list
 * @param staggerMs Delay between items in milliseconds
 * @returns Animation delay in seconds for Framer Motion
 */
export function getStaggerDelay(index: number, staggerMs: number = ANIMATION_TIMING.STAGGER_BASE): number {
  return (index * staggerMs) / 1000
}

/**
 * Generate stagger animation config
 * @param itemCount Number of items in list
 * @param staggerMs Delay between items
 * @returns Object with delay for each index
 */
export function generateStaggerConfig(itemCount: number, staggerMs: number = ANIMATION_TIMING.STAGGER_BASE) {
  return Array.from({ length: itemCount }, (_, i) => ({
    index: i,
    delay: getStaggerDelay(i, staggerMs),
    delayMs: i * staggerMs,
  }))
}

/**
 * Tailwind animation delay classes mapper
 * Maps milliseconds to Tailwind delay classes
 */
export const TAILWIND_DELAY_MAP = {
  0: 'delay-0',
  50: 'delay-50',
  100: 'delay-100',
  150: 'delay-150',
  200: 'delay-200',
  300: 'delay-300',
  500: 'delay-500',
  700: 'delay-700',
  1000: 'delay-1000',
} as const

/**
 * Get Tailwind delay class for given milliseconds
 */
export function getTailwindDelayClass(ms: number): string {
  const closest = Object.keys(TAILWIND_DELAY_MAP)
    .map(Number)
    .reduce((prev, curr) => 
      Math.abs(curr - ms) < Math.abs(prev - ms) ? curr : prev
    )
  return TAILWIND_DELAY_MAP[closest as keyof typeof TAILWIND_DELAY_MAP]
}

/**
 * CSS animation delay string
 */
export function getCSSDelayMs(index: number, staggerMs: number = ANIMATION_TIMING.STAGGER_BASE): number {
  return index * staggerMs
}

const animationConfig = {
  ANIMATION_TIMING,
  ANIMATION_EASING,
  PAGE_TRANSITION_VARIANTS,
  COMPONENT_VARIANTS,
  getStaggerDelay,
  generateStaggerConfig,
  getTailwindDelayClass,
  getCSSDelayMs,
}

export default animationConfig
