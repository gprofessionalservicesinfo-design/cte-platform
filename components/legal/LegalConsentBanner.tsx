'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const STORAGE_KEY = 'cte_legal_banner_dismissed_until'
const TTL_DAYS = 30

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    return Date.now() < Number(raw)
  } catch {
    return false
  }
}

function setDismissed(): void {
  try {
    const until = Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000
    localStorage.setItem(STORAGE_KEY, String(until))
  } catch {
    // localStorage unavailable — silently ignore
  }
}

function trackDismissal(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gtag = (window as any).gtag
    if (typeof gtag === 'function') {
      gtag('event', 'legal_banner_dismissed', { event_category: 'legal_compliance' })
    }
  } catch {
    // gtag unavailable — silently ignore
  }
}

export default function LegalConsentBanner() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  const isAuthRoute =
    pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')

  useEffect(() => {
    if (!isAuthRoute && !isDismissed()) {
      setVisible(true)
    }
  }, [isAuthRoute])

  const dismiss = useCallback(() => {
    setVisible(false)
    setDismissed()
    trackDismissal()
  }, [])

  useEffect(() => {
    if (!visible) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [visible, dismiss])

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Aviso legal"
      className="
        fixed bottom-0 left-0 right-0 z-40
        bg-gray-900 text-white
        px-4 py-3 sm:px-6
        flex items-center justify-between gap-4
        min-h-[60px] sm:min-h-[60px]
        shadow-[0_-2px_8px_rgba(0,0,0,0.3)]
      "
    >
      <p className="text-xs sm:text-sm leading-snug text-gray-200 flex-1">
        Al continuar navegando aceptas que CreaTuEmpresaUSA no brinda asesoría legal.{' '}
        <Link
          href="/legal/disclaimer"
          className="underline text-white font-medium hover:text-gray-300 transition-colors whitespace-nowrap"
        >
          Ver aviso completo →
        </Link>
      </p>

      <button
        onClick={dismiss}
        type="button"
        aria-label="Cerrar aviso legal"
        className="
          flex-shrink-0
          text-gray-400 hover:text-white
          transition-colors
          p-1 rounded
          focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1 focus:ring-offset-gray-900
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
