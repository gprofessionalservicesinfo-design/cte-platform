'use client'

import { useState } from 'react'
import { OpsChecklistPanel } from '@/components/admin/ops-checklist-panel'

const QUEUE_OPTIONS = [
  { value: 'new',      label: 'Nuevo' },
  { value: 'assigned', label: 'Asignado' },
  { value: 'working',  label: 'En proceso' },
  { value: 'blocked',  label: 'Bloqueado' },
  { value: 'done',     label: 'Listo' },
]

const HANDOFF_OPTIONS = [
  { value: 'confirmation_sent',        label: 'Confirmacion enviada' },
  { value: 'portal_ready',             label: 'Portal listo' },
  { value: 'awaiting_internal_review', label: 'Revision interna pendiente' },
  { value: 'awaiting_client_info',     label: 'Esperando info del cliente' },
  { value: 'active_processing',        label: 'En procesamiento activo' },
]

interface Props {
  companyId: string
  initialQueueStatus: string | null
  initialHandoffStatus: string | null
  initialNextAction: string | null
  initialChecklist: Record<string, boolean>
}

export function OpsDetailPanel({
  companyId,
  initialQueueStatus,
  initialHandoffStatus,
  initialNextAction,
  initialChecklist,
}: Props) {
  const [queueStatus,   setQueueStatus]   = useState(initialQueueStatus ?? 'new')
  const [handoffStatus, setHandoffStatus] = useState(initialHandoffStatus ?? 'confirmation_sent')
  const [nextAction,    setNextAction]    = useState(initialNextAction ?? '')
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)

  async function saveQueueStatus(value: string) {
    setQueueStatus(value)
    await fetch(`/api/admin/companies/${companyId}/work-queue-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ work_queue_status: value }),
    })
  }

  async function saveHandoffStatus(value: string) {
    setHandoffStatus(value)
    await fetch(`/api/admin/companies/${companyId}/handoff-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_handoff_status: value }),
    })
  }

  async function saveNextAction() {
    setSaving(true)
    try {
      await fetch(`/api/admin/companies/${companyId}/next-action`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ next_action: nextAction.trim() || null }),
      })
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Row 1: two status selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Queue status */}
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
            Estado en cola
          </label>
          <select
            value={queueStatus}
            onChange={e => saveQueueStatus(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {QUEUE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Handoff status */}
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
            Estado de entrega
          </label>
          <select
            value={handoffStatus}
            onChange={e => saveHandoffStatus(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {HANDOFF_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: next action — full width */}
      <div>
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
          Siguiente paso
        </label>
        {editing ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={nextAction}
              onChange={e => setNextAction(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') saveNextAction()
                if (e.key === 'Escape') { setNextAction(initialNextAction ?? ''); setEditing(false) }
              }}
              disabled={saving}
              placeholder="Ej: Iniciar formation en Wyoming"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={saveNextAction}
              disabled={saving}
              className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '…' : 'Guardar'}
            </button>
            <button
              onClick={() => { setNextAction(initialNextAction ?? ''); setEditing(false) }}
              className="px-3 py-2 border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-full text-left border border-gray-200 rounded-lg px-3 py-2 text-sm hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
          >
            {nextAction ? (
              <span className="text-gray-800">{nextAction}</span>
            ) : (
              <span className="text-gray-400 italic">Click para definir siguiente paso…</span>
            )}
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Checklist */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Checklist operacional</p>
        <OpsChecklistPanel
          companyId={companyId}
          initialChecklist={initialChecklist}
        />
      </div>
    </div>
  )
}
