'use client'

import { useState } from 'react'

export function AddressServiceToggle({
  companyId,
  initialEnabled,
  initialType,
  initialPeriod,
}: {
  companyId: string
  initialEnabled: boolean
  initialType: string | null
  initialPeriod: string | null
}) {
  const [enabled, setEnabled]   = useState(initialEnabled)
  const [type, setType]         = useState<string>(initialType ?? 'standard')
  const [period, setPeriod]     = useState<string>(initialPeriod ?? 'monthly')
  const [saving, setSaving]     = useState(false)

  async function save(patch: Record<string, any>) {
    setSaving(true)
    try {
      await fetch('/api/admin/update-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, ...patch }),
      })
    } finally {
      setSaving(false)
    }
  }

  async function toggleEnabled() {
    const next = !enabled
    setEnabled(next)
    await save({ address_service_enabled: next })
  }

  async function changeType(val: string) {
    setType(val)
    await save({ address_service_type: val })
  }

  async function changePeriod(val: string) {
    setPeriod(val)
    await save({ address_service_period: val })
  }

  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">Business Address habilitado</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {enabled ? 'El cliente puede ver su dirección comercial.' : 'Sección bloqueada para el cliente.'}
          </p>
        </div>
        <button
          onClick={toggleEnabled}
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

      {enabled && (
        <div className="pl-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-14">Tipo</span>
            <div className="flex gap-2">
              {(['standard', 'vip'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => changeType(t)}
                  disabled={saving}
                  className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                    type === t
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {t === 'standard' ? 'Standard' : 'VIP'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-14">Período</span>
            <div className="flex gap-2">
              {(['monthly', 'annual'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => changePeriod(p)}
                  disabled={saving}
                  className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                    period === p
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {p === 'monthly' ? 'Mensual' : 'Anual'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
