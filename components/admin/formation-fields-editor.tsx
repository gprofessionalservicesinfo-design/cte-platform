'use client'

import { useState } from 'react'
import { Save, CheckCircle2 } from 'lucide-react'

interface Props {
  companyId: string
  initialData: {
    registered_agent_name:    string | null
    registered_agent_address: string | null
    organizer_name:           string | null
    organizer_address:        string | null
    principal_office_address: string | null
    mailing_address:          string | null
  }
}

interface FieldGroupProps {
  title: string
  fields: { key: string; label: string; value: string; placeholder?: string }[]
  values: Record<string, string>
  onChange: (key: string, val: string) => void
}

function FieldGroup({ title, fields, values, onChange }: FieldGroupProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{title}</p>
      <div className="space-y-2">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-xs text-gray-500 mb-0.5">{f.label}</label>
            <input
              type="text"
              value={values[f.key] ?? ''}
              onChange={e => onChange(f.key, e.target.value)}
              placeholder={f.placeholder ?? f.label}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function FormationFieldsEditor({ companyId, initialData }: Props) {
  const [values, setValues] = useState<Record<string, string>>({
    registered_agent_name:    initialData.registered_agent_name    ?? '',
    registered_agent_address: initialData.registered_agent_address ?? '',
    organizer_name:           initialData.organizer_name           ?? '',
    organizer_address:        initialData.organizer_address        ?? '',
    principal_office_address: initialData.principal_office_address ?? '',
    mailing_address:          initialData.mailing_address          ?? '',
  })
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)

  function onChange(key: string, val: string) {
    setValues(prev => ({ ...prev, [key]: val }))
    setSaved(false)
    setError(null)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/update-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, ...values }),
      })
      if (!res.ok) {
        const { error: msg } = await res.json()
        setError(msg ?? 'Error al guardar')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <FieldGroup
        title="Registered Agent"
        fields={[
          { key: 'registered_agent_name',    label: 'Nombre del Registered Agent',     placeholder: 'Ej: CreaTuEmpresaUSA LLC' },
          { key: 'registered_agent_address', label: 'Dirección del Registered Agent',  placeholder: 'Calle, Ciudad, Estado, ZIP' },
        ]}
        values={values}
        onChange={onChange}
      />

      <FieldGroup
        title="Organizer"
        fields={[
          { key: 'organizer_name',    label: 'Nombre del Organizer',    placeholder: 'Nombre completo' },
          { key: 'organizer_address', label: 'Dirección del Organizer', placeholder: 'Calle, Ciudad, País' },
        ]}
        values={values}
        onChange={onChange}
      />

      <FieldGroup
        title="Addresses"
        fields={[
          { key: 'principal_office_address', label: 'Dirección de Oficina Principal', placeholder: 'Calle, Ciudad, Estado/País' },
          { key: 'mailing_address',          label: 'Dirección Postal',               placeholder: 'Dejar vacío si es igual a la principal' },
        ]}
        values={values}
        onChange={onChange}
      />

      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 bg-[#0A2540] hover:bg-[#0d3060] text-white"
      >
        {saved ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            Guardado
          </>
        ) : saving ? (
          <>
            <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Guardar
          </>
        )}
      </button>
    </div>
  )
}
