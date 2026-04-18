'use client'

import { useEffect, useState } from 'react'
import { Plus, RefreshCw, MessageCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SERVICE_LABELS: Record<string, string> = {
  registered_agent: 'Registered Agent',
  business_address: 'Business Address',
  itin:             'ITIN Application',
  annual_report:    'Annual Report Filing',
  bookkeeping:      'Bookkeeping',
  trademark:        'Trademark Registration',
  ein:              'EIN Obtainment',
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  active:    'bg-green-100  text-green-700',
  expired:   'bg-red-100    text-red-700',
  cancelled: 'bg-gray-100   text-gray-500',
}

const SERVICE_PRICES: Record<string, number> = {
  registered_agent: 149,
  business_address: 149,
  itin:             299,
  annual_report:    149,
  bookkeeping:      99,
  trademark:        499,
  ein:              99,
}

interface Service {
  id:           string
  service_type: string
  status:       string
  price:        number | null
  expires_at:   string | null
  notes:        string | null
  created_at:   string
}

interface Props {
  companyId:   string
  clientPhone: string | null
  clientName:  string
}

export function AddonServicesPanel({ companyId, clientPhone, clientName }: Props) {
  const [services,   setServices]   = useState<Service[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showAdd,    setShowAdd]    = useState(false)
  const [newType,    setNewType]    = useState('registered_agent')
  const [newPrice,   setNewPrice]   = useState('')
  const [newExpiry,  setNewExpiry]  = useState('')
  const [newNotes,   setNewNotes]   = useState('')
  const [adding,     setAdding]     = useState(false)
  const [sending,    setSending]    = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/admin/addon-services?companyId=${companyId}`)
    if (res.ok) {
      const { services: s } = await res.json()
      setServices(s ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [companyId])

  async function handleAdd() {
    setAdding(true)
    const res = await fetch('/api/admin/addon-services', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id:  companyId,
        service_type: newType,
        price:        newPrice ? parseFloat(newPrice) : SERVICE_PRICES[newType] ?? null,
        expires_at:   newExpiry || null,
        notes:        newNotes || null,
      }),
    })
    if (res.ok) {
      setShowAdd(false)
      setNewType('registered_agent')
      setNewPrice('')
      setNewExpiry('')
      setNewNotes('')
      await load()
    }
    setAdding(false)
  }

  async function updateStatus(id: string, status: string) {
    await fetch('/api/admin/addon-services', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    await load()
  }

  async function sendReminder(service: Service) {
    if (!clientPhone) { alert('Sin número de WhatsApp para este cliente'); return }
    setSending(service.id)
    const body = `Hola ${clientName.split(' ')[0]}, te recordamos que tu servicio de ${SERVICE_LABELS[service.service_type] ?? service.service_type} ${service.expires_at ? `vence el ${new Date(service.expires_at).toLocaleDateString('es-MX')}` : 'requiere atención'}. Para renovar o consultar, contáctanos. 📋`
    await fetch('/api/whatsapp/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: clientPhone, body }),
    })
    setSending(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {services.length} service{services.length !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-2">
          <button onClick={load} className="text-gray-400 hover:text-gray-600">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setShowAdd(v => !v)}>
            <Plus className="h-3.5 w-3.5" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-3">
          <p className="text-sm font-semibold text-blue-800">Add Service</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Service type</label>
              <select
                value={newType}
                onChange={e => { setNewType(e.target.value); setNewPrice(String(SERVICE_PRICES[e.target.value] ?? '')) }}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(SERVICE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Price ($)</label>
              <input
                type="number"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                placeholder={String(SERVICE_PRICES[newType] ?? '')}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Expires at</label>
              <input
                type="date"
                value={newExpiry}
                onChange={e => setNewExpiry(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Notes</label>
              <input
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button size="sm" className="h-7 text-xs" onClick={handleAdd} disabled={adding}>
              {adding ? 'Adding…' : 'Add'}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No addon services yet.</p>
      ) : (
        <div className="space-y-2">
          {services.map(s => (
            <div key={s.id} className="border border-gray-100 rounded-lg p-3 bg-white">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800">
                      {SERVICE_LABELS[s.service_type] ?? s.service_type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[s.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {s.status}
                    </span>
                  </div>
                  {s.price && <p className="text-xs text-gray-500 mt-0.5">${s.price.toFixed(2)}</p>}
                  {s.expires_at && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Expires: {new Date(s.expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  )}
                  {s.notes && <p className="text-xs text-gray-400 mt-0.5 italic">{s.notes}</p>}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  {/* Status quick-set */}
                  <div className="relative group">
                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-2 py-1">
                      Status <ChevronDown className="h-3 w-3" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-hover:block">
                      {['pending', 'active', 'expired', 'cancelled'].map(st => (
                        <button
                          key={st}
                          onClick={() => updateStatus(s.id, st)}
                          className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 capitalize"
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => sendReminder(s)}
                    disabled={!clientPhone || sending === s.id}
                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 border border-green-200 rounded px-2 py-1 disabled:opacity-40"
                  >
                    <MessageCircle className="h-3 w-3" />
                    {sending === s.id ? '…' : 'Reminder'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
