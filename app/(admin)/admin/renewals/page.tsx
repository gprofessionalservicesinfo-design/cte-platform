'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AlertTriangle, CheckCircle2, Clock, CalendarClock, RefreshCw,
  ChevronDown, Filter, Bell, ShieldCheck, Search, X,
} from 'lucide-react'
import { RENEWAL_TYPE_LABELS } from '@/lib/renewals/state-obligations'

// ── Types ─────────────────────────────────────────────────────────
type RenewalStatus = 'upcoming' | 'due_soon' | 'overdue' | 'paid' | 'waived' | 'not_applicable'

interface Renewal {
  id: string
  company_id: string
  type: string
  label: string
  description: string | null
  due_date: string
  estimated_cost_cents: number
  status: RenewalStatus
  is_required: boolean
  compliance_plan_covers: boolean
  paid_at: string | null
  notes: string | null
  last_reminder_at: string | null
  companies: {
    company_name: string
    state: string
    entity_type: string
    formation_date: string | null
    clients: {
      users: { full_name: string; email: string }
    }
  }
}

// ── Helpers ────────────────────────────────────────────────────────
function daysUntil(dateStr: string): number {
  const due = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86400000)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  })
}

function formatCents(cents: number) {
  return '$' + (cents / 100).toFixed(0)
}

const STATUS_CONFIG: Record<RenewalStatus, { label: string; badge: string; icon: React.FC<any>; row: string }> = {
  upcoming:       { label: 'Próximamente', badge: 'bg-blue-100 text-blue-700',   icon: CalendarClock, row: '' },
  due_soon:       { label: 'Vence Pronto', badge: 'bg-amber-100 text-amber-700', icon: Clock,         row: 'bg-amber-50' },
  overdue:        { label: 'Vencida',      badge: 'bg-red-100 text-red-700',     icon: AlertTriangle, row: 'bg-red-50' },
  paid:           { label: 'Pagada',       badge: 'bg-green-100 text-green-700', icon: CheckCircle2,  row: '' },
  waived:         { label: 'Exenta',       badge: 'bg-gray-100 text-gray-600',   icon: CheckCircle2,  row: '' },
  not_applicable: { label: 'No Aplica',    badge: 'bg-gray-100 text-gray-500',   icon: CheckCircle2,  row: '' },
}

// ── Page ───────────────────────────────────────────────────────────
export default function AdminRenewalsPage() {
  const [renewals, setRenewals]         = useState<Renewal[]>([])
  const [loading, setLoading]           = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter]     = useState<string>('all')
  const [search, setSearch]             = useState('')
  const [editingId, setEditingId]       = useState<string | null>(null)
  const [editStatus, setEditStatus]     = useState<RenewalStatus>('paid')
  const [editNotes, setEditNotes]       = useState('')
  const [saving, setSaving]             = useState(false)
  const [toastMsg, setToastMsg]         = useState('')

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchRenewals = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (typeFilter   !== 'all') params.set('type',   typeFilter)
      const res  = await fetch(`/api/admin/renewals?${params}`)
      const data = await res.json()
      setRenewals(data.renewals ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, typeFilter])

  useEffect(() => { fetchRenewals() }, [fetchRenewals])

  // ── KPIs ──────────────────────────────────────────────────────
  const kpis = {
    overdue:   renewals.filter(r => r.status === 'overdue').length,
    due_soon:  renewals.filter(r => r.status === 'due_soon').length,
    upcoming:  renewals.filter(r => r.status === 'upcoming').length,
    paid:      renewals.filter(r => r.status === 'paid').length,
  }

  // ── Filter + search client-side ─────────────────────────────
  const filtered = renewals.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.companies?.company_name?.toLowerCase().includes(q) ||
      r.companies?.clients?.users?.email?.toLowerCase().includes(q) ||
      r.label.toLowerCase().includes(q)
    )
  })

  // ── Save edit ──────────────────────────────────────────────
  async function handleSave(id: string) {
    setSaving(true)
    try {
      const body: any = { status: editStatus, notes: editNotes }
      if (editStatus === 'paid') body.paid_at = new Date().toISOString()
      const res = await fetch(`/api/admin/renewals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Failed to save')
      setEditingId(null)
      setToastMsg('Actualizado correctamente')
      setTimeout(() => setToastMsg(''), 3000)
      fetchRenewals()
    } catch {
      setToastMsg('Error al guardar')
      setTimeout(() => setToastMsg(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  // ── Trigger cron manually ─────────────────────────────────
  async function triggerCron() {
    setToastMsg('Ejecutando cron…')
    const res = await fetch('/api/cron/renewals-check?secret=DEV_TRIGGER')
    const data = await res.json()
    setToastMsg(`Cron OK — emails enviados: ${data.emailsSent ?? 0}`)
    setTimeout(() => setToastMsg(''), 5000)
    fetchRenewals()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Renewals & Compliance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión centralizada de todas las obligaciones activas</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={triggerCron}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
            <Bell className="h-4 w-4" /> Run reminders
          </button>
          <button onClick={fetchRenewals}
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { key: 'overdue',  label: 'Vencidas',      value: kpis.overdue,  color: 'bg-red-50 border-red-100',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700' },
          { key: 'due_soon', label: 'Vencen pronto', value: kpis.due_soon, color: 'bg-amber-50 border-amber-100', text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700' },
          { key: 'upcoming', label: 'Próximamente',  value: kpis.upcoming, color: 'bg-blue-50 border-blue-100',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700' },
          { key: 'paid',     label: 'Pagadas',        value: kpis.paid,     color: 'bg-green-50 border-green-100', text: 'text-green-700',  badge: 'bg-green-100 text-green-700' },
        ].map(k => (
          <button
            key={k.key}
            onClick={() => setStatusFilter(statusFilter === k.key ? 'all' : k.key)}
            className={`rounded-xl border p-4 text-left transition-all ${k.color} ${statusFilter === k.key ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{k.label}</p>
            <p className={`text-3xl font-bold ${k.text}`}>{k.value}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
        <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text" placeholder="Buscar empresa, email…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* Status filter */}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400">
          <option value="all">Todos los estados</option>
          <option value="overdue">Vencidas</option>
          <option value="due_soon">Vencen pronto</option>
          <option value="upcoming">Próximamente</option>
          <option value="paid">Pagadas</option>
          <option value="waived">Exentas</option>
        </select>

        {/* Type filter */}
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400">
          <option value="all">Todos los tipos</option>
          {Object.entries(RENEWAL_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        {(statusFilter !== 'all' || typeFilter !== 'all' || search) && (
          <button onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setSearch('') }}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <X className="h-3.5 w-3.5" /> Limpiar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Sin resultados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Empresa</th>
                  <th className="px-4 py-3 text-left">Obligación</th>
                  <th className="px-4 py-3 text-left">Vence</th>
                  <th className="px-4 py-3 text-right">Costo est.</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Cobertura</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(r => {
                  const cfg      = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.upcoming
                  const typeInfo = RENEWAL_TYPE_LABELS[r.type] ?? { label: r.type, icon: '📋' }
                  const StatusIcon = cfg.icon
                  const days     = daysUntil(r.due_date)
                  const isEditing = editingId === r.id

                  return (
                    <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${cfg.row}`}>
                      {/* Company */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 leading-snug">{r.companies?.company_name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{r.companies?.state} · {r.companies?.clients?.users?.email}</p>
                      </td>

                      {/* Obligation */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{typeInfo.icon}</span>
                          <div>
                            <p className="font-medium text-gray-800 leading-snug">{r.label}</p>
                            <p className="text-xs text-gray-400">{typeInfo.label}</p>
                          </div>
                        </div>
                      </td>

                      {/* Due date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className={`font-medium ${days < 0 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-gray-700'}`}>
                          {formatDate(r.due_date)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {days === 0 ? 'Hoy' : days > 0 ? `en ${days}d` : `${Math.abs(days)}d vencida`}
                        </p>
                      </td>

                      {/* Cost */}
                      <td className="px-4 py-3 text-right font-medium text-gray-700 whitespace-nowrap">
                        {r.estimated_cost_cents > 0 ? formatCents(r.estimated_cost_cents) : '—'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Compliance plan */}
                      <td className="px-4 py-3 text-center">
                        {r.compliance_plan_covers
                          ? <span className="inline-flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                              <ShieldCheck className="h-3 w-3" /> Cubierto
                            </span>
                          : <span className="text-xs text-gray-300">—</span>
                        }
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-center">
                        {isEditing ? (
                          <div className="space-y-2 min-w-[180px] text-left">
                            <select
                              value={editStatus}
                              onChange={e => setEditStatus(e.target.value as RenewalStatus)}
                              className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400"
                            >
                              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>
                            <textarea
                              placeholder="Notas opcionales…"
                              value={editNotes}
                              onChange={e => setEditNotes(e.target.value)}
                              rows={2}
                              className="w-full text-xs border border-gray-200 rounded px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-slate-400"
                            />
                            <div className="flex gap-1.5">
                              <button onClick={() => handleSave(r.id)} disabled={saving}
                                className="flex-1 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors disabled:opacity-50">
                                {saving ? '…' : 'Guardar'}
                              </button>
                              <button onClick={() => setEditingId(null)}
                                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 transition-colors">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(r.id)
                              setEditStatus(r.status)
                              setEditNotes(r.notes ?? '')
                            }}
                            className="text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 mx-auto"
                          >
                            <ChevronDown className="h-3.5 w-3.5" /> Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg z-50">
          {toastMsg}
        </div>
      )}
    </div>
  )
}
