'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import type { ComponentProps } from 'react'

type LoadingLinkProps = ComponentProps<typeof Link>

export function LoadingLink({ href, onClick, ...props }: LoadingLinkProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call original onClick if provided
    onClick?.(e)
    
    // Don't trigger loading for same page or hash links
    if (typeof href === 'string' && (href === window.location.pathname || href.startsWith('#'))) {
      return
    }
    
    // Start loading bar
    NProgress.start()
  }

  return <Link href={href} onClick={handleClick} {...props} />
}
