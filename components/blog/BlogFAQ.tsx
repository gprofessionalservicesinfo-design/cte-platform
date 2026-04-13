'use client'

import { useState } from 'react'

interface FAQItem {
  q: string
  a: string
}

interface BlogFAQProps {
  items: FAQItem[]
}

export default function BlogFAQ({ items }: BlogFAQProps) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas frecuentes</h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
            >
              <span className="pr-4 leading-snug">{item.q}</span>
              <span
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center transition-transform duration-200 ${
                  open === i ? 'rotate-45 border-red-500' : ''
                }`}
              >
                <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none" stroke={open === i ? '#ef4444' : '#9ca3af'} strokeWidth="2">
                  <line x1="5" y1="1" x2="5" y2="9" />
                  <line x1="1" y1="5" x2="9" y2="5" />
                </svg>
              </span>
            </button>
            {open === i && (
              <div className="px-5 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
