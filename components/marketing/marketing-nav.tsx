'use client'

import { useState } from 'react'
import Link from 'next/link'
import { WA_URL } from '@/lib/marketing/state-data'

const NAVY = '#0A2540'

export function MarketingNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav
        style={{ borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
        className="sticky top-0 z-50 h-[60px] bg-white/92 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            style={{ fontFamily: 'Manrope, sans-serif', color: NAVY, fontWeight: 800, fontSize: '1.25rem' }}
            className="flex-shrink-0 tracking-tight"
          >
            CreaTuEmpresa<span style={{ color: '#DC2626' }}>USA</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {[
              { label: '¿Qué estado elegir?', href: '/que-estado-elegir' },
              { label: 'LLC vs Corp', href: '/comparar' },
              { label: 'EIN', href: '/ein-extranjeros' },
              { label: 'Planes', href: '/index_final.html#pricing' },
            ].map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/index_final.html#pricing"
              style={{ background: NAVY, color: 'white', borderRadius: '8px' }}
              className="text-sm font-semibold px-4 py-2 hover:opacity-90 transition-opacity"
            >
              Comenzar
            </Link>
          </div>

          {/* Burger */}
          <button
            onClick={() => setOpen(v => !v)}
            className="md:hidden flex flex-col gap-[5px] p-2 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="Menu"
          >
            <span
              style={{ background: NAVY }}
              className={`block w-[22px] h-[2px] rounded-sm transition-transform duration-250 ${open ? 'translate-y-[7px] rotate-45' : ''}`}
            />
            <span
              style={{ background: NAVY }}
              className={`block w-[22px] h-[2px] rounded-sm transition-opacity duration-250 ${open ? 'opacity-0' : ''}`}
            />
            <span
              style={{ background: NAVY }}
              className={`block w-[22px] h-[2px] rounded-sm transition-transform duration-250 ${open ? '-translate-y-[7px] -rotate-45' : ''}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div
          style={{ borderBottom: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
          className="fixed top-[60px] left-0 right-0 z-40 bg-white px-6 py-4 flex flex-col gap-1"
        >
          {[
            { label: '¿Qué estado elegir?', href: '/que-estado-elegir' },
            { label: 'LLC vs Corporation vs DBA', href: '/comparar' },
            { label: 'EIN para extranjeros', href: '/ein-extranjeros' },
            { label: 'Planes y precios', href: '/index_final.html#pricing' },
          ].map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
            <Link
              href="/login"
              style={{ border: `1.5px solid ${NAVY}`, color: NAVY, borderRadius: '8px' }}
              className="flex-1 text-sm font-semibold text-center py-2.5 hover:bg-slate-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/index_final.html#pricing"
              style={{ background: NAVY, color: 'white', borderRadius: '8px' }}
              className="flex-1 text-sm font-semibold text-center py-2.5 hover:opacity-90 transition-opacity"
              onClick={() => setOpen(false)}
            >
              Comenzar
            </Link>
          </div>
        </div>
      )}

      {/* Floating WA */}
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => { if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') { (window as any).fbq('track', 'Lead') } }}
        style={{
          background: '#25D366',
          color: 'white',
          borderRadius: '100px',
          boxShadow: '0 4px 20px rgba(37,211,102,0.4), 0 2px 8px rgba(0,0,0,0.15)',
        }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 text-sm font-semibold hover:scale-105 hover:-translate-y-0.5 transition-transform"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.526 5.847L.057 23.804a.5.5 0 00.614.65l6.094-1.597A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-4.986-1.365l-.358-.213-3.714.974.991-3.613-.233-.372A9.818 9.818 0 0112 2.182c5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z"/>
        </svg>
        Consultar gratis
      </a>
    </>
  )
}
