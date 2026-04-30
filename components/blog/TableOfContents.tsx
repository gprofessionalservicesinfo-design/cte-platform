'use client'

import { useEffect, useState } from 'react'

interface TOCItem {
  id: string
  text: string
  level: 'h2' | 'h3'
}

interface TableOfContentsProps {
  items: TOCItem[]
  inline?: boolean
}

export default function TableOfContents({ items, inline = false }: TableOfContentsProps) {
  const [active, setActive] = useState<string>('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-20% 0% -70% 0%' }
    )
    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [items])

  if (!items.length) return null

  if (inline) {
    return (
      <div
        className="rounded-2xl mb-8 border border-gray-100 overflow-hidden"
        style={{ background: '#f8faf9' }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#00C896' }}>
              <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Tabla de contenidos
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M4 6l4 4 4-4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {open && (
          <ul className="px-5 pb-4 space-y-2 border-t border-gray-100">
            {items.map((item) => (
              <li key={item.id} className={item.level === 'h3' ? 'pl-4' : ''}>
                <a
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-2 text-sm leading-snug text-gray-600 hover:text-[#2CB98A] transition-colors py-1"
                >
                  <span className="mt-1 flex-shrink-0" style={{ color: '#00C896' }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <nav className="bg-gray-50 rounded-2xl p-5">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
        Contenido
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block text-sm leading-snug transition-colors ${
                item.level === 'h3' ? 'pl-3' : ''
              } ${
                active === item.id
                  ? 'font-semibold text-[#2CB98A]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export type { TOCItem }
