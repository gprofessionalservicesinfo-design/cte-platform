'use client'

import { useState } from 'react'
import { MessageCircle, CheckCircle2, Clock } from 'lucide-react'

interface Props {
  companyId:   string
  clientName:  string
  clientPhone: string | null
  completed:   boolean
  completedAt: string | null
}

export function OnboardingStatusBanner({ companyId, clientName, clientPhone, completed, completedAt }: Props) {
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function sendReminder() {
    if (!clientPhone) return
    setSending(true)
    setError(null)
    try {
      const firstName = clientName.split(' ')[0]
      const body = `Hola ${firstName}, recuerda completar la información de tu empresa en: https://creatuempresausa.com/dashboard/onboarding 📋`
      const res = await fetch('/api/whatsapp/send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: clientPhone, body }),
      })
      if (!res.ok) {
        const { error: msg } = await res.json()
        setError(msg ?? 'Error al enviar')
      } else {
        setSent(true)
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSending(false)
    }
  }

  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null

  if (completed) {
    return (
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800">
            ✅ Cliente completó su onboarding
          </p>
          {formattedDate && (
            <p className="text-xs text-green-700 mt-0.5">
              Completado el {formattedDate}
            </p>
          )}
          <p className="text-xs text-green-600 mt-1">
            Datos de la empresa listos para generar documentos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
      <div className="flex items-start gap-3">
        <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            ⚠️ Cliente no ha completado su onboarding
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            Faltan datos de la empresa (dirección, miembros, actividad) para generar documentos.
          </p>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          {sent  && <p className="text-xs text-green-700 mt-1">✅ Recordatorio enviado</p>}
        </div>
      </div>
      {clientPhone && (
        <button
          onClick={sendReminder}
          disabled={sending || sent}
          className="flex-shrink-0 flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
        >
          <MessageCircle className="h-4 w-4" />
          {sending ? 'Enviando...' : sent ? 'Enviado ✅' : 'Enviar recordatorio por WhatsApp'}
        </button>
      )}
    </div>
  )
}
