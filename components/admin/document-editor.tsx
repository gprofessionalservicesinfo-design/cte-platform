'use client'

import { useState } from 'react'
import { Plus, Trash2, FileText, Send, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Member {
  name:                 string
  address:              string
  country:              string
  ownership_percentage: number
}

interface DocEditorData {
  company_name:             string
  state:                    string
  formation_date:           string
  registered_agent_name:    string
  registered_agent_address: string
  organizer_name:           string
  organizer_address:        string
  principal_office_address: string
  mailing_address:          string
  members:                  Member[]
  purpose:                  string
  management_type:          'member_managed' | 'manager_managed'
  special_provisions:       string
}

interface Props {
  companyId:   string
  docId:       string
  initialData: Partial<DocEditorData>
  clientName:  string
  clientPhone: string | null
  docType:     'articles' | 'operating_agreement'
}

export function DocumentEditor({ companyId, docId, initialData, clientName, clientPhone, docType }: Props) {
  const [data, setData] = useState<DocEditorData>({
    company_name:             initialData.company_name             ?? '',
    state:                    initialData.state                    ?? '',
    formation_date:           initialData.formation_date           ?? '',
    registered_agent_name:    initialData.registered_agent_name    ?? '',
    registered_agent_address: initialData.registered_agent_address ?? '',
    organizer_name:           initialData.organizer_name           ?? '',
    organizer_address:        initialData.organizer_address        ?? '',
    principal_office_address: initialData.principal_office_address ?? '',
    mailing_address:          initialData.mailing_address          ?? '',
    members:                  initialData.members                  ?? [{ name: clientName, address: '', country: 'US', ownership_percentage: 100 }],
    purpose:                  initialData.purpose                  ?? '',
    management_type:          initialData.management_type          ?? 'member_managed',
    special_provisions:       initialData.special_provisions       ?? '',
  })

  const [previewing,  setPreviewing]  = useState(false)
  const [previewUrl,  setPreviewUrl]  = useState<string | null>(null)
  const [finalizing,  setFinalizing]  = useState(false)
  const [savedOk,     setSavedOk]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  function updateMember(idx: number, field: keyof Member, value: string | number) {
    setData(d => ({
      ...d,
      members: d.members.map((m, i) => i === idx ? { ...m, [field]: value } : m),
    }))
  }

  function addMember() {
    setData(d => ({
      ...d,
      members: [...d.members, { name: '', address: '', country: 'US', ownership_percentage: 0 }],
    }))
  }

  function removeMember(idx: number) {
    setData(d => ({ ...d, members: d.members.filter((_, i) => i !== idx) }))
  }

  async function handlePreview() {
    setPreviewing(true)
    setError(null)
    try {
      const totalPct = data.members.reduce((s, m) => s + Number(m.ownership_percentage), 0)
      const subtype  = data.members.length === 1
        ? 'single_member'
        : data.management_type === 'manager_managed'
          ? 'manager_managed'
          : 'multi_member'

      const res = await fetch('/api/documents/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id:      companyId,
          doc_type:        docType,
          subtype:         docType === 'operating_agreement' ? subtype : undefined,
          replace_doc_id:  docId,
          params: {
            company_name:             data.company_name,
            state:                    data.state,
            effective_date:           data.formation_date || new Date().toISOString().split('T')[0],
            registered_agent_name:    data.registered_agent_name,
            registered_agent_address: data.registered_agent_address,
            organizer_name:           data.organizer_name,
            organizer_address:        data.organizer_address,
            principal_office_address: data.principal_office_address,
            mailing_address:          data.mailing_address || undefined,
            members:                  data.members.map(m => ({
              name:                 m.name,
              address:              m.address,
              country:              m.country,
              ownership_percentage: Number(m.ownership_percentage),
            })),
            purpose:         data.purpose || undefined,
            management_type: data.management_type,
          },
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Error generando preview')
      setPreviewUrl(json.storage_path)
    } catch (e: any) {
      setError(e.message)
    }
    setPreviewing(false)
  }

  async function handleFinalize() {
    setFinalizing(true)
    setError(null)
    try {
      const subtype = data.members.length === 1
        ? 'single_member'
        : data.management_type === 'manager_managed'
          ? 'manager_managed'
          : 'multi_member'

      const res = await fetch('/api/documents/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id:      companyId,
          doc_type:        docType,
          subtype:         docType === 'operating_agreement' ? subtype : undefined,
          replace_doc_id:  docId,
          params: {
            company_name:             data.company_name,
            state:                    data.state,
            effective_date:           data.formation_date || new Date().toISOString().split('T')[0],
            registered_agent_name:    data.registered_agent_name,
            registered_agent_address: data.registered_agent_address,
            organizer_name:           data.organizer_name,
            organizer_address:        data.organizer_address,
            principal_office_address: data.principal_office_address,
            mailing_address:          data.mailing_address || undefined,
            members:                  data.members.map(m => ({
              name:                 m.name,
              address:              m.address,
              country:              m.country,
              ownership_percentage: Number(m.ownership_percentage),
            })),
            purpose:         data.purpose || undefined,
            management_type: data.management_type,
          },
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Error al finalizar')

      // Send WhatsApp notification
      if (clientPhone) {
        const firstName = clientName.split(' ')[0]
        await fetch('/api/whatsapp/send', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to:   clientPhone,
            body: `Hola ${firstName}, tu documento de ${docType === 'articles' ? 'Articles of Organization' : 'Operating Agreement'} está listo para revisar y aprobar en: https://creatuempresausa.com/dashboard/documents 📄`,
          }),
        })
      }

      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 4000)
    } catch (e: any) {
      setError(e.message)
    }
    setFinalizing(false)
  }

  return (
    <div className="space-y-6">
      {/* Company Info */}
      <section>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Información de la empresa</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nombre de empresa</label>
            <input
              value={data.company_name}
              onChange={e => setData(d => ({ ...d, company_name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Estado</label>
            <input
              value={data.state}
              onChange={e => setData(d => ({ ...d, state: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Fecha de formación</label>
            <input
              type="date"
              value={data.formation_date}
              onChange={e => setData(d => ({ ...d, formation_date: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tipo de gestión</label>
            <select
              value={data.management_type}
              onChange={e => setData(d => ({ ...d, management_type: e.target.value as any }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="member_managed">Member-Managed</option>
              <option value="manager_managed">Manager-Managed</option>
            </select>
          </div>
        </div>
      </section>

      {/* Registered Agent */}
      <section>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Agente Registrado</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
            <input
              value={data.registered_agent_name}
              onChange={e => setData(d => ({ ...d, registered_agent_name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Dirección</label>
            <input
              value={data.registered_agent_address}
              onChange={e => setData(d => ({ ...d, registered_agent_address: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Organizer */}
      <section>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Organizador</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
            <input
              value={data.organizer_name}
              onChange={e => setData(d => ({ ...d, organizer_name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Dirección</label>
            <input
              value={data.organizer_address}
              onChange={e => setData(d => ({ ...d, organizer_address: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Addresses */}
      <section>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Direcciones</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Dirección oficina principal</label>
            <input
              value={data.principal_office_address}
              onChange={e => setData(d => ({ ...d, principal_office_address: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Dirección postal (opcional)</label>
            <input
              value={data.mailing_address}
              onChange={e => setData(d => ({ ...d, mailing_address: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Members */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Miembros / Socios
          </p>
          <button onClick={addMember} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold">
            <Plus className="h-3.5 w-3.5" /> Agregar
          </button>
        </div>
        <div className="space-y-3">
          {data.members.map((m, idx) => (
            <div key={idx} className="border border-gray-100 rounded-lg p-3 bg-gray-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Miembro {idx + 1}</span>
                {data.members.length > 1 && (
                  <button onClick={() => removeMember(idx)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-400 mb-0.5 block">Nombre</label>
                  <input
                    value={m.name}
                    onChange={e => updateMember(idx, 'name', e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-0.5 block">País</label>
                  <input
                    value={m.country}
                    onChange={e => updateMember(idx, 'country', e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-0.5 block">Dirección</label>
                  <input
                    value={m.address}
                    onChange={e => updateMember(idx, 'address', e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-0.5 block">% de participación</label>
                  <input
                    type="number" min="0" max="100"
                    value={m.ownership_percentage}
                    onChange={e => updateMember(idx, 'ownership_percentage', e.target.value)}
                    className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400">
            Total: {data.members.reduce((s, m) => s + Number(m.ownership_percentage), 0)}% (debe ser 100%)
          </p>
        </div>
      </section>

      {/* Purpose & Special Provisions */}
      <section>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Propósito del negocio</p>
        <textarea
          rows={2}
          value={data.purpose}
          onChange={e => setData(d => ({ ...d, purpose: e.target.value }))}
          placeholder="Dejar en blanco para usar propósito genérico (cualquier actividad legal)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </section>

      {docType === 'operating_agreement' && (
        <section>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Disposiciones especiales (opcional)</p>
          <textarea
            rows={3}
            value={data.special_provisions}
            onChange={e => setData(d => ({ ...d, special_provisions: e.target.value }))}
            placeholder="Cláusulas adicionales, restricciones de transferencia, etc."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </section>
      )}

      {/* Error */}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {savedOk && <p className="text-sm text-green-600">✅ Documento finalizado y cliente notificado.</p>}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handlePreview}
          disabled={previewing}
        >
          <Eye className="h-3.5 w-3.5" />
          {previewing ? 'Generando…' : 'Preview PDF'}
        </Button>
        {previewUrl && (
          <a href={previewUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Abrir PDF
            </Button>
          </a>
        )}
        <Button
          size="sm"
          className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
          onClick={handleFinalize}
          disabled={finalizing}
        >
          <Send className="h-3.5 w-3.5" />
          {finalizing ? 'Finalizando…' : 'Finalizar y enviar al cliente'}
        </Button>
      </div>
    </div>
  )
}
