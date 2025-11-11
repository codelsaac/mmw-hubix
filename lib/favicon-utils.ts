/**
 * Utility functions for fetching and managing favicons
 */

/**
 * Get favicon URL from a website URL using Google's favicon service
 * @param url - The website URL
 * @returns Favicon URL or null if invalid
 */
export function getFaviconUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname
    
    // Use Google's favicon service which is reliable and fast
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch (error) {
    console.error('Invalid URL for favicon:', error)
    return null
  }
}

/**
 * Get high-resolution favicon URL
 * @param url - The website URL
 * @param size - Size in pixels (default: 64)
 * @returns Favicon URL or null if invalid
 */
export function getHighResFaviconUrl(url: string, size: number = 64): string | null {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname
    
    // Use Google's favicon service with larger size
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`
  } catch (error) {
    console.error('Invalid URL for favicon:', error)
    return null
  }
}

/**
 * Extract domain from URL for display
 * @param url - The website URL
 * @returns Domain name or the original URL if parsing fails
 */
export function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch (error) {
    return url
  }
}

/**
 * Check if a string is a valid icon name (Lucide icon) or a URL
 * @param icon - Icon name or URL
 * @returns Object with type and value
 */
export function parseIconValue(icon: string | null | undefined): {
  type: 'icon' | 'url' | null
  value: string | null
} {
  if (!icon) {
    return { type: null, value: null }
  }

  // Check if it's a URL
  if (icon.startsWith('http://') || icon.startsWith('https://')) {
    return { type: 'url', value: icon }
  }

  // Otherwise, treat as icon name
  return { type: 'icon', value: icon }
}
