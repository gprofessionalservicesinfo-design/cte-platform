'use client'

import { useState, useCallback } from 'react'

// Category → reliable fallback query for Unsplash
const CATEGORY_QUERY: Record<string, string> = {
  'Formación LLC':      'LLC business formation entrepreneur USA',
  'Compliance':         'business compliance legal documents USA',
  'Legal & Compliance': 'business legal compliance documents',
  'EIN':                'business registration documents government USA',
  'Banca USA':          'business bank account finance USA',
  'Impuestos':          'business taxes accounting finance',
  'ITIN':               'tax identification document USA government',
  'Privacidad':         'business privacy anonymous protection',
  'Comparativa':        'business comparison research entrepreneur',
  'Elegir Estado':      'USA state map business formation',
  'Mercury Bank':       'online business bank account fintech',
}

interface BlogCardImgProps {
  src: string
  alt: string
  keyword: string
  category: string
  className?: string
}

export default function BlogCardImg({
  src,
  alt,
  keyword,
  category,
  className = 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500',
}: BlogCardImgProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [failed, setFailed] = useState(false)

  const handleError = useCallback(async () => {
    if (failed) return
    setFailed(true)

    const q = keyword || CATEGORY_QUERY[category] || 'business entrepreneur startup USA'
    try {
      const res = await fetch(`/api/blog/cover?q=${encodeURIComponent(q)}`)
      if (!res.ok) return
      const { url } = await res.json()
      if (url) setCurrentSrc(url)
    } catch {
      // graceful — no image
    }
  }, [failed, keyword, category])

  if (!currentSrc) {
    return (
      <div
        className="w-full h-full"
        style={{ background: 'linear-gradient(135deg, #2A3544 0%, #2CB98A 100%)' }}
      />
    )
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      className={className}
    />
  )
}
