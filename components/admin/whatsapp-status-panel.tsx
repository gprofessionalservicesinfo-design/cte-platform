'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, CheckCircle2, XCircle, SkipForward, MessageCircle } from 'lucide-react'

interface WhatsAppStatusPanelProps {
  companyId:   string
  status:      string | null  // 'sent' | 'failed' | 'skipped' | null
  provider:    string | null
  phoneUsed:   string | null
  sentAt:      string | null
  error:       string | null
}

function StatusBadge({ status }: { status: string | null }) {
  if (status === 'sent') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Enviado
      </span>
    )
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
        <XCircle className="h-3.5 w-3.5" />
        Fallido
      </span>
    )
  }
  if (status === 'skipped') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
        <SkipForward className="h-3.5 w-3.5" />
        Omitido
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
      Sin registro
    </span>
  )
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function WhatsAppStatusPanel({
  companyId,
  status: initialStatus,
  provider: initialProvider,
  phoneUsed: initialPhoneUsed,
  sentAt: initialSentAt,
  error: initialError,
}: WhatsAppStatusPanelProps) {
  const [status,    setStatus]    = useState(initialStatus)
  const [provider,  setProvider]  = useState(initialProvider)
  const [phoneUsed, setPhoneUsed] = useState(initialPhoneUsed)
  const [sentAt,    setSentAt]    = useState(initialSentAt)
  const [error,     setError]     = useState(initialError)

  const [loading,  setLoading]  = useState(false)
  const [sent,     setSent]     = useState(false)
  const [retryErr, setRetryErr] = useState<string | null>(null)

  async function handleRetry() {
    setLoading(true)
    setRetryErr(null)
    setSent(false)
    try {
      const res  = await fetch(`/api/admin/resend-whatsapp/${companyId}`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        setRetryErr(json.error ?? 'Error al reenviar')
        setStatus('failed')
        setError(json.error ?? null)
      } else {
        setSent(true)
        setStatus('sent')
        setSentAt(new Date().toISOString())
        setError(null)
        setProvider('twilio')
        setTimeout(() => setSent(false), 4000)
      }
    } catch (e: any) {
      setRetryErr(e.message)
      setStatus('failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          {provider && (
            <span className="text-xs text-gray-400 font-medium">{provider}</span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRetry}
          disabled={loading}
          className={sent ? 'border-green-500 text-green-600' : ''}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          ) : sent ? (
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-green-600" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          )}
          {sent ? 'Enviado' : 'Reintentar'}
        </Button>
      </div>

      <dl className="divide-y divide-gray-100 text-sm">
        <div className="py-2 flex justify-between gap-2">
          <dt className="text-gray-500 shrink-0">Teléfono usado</dt>
          <dd className="font-mono text-xs text-gray-700 text-right break-all">
            {phoneUsed ?? '—'}
          </dd>
        </div>
        <div className="py-2 flex justify-between gap-2">
          <dt className="text-gray-500 shrink-0">Enviado</dt>
          <dd className="text-gray-700 text-right">{formatDate(sentAt)}</dd>
        </div>
        {(status === 'failed' || status === 'skipped') && (error || retryErr) && (
          <div className="py-2">
            <dt className="text-gray-500 text-xs mb-1">
              {status === 'skipped' ? 'Razón de omisión' : 'Error'}
            </dt>
            <dd className="text-xs text-red-600 font-mono bg-red-50 rounded px-2 py-1 break-all">
              {retryErr ?? error}
            </dd>
          </div>
        )}
      </dl>

      {retryErr && !['failed', 'skipped'].includes(status ?? '') && (
        <p className="text-xs text-red-600">{retryErr}</p>
      )}
    </div>
  )
}
