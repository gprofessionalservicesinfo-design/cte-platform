'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Pencil, Check, X } from 'lucide-react'

interface CompanyEditorProps {
  companyId: string
  initialData: {
    company_name: string
    entity_type: string | null
    state: string | null
    formation_date: string | null
    registered_agent: string | null
  }
}

const ENTITY_TYPES = ['LLC', 'C-Corp', 'S-Corp', 'Non-Profit', 'Sole Proprietorship', 'General Partnership', 'Series LLC']
const STATES = ['WY', 'DE', 'FL', 'CO', 'TX', 'NV', 'CA', 'NY', 'TX', 'WA']

export function CompanyEditor({ companyId, initialData }: CompanyEditorProps) {
  const [editing, setEditing] = useState(false)
  const [data, setData] = useState(initialData)
  const [draft, setDraft] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/update-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, ...draft }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Error al guardar')
      setData(draft)
      setEditing(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    setDraft(data)
    setEditing(false)
    setError(null)
  }

  if (!editing) {
    return (
      <div className="space-y-1">
        <dl className="divide-y divide-gray-100 text-sm">
          <div className="py-2 flex justify-between">
            <dt className="text-gray-500">Nombre empresa</dt>
            <dd className="font-medium text-gray-900">{data.company_name}</dd>
          </div>
          <div className="py-2 flex justify-between">
            <dt className="text-gray-500">Tipo entidad</dt>
            <dd className="font-medium text-gray-900">{data.entity_type ?? '—'}</dd>
          </div>
          <div className="py-2 flex justify-between">
            <dt className="text-gray-500">Estado</dt>
            <dd className="font-medium text-gray-900">{data.state ?? '—'}</dd>
          </div>
          <div className="py-2 flex justify-between">
            <dt className="text-gray-500">Fecha formación</dt>
            <dd className="font-medium text-gray-900">{data.formation_date ?? 'Pendiente'}</dd>
          </div>
          <div className="py-2 flex justify-between">
            <dt className="text-gray-500">Agente registrado</dt>
            <dd className="font-medium text-gray-900">{data.registered_agent ?? '—'}</dd>
          </div>
        </dl>
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 text-gray-500 hover:text-gray-700"
          onClick={() => { setDraft(data); setEditing(true) }}
        >
          <Pencil className="h-3.5 w-3.5 mr-1.5" />
          Editar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="ce-name">Nombre empresa</Label>
        <Input
          id="ce-name"
          value={draft.company_name}
          onChange={(e) => setDraft((d) => ({ ...d, company_name: e.target.value }))}
          disabled={loading}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ce-entity">Tipo de entidad</Label>
        <select
          id="ce-entity"
          value={draft.entity_type ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, entity_type: e.target.value }))}
          disabled={loading}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">— Seleccionar —</option>
          {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ce-state">Estado de formación</Label>
        <select
          id="ce-state"
          value={draft.state ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, state: e.target.value }))}
          disabled={loading}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">— Seleccionar —</option>
          {[...new Set(STATES)].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ce-date">Fecha de formación</Label>
        <Input
          id="ce-date"
          type="date"
          value={draft.formation_date ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, formation_date: e.target.value || null }))}
          disabled={loading}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ce-agent">Agente registrado</Label>
        <Input
          id="ce-agent"
          value={draft.registered_agent ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, registered_agent: e.target.value }))}
          disabled={loading}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Check className="h-3.5 w-3.5 mr-1.5" />}
          Guardar
        </Button>
        <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
          <X className="h-3.5 w-3.5 mr-1.5" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}
