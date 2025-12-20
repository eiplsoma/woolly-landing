'use client'

import * as React from 'react'

// Simple Cookie Consent banner
// - Saves decision to localStorage under `cookieConsent`
// - Values: 'accept_all' | 'necessary_only' | 'reject'
// - Emits a `cookieConsentChanged` CustomEvent with detail { value }

export default function CookieConsent() {
  const [visible, setVisible] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    try {
      const val = localStorage.getItem('cookieConsent')
      if (!val) setVisible(true)
    } catch (e) {
      // localStorage not available -> show banner
      setVisible(true)
    }
  }, [])

  const setDecision = (value: 'accept_all' | 'necessary_only' | 'reject') => {
    try {
      localStorage.setItem('cookieConsent', value)
    } catch (e) {
      // ignore
    }

    // emit event for other scripts to react
    try {
      window.dispatchEvent(
        new CustomEvent('cookieConsentChanged', { detail: { value } }),
      )
    } catch (e) {
      // ignore
    }

    setVisible(false)
  }

  if (!mounted) return null
  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed left-4 bottom-4 sm:left-6 sm:bottom-6 z-50 max-w-md w-full"
    >
      <div className="bg-[#E8DCC8]/50 backdrop-blur-lg rounded-xl shadow-lg p-4 sm:p-6 text-[#4A453F] border border-[#E8DCC8]/30">
        <div>
          <h3 className="font-semibold text-sm sm:text-base">Szereted a sütiket? Mi is!</h3>
          <p className="mt-2 text-xs sm:text-sm text-[#4A453F]/90">
            A sütik segítenek, hogy az oldal zökkenőmentesen és biztonságosan működjön.
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-end">
          <button
            onClick={() => setDecision('accept_all')}
            className="rounded-full cursor-pointer bg-[#D4C2A1] hover:bg-[#C1AE8F] text-[#4A453F] px-4 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4C2A1]/40"
          >
            Elfogadom
          </button>

          <button
            onClick={() => setDecision('necessary_only')}
            className="rounded-full cursor-pointer bg-white/60 border border-[#D4C2A1]/30 text-[#4A453F] px-4 py-2 text-sm font-medium hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4C2A1]/20"
          >
            Csak a szükségesek
          </button>

          <button
            onClick={() => setDecision('reject')}
            className="rounded-full cursor-pointer bg-transparent text-[#4A453F] px-3 py-2 text-sm font-medium hover:underline focus:outline-none"
          >
            Elutasítom
          </button>
        </div>
      </div>
    </div>
  )
}
