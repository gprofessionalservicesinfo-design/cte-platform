'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

const ITEMS = [
  { key: 'welcome_sent',               label: 'Bienvenida enviada' },
  { key: 'formation_started',          label: 'Formation iniciada' },
  { key: 'ein_initiated',              label: 'EIN iniciado' },
  { key: 'registered_agent_confirmed', label: 'Registered Agent confirmado' },
  { key: 'address_activated',          label: 'Address activado' },
  { key: 'banking_guidance_sent',      label: 'Guia bancaria enviada' },
  { key: 'tax_ready_offered',          label: 'Tax Ready ofrecido' },
  { key: 'portal_reviewed',            label: 'Portal revisado' },
] as const

type ChecklistKey = typeof ITEMS[number]['key']

interface Props {
  companyId: string
  initialChecklist: Record<string, boolean>
}

export function OpsChecklistPanel({ companyId, initialChecklist }: Props) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>(initialChecklist)
  const [saving, setSaving] = useState<string | null>(null)

  async function toggle(key: ChecklistKey) {
    const newValue = !checklist[key]
    setSaving(key)
    setChecklist(prev => ({ ...prev, [key]: newValue }))

    try {
      await fetch(`/api/admin/companies/${companyId}/checklist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: newValue }),
      })
    } catch {
      // revert on failure
      setChecklist(prev => ({ ...prev, [key]: !newValue }))
    } finally {
      setSaving(null)
    }
  }

  const doneCount = ITEMS.filter(i => checklist[i.key]).length

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Progreso</p>
        <span className="text-xs text-gray-500 font-medium">{doneCount} / {ITEMS.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-green-500 rounded-full transition-all"
          style={{ width: `${Math.round((doneCount / ITEMS.length) * 100)}%` }}
        />
      </div>

      <div className="space-y-1">
        {ITEMS.map(item => {
          const done = !!checklist[item.key]
          const isSaving = saving === item.key
          return (
            <button
              key={item.key}
              onClick={() => toggle(item.key)}
              disabled={isSaving}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                done
                  ? 'bg-green-50 border border-green-100'
                  : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
              } ${isSaving ? 'opacity-60' : ''}`}
            >
              <div className={`h-4.5 w-4.5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                done ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
              }`}
                style={{ height: 18, width: 18 }}
              >
                {done && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </div>
              <span className={`text-sm ${done ? 'text-green-800 line-through decoration-green-400' : 'text-gray-700'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
