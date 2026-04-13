'use client'

import { useEffect, useState } from 'react'

interface TOCItem {
  id: string
  text: string
  level: 'h2' | 'h3'
}

interface TableOfContentsProps {
  items: TOCItem[]
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
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

  if (items.length === 0) return null

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
