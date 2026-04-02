'use client'

import { useState } from 'react'

type AddressStatus =
  | 'not_purchased'
  | 'pending'
  | 'in_progress'
  | 'awaiting_client'
  | 'active'
  | 'issue'

const STATUS_CONFIG: Record<AddressStatus, { label: string; className: string }> = {
  not_purchased:   { label: 'No contratado',     className: 'bg-gray-100 text-gray-500' },
  pending:         { label: 'Pendiente',          className: 'bg-gray-100 text-gray-600' },
  in_progress:     { label: 'En proceso',         className: 'bg-blue-100 text-blue-700' },
  awaiting_client: { label: 'Esperando cliente',  className: 'bg-yellow-100 text-yellow-700' },
  active:          { label: 'Activo',             className: 'bg-green-100 text-green-700' },
  issue:           { label: 'Problema',           className: 'bg-red-100 text-red-700' },
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

  async function handleAwaitingClient() {
    await patch({ address_status: 'awaiting_client' })
    setStatus('awaiting_client')
  }

  async function handleMarkActive() {
    const now = new Date()
    const renewal = new Date(now)
    renewal.setFullYear(renewal.getFullYear() + 1)
    const nowISO = now.toISOString()
    const renewalISO = renewal.toISOString()
    await patch({
      address_status: 'active',
      address_activated_at: nowISO,
      address_renewal_date: renewalISO,
    })
    setStatus('active')
    setActivatedAt(nowISO)
    setRenewalDate(renewalISO)
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

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_purchased

  function fmt(iso: string | null) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.className}`}>
          {cfg.label}
        </span>
        {feedback && (
          <span className="text-xs text-gray-500">{feedback}</span>
        )}
      </div>

      {/* Info grid */}
      <dl className="divide-y divide-gray-100 text-sm">
        <div className="py-2 flex justify-between">
          <dt className="text-gray-500">Provider</dt>
          <dd className="font-medium text-gray-900">{provider}</dd>
        </div>
        <div className="py-2 flex justify-between">
          <dt className="text-gray-500">Plan</dt>
          <dd className="font-medium text-gray-900 capitalize">{planType}</dd>
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

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        {status === 'not_purchased' || status === 'pending' ? (
          <button
            onClick={handleStart}
            disabled={saving}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md font-medium disabled:opacity-50"
          >
            ▶ Iniciar Setup
          </button>
        ) : null}

        <a
          href="https://www.virtualpostmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md font-medium hover:bg-slate-200"
        >
          🔗 Abrir VPM Dashboard
        </a>

        {status === 'in_progress' && (
          <button
            onClick={handleAwaitingClient}
            disabled={saving}
            className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-md font-medium disabled:opacity-50"
          >
            📄 Solicitar documentos al cliente
          </button>
        )}

        {(status === 'in_progress' || status === 'awaiting_client') && (
          <button
            onClick={handleMarkActive}
            disabled={saving}
            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-md font-medium disabled:opacity-50"
          >
            ✅ Marcar como Activo
          </button>
        )}

        {status !== 'issue' && status !== 'not_purchased' && (
          <button
            onClick={handleIssue}
            disabled={saving}
            className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-md font-medium disabled:opacity-50"
          >
            ⚠️ Reportar problema
          </button>
        )}
      </div>

      {/* Notes */}
      <div className="pt-2 border-t space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notas</p>
        {notes && (
          <pre className="text-xs text-gray-700 bg-gray-50 rounded p-2 whitespace-pre-wrap font-sans">
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
          <button
            onClick={handleSaveNote}
            disabled={saving || !noteInput.trim()}
            className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-md font-medium disabled:opacity-50"
          >
            📝 Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
