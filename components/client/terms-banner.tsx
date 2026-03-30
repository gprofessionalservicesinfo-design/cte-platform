'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, X, ChevronRight, Printer } from 'lucide-react'

const DOCS = [
  {
    id: 'service_agreement',
    title: 'Service Agreement / Acuerdo de Servicios',
    en: `This Service Agreement is entered into between CreaTuEmpresaUSA ("Company") and the client ("Client"). Company provides business formation, registered agent coordination, EIN coordination, document preparation and related administrative services. CreaTuEmpresaUSA is NOT a law firm and does not provide legal advice. Services are administrative assistance only. Fees are non-refundable once filing has begun. Client certifies all information provided is accurate. Company liability is limited to amount paid for services. Governed by laws of the State of Delaware.`,
    es: `Este Acuerdo se celebra entre CreaTuEmpresaUSA ("Empresa") y el Cliente. La Empresa provee servicios de formación de empresas, agente registrado, coordinación de EIN y preparación de documentos. CreaTuEmpresaUSA NO es un despacho de abogados y no provee asesoría legal. Los servicios son exclusivamente administrativos. Los honorarios no son reembolsables una vez iniciado el trámite. El Cliente certifica que toda la información es precisa. La responsabilidad de la Empresa se limita al monto pagado. Rige la ley del Estado de Delaware.`,
  },
  {
    id: 'authorization_letter',
    title: 'Authorization Letter / Carta de Autorización',
    en: `I authorize CreaTuEmpresaUSA to: prepare and file Articles of Organization on my behalf, act as Organizer where required, coordinate EIN application with the IRS, prepare Operating Agreement and formation documents, and correspond with state agencies. CreaTuEmpresaUSA acts as my formation agent, not my legal representative.`,
    es: `Autorizo a CreaTuEmpresaUSA a: preparar y presentar los Articles of Organization en mi nombre, actuar como Organizador donde sea requerido, coordinar la solicitud de EIN ante el IRS, preparar el Operating Agreement y demás documentos, y comunicarse con agencias estatales. CreaTuEmpresaUSA actúa como mi agente de formación, no como mi representante legal.`,
  },
  {
    id: 'disclaimer',
    title: 'Non-Attorney Disclaimer / Aviso de No-Abogado',
    en: `CreaTuEmpresaUSA is NOT a law firm. We are a business formation and administrative services company. Our services do not constitute legal advice or legal representation. We help prepare and file formation documents. We do not advise on legal strategy, tax implications, or immigration matters. Consult a licensed attorney for legal advice.`,
    es: `CreaTuEmpresaUSA NO es un despacho de abogados. Somos una empresa de servicios administrativos de formación empresarial. Nuestros servicios no constituyen asesoría legal ni representación legal. Ayudamos a preparar y presentar documentos de formación. No asesoramos sobre estrategia legal, implicaciones fiscales ni asuntos migratorios. Consulte a un abogado licenciado.`,
  },
]

export function TermsBanner() {
  const [status, setStatus]       = useState<'loading' | 'accepted' | 'pending'>('loading')
  const [checked, setChecked]     = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    fetch('/api/client/terms-status')
      .then(r => r.json())
      .then(d => setStatus(d.accepted ? 'accepted' : 'pending'))
      .catch(() => setStatus('pending'))
  }, [])

  async function handleAccept() {
    if (!checked || accepting) return
    setAccepting(true)
    try {
      const res = await fetch('/api/client/accept-terms', { method: 'POST' })
      if (res.ok) setStatus('accepted')
    } catch {}
    setAccepting(false)
  }

  if (status === 'loading' || status === 'accepted') return null

  return (
    <>
      {/* ── Banner ────────────────────────────────────────────────────────── */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-6xl mx-auto">
          {/* Title row */}
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                Antes de comenzar, acepta nuestros términos
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Puedes seguir usando el portal mientras revisas los documentos.
              </p>
            </div>
          </div>

          {/* Checkbox + actions row */}
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="flex items-start gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={checked}
                onChange={e => setChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-amber-400 text-amber-600 accent-amber-600 cursor-pointer"
              />
              <span className="text-xs text-amber-800 leading-snug">
                He leído y acepto el Service Agreement, Autorización y Aviso Legal de CreaTuEmpresaUSA.{' '}
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="underline font-medium hover:text-amber-900 whitespace-nowrap"
                >
                  Ver documentos (EN / ES) →
                </button>
              </span>
            </label>

            <Button
              size="sm"
              className="h-8 text-xs shrink-0 bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-40"
              disabled={!checked || accepting}
              onClick={handleAccept}
            >
              {accepting ? 'Guardando…' : 'Aceptar y continuar'}
              {!accepting && <ChevronRight className="ml-1 h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Drawer overlay ─────────────────────────────────────────────────── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50 shrink-0">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Términos y Condiciones</p>
                <p className="text-xs text-gray-500 mt-0.5">CreaTuEmpresaUSA · EN / ES</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open('/api/client/terms-pdf', '_blank')}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                  title="Guardar como PDF (usar Guardar como PDF en el diálogo de impresión)"
                >
                  <Printer className="h-3.5 w-3.5" />
                  PDF
                </button>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-8">
              {DOCS.map((doc, i) => (
                <div key={doc.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-gray-900">{doc.title}</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1.5">English</p>
                      <p className="text-xs text-gray-700 leading-relaxed">{doc.en}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Español</p>
                      <p className="text-xs text-gray-700 leading-relaxed">{doc.es}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer CTA */}
            <div className="shrink-0 px-5 py-4 border-t bg-gray-50">
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm"
                onClick={() => { setDrawerOpen(false); setChecked(true) }}
              >
                Entendido — cerrar
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
