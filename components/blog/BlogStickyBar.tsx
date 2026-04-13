'use client'

import { useEffect, useState } from 'react'

interface BlogStickyBarProps {
  title: string
  ctaHref: string
}

export default function BlogStickyBar({ title, ctaHref }: BlogStickyBarProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-4 py-3 flex items-center gap-3 transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <p className="flex-1 text-sm font-semibold text-gray-900 leading-tight line-clamp-1">
        {title}
      </p>
      <a
        href={ctaHref}
        className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
      >
        Empezar →
      </a>
    </div>
  )
}
