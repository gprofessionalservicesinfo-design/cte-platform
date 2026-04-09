'use client'

import { useState } from 'react'

export interface FaqItem {
  q: string
  a: string
}

interface Props {
  items: FaqItem[]
  accentColor?: string
}

const NAVY = '#0A2540'

export function FaqAccordion({ items, accentColor = NAVY }: Props) {
  const [open, setOpen] = useState<number | null>(null)

  function toggle(i: number) {
    setOpen(prev => (prev === i ? null : i))
  }

  return (
    <div className="space-y-2.5">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div
            key={i}
            style={{
              border: `1px solid ${isOpen ? accentColor : '#e2e8f0'}`,
              borderRadius: '12px',
              transition: 'border-color 0.15s',
              overflow: 'hidden',
            }}
            className="bg-white"
          >
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span
                className="text-sm font-semibold leading-snug"
                style={{ color: isOpen ? accentColor : '#1e293b' }}
              >
                {item.q}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{
                  flexShrink: 0,
                  transition: 'transform 0.2s ease',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
                aria-hidden="true"
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke={isOpen ? accentColor : '#94a3b8'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isOpen && (
              <div className="px-6 pb-5">
                <div
                  style={{ borderTop: '1px solid #f1f5f9' }}
                  className="pt-3"
                >
                  <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
