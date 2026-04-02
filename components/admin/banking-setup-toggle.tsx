'use client'

import { useState } from 'react'

export function BankingSetupToggle({
  companyId,
  initialValue,
}: {
  companyId: string
  initialValue: boolean
}) {
  const [enabled, setEnabled] = useState(initialValue)
  const [saving, setSaving] = useState(false)

  async function toggle() {
    const next = !enabled
    setSaving(true)
    try {
      const res = await fetch('/api/admin/update-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, banking_setup_enabled: next }),
      })
      if (res.ok) setEnabled(next)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-gray-900">Banking Setup habilitado</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {enabled ? 'El cliente puede ver la sección "Configura tus pagos".' : 'Sección bloqueada para el cliente.'}
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={saving}
        aria-pressed={enabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
