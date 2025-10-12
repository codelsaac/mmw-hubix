/**
 * Browser Extension Cleanup Utility
 * 
 * Handles cleanup of browser extension attributes that cause hydration mismatches.
 * Specifically targets password managers and form fillers that add attributes
 * like bis_skin_checked to DOM elements after page load.
 */

// List of known browser extension attributes that cause hydration issues
const extensionAttributes = [
  'bis_skin_checked',
  'data-bis_skin_checked',
  'data-lastpass-icon-root',
  'data-1password-ignore',
  'data-dashlane-ignore',
  'data-bitwarden-watching',
  'data-extension-id'
]

export function cleanupBrowserExtensionAttributes() {
  if (typeof window === 'undefined') return

  extensionAttributes.forEach(attr => {
    const elements = document.querySelectorAll(`[${attr}]`)
    elements.forEach(element => {
      element.removeAttribute(attr)
    })
  })
}

/**
 * Initialize browser extension cleanup
 * Should be called after the page has loaded and extensions have finished
 */
export function initBrowserExtensionCleanup() {
  if (typeof window === 'undefined') return

  // Run cleanup immediately
  cleanupBrowserExtensionAttributes()

  // Run cleanup after a delay to catch extensions that load later
  setTimeout(cleanupBrowserExtensionAttributes, 100)
  setTimeout(cleanupBrowserExtensionAttributes, 500)
  setTimeout(cleanupBrowserExtensionAttributes, 1000)

  // Watch for new elements being added by extensions
  const observer = new MutationObserver((mutations) => {
    let shouldCleanup = false
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        const target = mutation.target as Element
        if (extensionAttributes.some(attr => target.hasAttribute(attr))) {
          shouldCleanup = true
        }
      }
    })

    if (shouldCleanup) {
      cleanupBrowserExtensionAttributes()
    }
  })

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: extensionAttributes,
    subtree: true
  })

  return () => observer.disconnect()
}

/**
 * React hook for browser extension cleanup
 */
export function useBrowserExtensionCleanup() {
  if (typeof window === 'undefined') return

  const cleanup = initBrowserExtensionCleanup()
  
  return cleanup
}
