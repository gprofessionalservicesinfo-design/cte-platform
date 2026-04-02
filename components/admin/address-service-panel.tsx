'use client'

import { useState } from 'react'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

type AddressStatus =
  | 'not_purchased'
  | 'pending'
  | 'in_progress'
  | 'awaiting_client'
  | 'active'
  | 'issue'

const STATUS_CONFIG: Record<AddressStatus, { label: string; className: string }> = {
  not_purchased:   { label: 'No contratado',    className: 'bg-gray-100 text-gray-500' },
  pending:         { label: 'Pendiente',         className: 'bg-gray-100 text-gray-600' },
  in_progress:     { label: 'En proceso',        className: 'bg-blue-100 text-blue-700' },
  awaiting_client: { label: 'Esperando cliente', className: 'bg-yellow-100 text-yellow-700' },
  active:          { label: 'Activo',            className: 'bg-green-100 text-green-700' },
  issue:           { label: 'Problema',          className: 'bg-red-100 text-red-700' },
}

interface Props {
  companyId: string
  initialStatus: AddressStatus
  initialProvider: string | null
  initialPlanType: string | null
  initialActivatedAt: string | null
  initialRenewalDate: string | null
  initialNotes: string | null
  initialExternalId: string | null
  clientName: string | null
  clientEmail: string | null
  formationState: string | null
}

export function AddressServicePanel({
  companyId,
  initialStatus,
  initialProvider,
  initialPlanType,
  initialActivatedAt,
  initialRenewalDate,
  initialNotes,
  initialExternalId,
  clientName,
  clientEmail,
  formationState,
}: Props) {
  const [status, setStatus]           = useState<AddressStatus>(initialStatus)
  const [provider]                    = useState(initialProvider ?? 'VPM')
  const [planType]                    = useState(initialPlanType ?? '—')
  const [activatedAt, setActivatedAt] = useState(initialActivatedAt)
  const [renewalDate, setRenewalDate] = useState(initialRenewalDate)
  const [notes, setNotes]             = useState(initialNotes ?? '')
  const [externalId]                  = useState(initialExternalId ?? '')
  const [noteInput, setNoteInput]     = useState('')
  const [saving, setSaving]           = useState(false)
  const [feedback, setFeedback]       = useState('')
  const [emailCopied, setEmailCopied] = useState(false)

  async function patch(fields: Record<string, any>) {
    setSaving(true)
    setFeedback('')
    try {
      const res = await fetch('/api/admin/update-address-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, ...fields }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setFeedback('✓ Guardado')
    } catch (e: any) {
      setFeedback('Error: ' + e.message)
    } finally {
      setSaving(false)
      setTimeout(() => setFeedback(''), 3000)
    }
  }

  async function handleStart() {
    const now = new Date().toISOString()
    await patch({ address_status: 'in_progress', address_created_at: now })
    setStatus('in_progress')
  }

  async function handleMarkActive() {
    const now = new Date()
    const renewal = new Date(now)
    renewal.setFullYear(renewal.getFullYear() + 1)
    const nowISO = now.toISOString()
    const renewalISO = renewal.toISOString()
    await patch({ address_status: 'active', address_activated_at: nowISO, address_renewal_date: renewalISO })
    setStatus('active')
    setActivatedAt(nowISO)
    setRenewalDate(renewalISO)
  }

  async function handleAwaitingClient() {
    await patch({ address_status: 'awaiting_client' })
    setStatus('awaiting_client')
  }

  async function handleIssue() {
    await patch({ address_status: 'issue' })
    setStatus('issue')
  }

  async function handleSaveNote() {
    if (!noteInput.trim()) return
    const updated = notes ? notes + '\n' + noteInput.trim() : noteInput.trim()
    await patch({ address_notes: updated })
    setNotes(updated)
    setNoteInput('')
  }

  function copyEmail() {
    if (!clientEmail) return
    navigator.clipboard.writeText(clientEmail)
    setEmailCopied(true)
    setTimeout(() => setEmailCopied(false), 2000)
  }

  function fmt(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_purchased

  return (
    <div className="space-y-4">
      {/* Status + feedback */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.className}`}>
          {cfg.label}
        </span>
        {feedback && <span className="text-xs text-gray-500">{feedback}</span>}
      </div>

      {/* Client Quick Info */}
      <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Client Quick Info</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Nombre</span>
          <span className="font-medium text-gray-900">{clientName ?? '—'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Email</span>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-900 text-xs">{clientEmail ?? '—'}</span>
            {clientEmail && (
              <button onClick={copyEmail} className="text-gray-400 hover:text-blue-600 transition-colors" title="Copiar email">
                {emailCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Estado LLC</span>
          <span className="font-medium text-gray-900">{formationState ?? '—'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Plan dirección</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
            planType === 'vip' ? 'bg-blue-900 text-white' : 'bg-blue-100 text-blue-700'
          }`}>{planType}</span>
        </div>
      </div>

      {/* Service info */}
      <dl className="divide-y divide-gray-100 text-sm">
        <div className="py-2 flex justify-between">
          <dt className="text-gray-500">Provider</dt>
          <dd className="font-medium text-gray-900">{provider}</dd>
        </div>
        <div className="py-2 flex justify-between">
          <dt className="text-gray-500">Activado</dt>
          <dd className="text-gray-700">{fmt(activatedAt)}</dd>
        </div>
        <div className="py-2 flex justify-between">
          <dt className="text-gray-500">Renovación</dt>
          <dd className="text-gray-700">{fmt(renewalDate)}</dd>
        </div>
        {externalId && (
          <div className="py-2 flex justify-between">
            <dt className="text-gray-500">ID externo</dt>
            <dd className="font-mono text-xs text-gray-600">{externalId}</dd>
          </div>
        )}
      </dl>

      {/* External links — always visible */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button variant="outline" size="sm" asChild>
          <a href="https://www.virtualpostmail.com/login" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Open VPM Dashboard
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href="https://www.virtualpostmail.com/signup" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Create VPM Account
          </a>
        </Button>
      </div>

      {/* Status action buttons */}
      <div className="flex flex-wrap gap-2">
        {(status === 'not_purchased' || status === 'pending') && (
          <Button size="sm" onClick={handleStart} disabled={saving}>
            ▶ Start Address Setup
          </Button>
        )}
        {(status === 'in_progress' || status === 'awaiting_client') && (
          <Button size="sm" onClick={handleMarkActive} disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white">
            ✅ Mark as Active
          </Button>
        )}
        {status === 'in_progress' && (
          <Button variant="outline" size="sm" onClick={handleAwaitingClient} disabled={saving}>
            📄 Solicitar documentos
          </Button>
        )}
        {status !== 'issue' && status !== 'not_purchased' && (
          <Button variant="outline" size="sm" onClick={handleIssue} disabled={saving}
            className="text-red-600 border-red-200 hover:bg-red-50">
            ⚠️ Reportar problema
          </Button>
        )}
      </div>

      {/* Notes */}
      <div className="pt-2 border-t space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">📝 Notas</p>
        {notes && (
          <pre className="text-xs text-gray-700 bg-gray-50 rounded p-2 whitespace-pre-wrap font-sans border border-gray-100">
            {notes}
          </pre>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={noteInput}
            onChange={e => setNoteInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSaveNote()}
            placeholder="Agregar nota…"
            className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <Button size="sm" onClick={handleSaveNote} disabled={saving || !noteInput.trim()}>
            Add Note
          </Button>
        </div>
      </div>
    </div>
  )
}
