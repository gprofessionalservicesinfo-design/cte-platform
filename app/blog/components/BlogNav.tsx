'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Inicio', href: '/' },
  { label: 'Precios', href: '/#pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Asistente', href: '/index_final.html?page=wizard' },
]

export default function BlogNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-0 text-[1.15rem] font-bold leading-none select-none"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          <span style={{ color: '#0A2540' }}>CreaTuEmpresa</span>
          <span style={{ color: '#DC2626' }}>USA</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navegación blog">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <a
          href="/index_final.html?page=wizard"
          className="hidden md:inline-flex items-center gap-1 bg-[#0A2540] hover:bg-[#0e2f50] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          Crear mi empresa →
        </a>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          <span
            className={`block w-5 h-0.5 bg-gray-700 rounded transition-transform duration-200 ${
              open ? 'translate-y-2 rotate-45' : ''
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-gray-700 rounded transition-opacity duration-200 ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-gray-700 rounded transition-transform duration-200 ${
              open ? '-translate-y-2 -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="/index_final.html?page=wizard"
            onClick={() => setOpen(false)}
            className="mt-3 flex justify-center bg-[#0A2540] hover:bg-[#0e2f50] text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
          >
            Crear mi empresa →
          </a>
        </div>
      )}
    </header>
  )
}
