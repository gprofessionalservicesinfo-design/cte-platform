'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const FULL_DISCLAIMER =
  'CreaTuEmpresaUSA LLC no es una firma de abogados ni sustituye los servicios de un abogado ' +
  'licenciado. No brindamos asesoría legal, fiscal o contable. Nuestros servicios son ' +
  'exclusivamente de formación de entidades (business formation) y tramitación administrativa. ' +
  'La información publicada en este sitio tiene fines informativos generales y no constituye ' +
  'opinión legal. Para asesoría específica sobre su situación particular, consulte con un ' +
  'abogado, CPA o asesor fiscal licenciado en la jurisdicción correspondiente.'

export default function DisclaimerFooter() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)

  const isAuthenticated =
    pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')

  if (isAuthenticated) {
    return (
      <footer className="w-full border-t border-gray-200 bg-gray-50 px-6 py-3 text-center text-xs text-gray-600 leading-relaxed">
        <span>CreaTuEmpresaUSA no es firma de abogados. </span>
        <button
          onClick={() => setExpanded(v => !v)}
          className="underline text-gray-500 hover:text-gray-700 transition-colors"
          type="button"
        >
          {expanded ? 'Ocultar disclaimer' : 'Ver disclaimer legal'}
        </button>
        {expanded && (
          <p className="mt-2 text-gray-600">
            {FULL_DISCLAIMER}{' '}
            <strong className="font-semibold">
              El uso de este sitio web no crea una relación abogado-cliente.
            </strong>
          </p>
        )}
        {' · '}
        <Link href="/legal/disclaimer" className="underline text-gray-400 hover:text-gray-600 transition-colors">
          Aviso Legal completo
        </Link>
      </footer>
    )
  }

  return (
    <footer className="w-full border-t border-gray-200 bg-gray-50 px-6 py-4 text-center text-xs text-gray-600 leading-relaxed">
      <strong className="font-semibold text-gray-700">Aviso Legal:</strong>{' '}
      {FULL_DISCLAIMER}{' '}
      <strong className="font-semibold">
        El uso de este sitio web no crea una relación abogado-cliente.
      </strong>
      {' · '}
      <Link href="/legal/disclaimer" className="underline text-gray-500 hover:text-gray-700 transition-colors">
        Ver aviso completo
      </Link>
    </footer>
  )
}
