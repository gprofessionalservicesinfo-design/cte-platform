import type { Metadata } from 'next'
import { Suspense } from 'react'
import OfertaClient from './OfertaClient'

export const metadata: Metadata = {
  title: 'Forma tu LLC en USA en 7 días | CreaTuEmpresaUSA',
  description:
    'Forma tu LLC en Estados Unidos desde cualquier país. Sin viajar, sin ser residente. ' +
    'Incluye EIN, Registered Agent, Operating Agreement y BOI Report. Desde $499 USD.',
  openGraph: {
    title: 'Forma tu LLC en USA en 7 días — Desde $499',
    description:
      'Sin viajar. Sin ser residente. Atención en español. EIN + Registered Agent + BOI Report incluidos.',
    type: 'website',
  },
  alternates: { canonical: '/oferta' },
}

export default function OfertaPage() {
  return (
    <Suspense>
      <OfertaClient />
    </Suspense>
  )
}
