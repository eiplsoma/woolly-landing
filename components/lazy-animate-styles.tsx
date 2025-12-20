'use client'

import { useEffect } from 'react'

// Lazy-load the tw-animate-css styles on the client after first paint
export default function LazyAnimateStyles() {
  useEffect(() => {
    // Insert a stylesheet link lazily. Some bundlers don't allow dynamic-import of a
    // package whose main exports a CSS file, so we inject a CDN-hosted stylesheet
    // as a safe, lazy fallback.
    const href = 'https://cdn.jsdelivr.net/npm/tw-animate-css@1.3.3/dist/tw-animate.css'
    if (!document.querySelector(`link[href="${href}"]`)) {
      // Use preload to avoid blocking render; switch to stylesheet after load.
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = href
      link.onload = () => {
        try {
          link.rel = 'stylesheet'
        } catch (e) {
          // ignore
        }
      }
      link.onerror = () => {
        // ignore failures silently
      }
      // Add a small timeout to ensure this runs after first paint
      setTimeout(() => document.head.appendChild(link), 0)
    }
  }, [])

  return null
}
