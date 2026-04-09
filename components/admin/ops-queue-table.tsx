'use client'

import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { Search, Pencil, AlertTriangle, ChevronRight, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────────────────

export interface OpsRow {
  id: string
  company_name: string
  state: string | null
  package: string | null
  status: string | null
  ein: string | null
  order_status: string | null
  work_queue_status: string | null
  next_action: string | null
  case_owner: string | null
  customer_handoff_status: string | null
  whatsapp_status: string | null
  created_at: string
  clients: {
    users: { full_name: string | null; email: string | null } | null
  } | null
}

// ── Label maps ────────────────────────────────────────────────────────────────

const PLAN_LABEL: Record<string, string> = {
  basic: 'Starter', starter: 'Starter',
  growth: 'Pro', professional: 'Pro',
  premium: 'Premium',
}

const QUEUE_CONFIG: Record<string, { label: string; cls: string }> = {
  new:      { label: 'Nuevo',      cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  assigned: { label: 'Asignado',   cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  working:  { label: 'En proceso', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  blocked:  { label: 'Bloqueado',  cls: 'bg-red-50 text-red-700 border-red-200' },
  done:     { label: 'Listo',      cls: 'bg-green-50 text-green-700 border-green-200' },
}

const HANDOFF_CONFIG: Record<string, { label: string; cls: string }> = {
  confirmation_sent:        { label: 'Confirmado',  cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  portal_ready:             { label: 'Portal',      cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  awaiting_internal_review: { label: 'Revisión',    cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  awaiting_client_info:     { label: 'Esp. cliente', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  active_processing:        { label: 'Activo',      cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const ORDER_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  paid:            { label: 'Pagado',    cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  intake_pending:  { label: 'Intake',    cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  intake_received: { label: 'Recibido',  cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  in_progress:     { label: 'En curso',  cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  completed:       { label: 'Completado', cls: 'bg-green-50 text-green-700 border-green-200' },
  on_hold:         { label: 'En espera', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
}

// ── Priority logic ────────────────────────────────────────────────────────────

type Priority = 'blocked' | 'needs_attention' | 'missing_action' | null

function getPriority(row: OpsRow): Priority {
  if (row.work_queue_status === 'blocked') return 'blocked'
  if (row.work_queue_status === 'new' && !row.next_action) return 'needs_attention'
  if (row.whatsapp_status === 'failed') return 'needs_attention'
  if (!row.next_action && row.work_queue_status !== 'done') return 'missing_action'
  return null
}

// ── Sub-components ────────────────────────────────────────────────────────────

function QueueBadge({ status }: { status: string | null }) {
  const cfg = QUEUE_CONFIG[status ?? ''] ?? { label: status ?? '—', cls: 'bg-gray-100 text-gray-500 border-gray-200' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

function HandoffBadge({ status }: { status: string | null }) {
  const cfg = HANDOFF_CONFIG[status ?? ''] ?? { label: '—', cls: 'bg-gray-100 text-gray-400 border-gray-200' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

function OrderStatusBadge({ status }: { status: string | null }) {
  const cfg = ORDER_STATUS_CONFIG[status ?? ''] ?? { label: status ?? '—', cls: 'bg-gray-100 text-gray-500 border-gray-200' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

function PlanBadge({ plan }: { plan: string | null }) {
  const label = PLAN_LABEL[plan ?? ''] ?? plan ?? '—'
  const cls = plan === 'premium'
    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
    : plan === 'growth' || plan === 'professional'
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${cls}`}>
      {label}
    </span>
  )
}

function PriorityFlag({ priority }: { priority: Priority }) {
  if (!priority) return null
  if (priority === 'blocked') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
        <AlertTriangle className="h-3 w-3" /> Bloqueado
      </span>
    )
  }
  if (priority === 'needs_attention') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle className="h-3 w-3" /> Atencion
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
      Sin siguiente paso
    </span>
  )
}

function WelcomeDots({ waStatus }: { waStatus: string | null }) {
  const waDot = waStatus === 'sent'
    ? 'bg-green-500' : waStatus === 'failed'
    ? 'bg-red-400' : 'bg-gray-300'
  return (
    <div className="flex items-center gap-1.5" title={`Email: enviado · WA: ${waStatus ?? 'desconocido'}`}>
      {/* email — always assumed sent if company exists */}
      <span className="h-2 w-2 rounded-full bg-green-500" title="Email enviado" />
      <span className={`h-2 w-2 rounded-full ${waDot}`} title={`WhatsApp: ${waStatus ?? '—'}`} />
    </div>
  )
}

function NextActionCell({ companyId, initial }: { companyId: string; initial: string | null }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initial ?? '')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function save() {
    if (saving) return
    setSaving(true)
    try {
      await fetch(`/api/admin/companies/${companyId}/next-action`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ next_action: value.trim() || null }),
      })
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); save() }
            if (e.key === 'Escape') { setValue(initial ?? ''); setEditing(false) }
          }}
          disabled={saving}
          className="text-xs border border-gray-300 rounded px-2 py-1 w-44 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button onClick={() => { setValue(initial ?? ''); setEditing(false) }} className="text-gray-400 hover:text-gray-600">
          <X className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="group flex items-center gap-1 text-left max-w-[180px]"
    >
      {value ? (
        <span className="text-xs text-gray-700 truncate">{value}</span>
      ) : (
        <span className="text-xs text-gray-300 italic">Sin definir</span>
      )}
      <Pencil className="h-3 w-3 text-gray-300 group-hover:text-gray-500 flex-shrink-0 ml-0.5" />
    </button>
  )
}

function CaseOwnerCell({ companyId, initial }: { companyId: string; initial: string | null }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initial ?? '')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function save() {
    if (saving) return
    setSaving(true)
    try {
      await fetch(`/api/admin/companies/${companyId}/case-owner`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_owner: value.trim() || null }),
      })
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); save() }
            if (e.key === 'Escape') { setValue(initial ?? ''); setEditing(false) }
          }}
          disabled={saving}
          maxLength={30}
          placeholder="Nombre / iniciales"
          className="text-xs border border-gray-300 rounded px-2 py-1 w-28 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button onClick={() => { setValue(initial ?? ''); setEditing(false) }} className="text-gray-400 hover:text-gray-600">
          <X className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="group flex items-center gap-1 text-left"
    >
      {value ? (
        <span className="text-xs font-medium text-gray-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
          {value}
        </span>
      ) : (
        <span className="text-xs text-gray-300 italic">Sin asignar</span>
      )}
      <Pencil className="h-3 w-3 text-gray-300 group-hover:text-gray-500 flex-shrink-0 ml-0.5" />
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

export function OpsQueueTable({ rows }: { rows: OpsRow[] }) {
  const [search, setSearch]               = useState('')
  const [queueFilter, setQueueFilter]     = useState('all')
  const [planFilter, setPlanFilter]       = useState('all')
  const [orderFilter, setOrderFilter]     = useState('all')
  const [stateFilter, setStateFilter]     = useState('all')
  const [einFilter, setEinFilter]         = useState('all')   // 'all' | 'has_ein' | 'pending_ein'
  const [priorityOnly, setPriorityOnly]   = useState(false)
  const [awaitingClient, setAwaitingClient] = useState(false)
  const [page, setPage]                   = useState(1)

  function reset() { setPage(1) }

  const uniqueStates = useMemo(() => {
    const s = Array.from(new Set(rows.map(r => r.state).filter(Boolean) as string[]))
    return s.sort()
  }, [rows])

  const filtered = useMemo(() => {
    let r = [...rows]

    if (search) {
      const q = search.toLowerCase()
      r = r.filter(row =>
        row.company_name.toLowerCase().includes(q) ||
        (row.clients?.users?.full_name ?? '').toLowerCase().includes(q) ||
        (row.clients?.users?.email ?? '').toLowerCase().includes(q) ||
        (row.state ?? '').toLowerCase().includes(q)
      )
    }
    if (queueFilter !== 'all')  r = r.filter(row => row.work_queue_status === queueFilter)
    if (planFilter !== 'all')   r = r.filter(row => (row.package ?? '') === planFilter)
    if (orderFilter !== 'all')  r = r.filter(row => (row.order_status ?? '') === orderFilter)
    if (stateFilter !== 'all')  r = r.filter(row => row.state === stateFilter)
    if (einFilter === 'has_ein')     r = r.filter(row => !!row.ein)
    if (einFilter === 'pending_ein') r = r.filter(row => !row.ein)
    if (priorityOnly)    r = r.filter(row => getPriority(row) !== null)
    if (awaitingClient)  r = r.filter(row => row.customer_handoff_status === 'awaiting_client_info')

    // Sort: priority first, then newest
    r.sort((a, b) => {
      const pa = getPriority(a) !== null ? 0 : 1
      const pb = getPriority(b) !== null ? 0 : 1
      if (pa !== pb) return pa - pb
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return r
  }, [rows, search, queueFilter, planFilter, orderFilter, stateFilter, einFilter, priorityOnly, awaitingClient])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const needsAttentionCount = rows.filter(r => getPriority(r) !== null).length

  return (
    <div className="space-y-4">

      {/* Attention banner */}
      {needsAttentionCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            {needsAttentionCount} {needsAttentionCount === 1 ? 'caso requiere' : 'casos requieren'} atencion —
            <button
              className="underline ml-1"
              onClick={() => { setPriorityOnly(true); reset() }}
            >
              ver solo estos
            </button>
          </p>
        </div>
      )}

      {/* Primary filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar empresa, cliente, email, estado…"
            value={search}
            onChange={e => { setSearch(e.target.value); reset() }}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <Select value={queueFilter} onValueChange={v => { setQueueFilter(v); reset() }}>
          <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
            <SelectValue placeholder="Queue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="new">Nuevo</SelectItem>
            <SelectItem value="assigned">Asignado</SelectItem>
            <SelectItem value="working">En proceso</SelectItem>
            <SelectItem value="blocked">Bloqueado</SelectItem>
            <SelectItem value="done">Listo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={v => { setPlanFilter(v); reset() }}>
          <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los planes</SelectItem>
            <SelectItem value="basic">Starter</SelectItem>
            <SelectItem value="growth">Pro</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>
        <button
          onClick={() => { setPriorityOnly(v => !v); reset() }}
          className={`h-9 px-3 rounded-md border text-sm font-medium transition-colors flex-shrink-0 ${
            priorityOnly
              ? 'bg-amber-500 border-amber-500 text-white'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Solo prioritarios
        </button>
      </div>

      {/* Secondary filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <Select value={orderFilter} onValueChange={v => { setOrderFilter(v); reset() }}>
          <SelectTrigger className="w-full sm:w-44 h-9 text-sm">
            <SelectValue placeholder="Orden" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
            <SelectItem value="intake_pending">Intake pendiente</SelectItem>
            <SelectItem value="intake_received">Intake recibido</SelectItem>
            <SelectItem value="in_progress">En curso</SelectItem>
            <SelectItem value="on_hold">En espera</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
          </SelectContent>
        </Select>
        {uniqueStates.length > 0 && (
          <Select value={stateFilter} onValueChange={v => { setStateFilter(v); reset() }}>
            <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
              <SelectValue placeholder="Estado (EE.UU.)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {uniqueStates.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={einFilter} onValueChange={v => { setEinFilter(v); reset() }}>
          <SelectTrigger className="w-full sm:w-40 h-9 text-sm">
            <SelectValue placeholder="EIN" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">EIN — todos</SelectItem>
            <SelectItem value="has_ein">Con EIN</SelectItem>
            <SelectItem value="pending_ein">Sin EIN</SelectItem>
          </SelectContent>
        </Select>
        <button
          onClick={() => { setAwaitingClient(v => !v); reset() }}
          className={`h-9 px-3 rounded-md border text-sm font-medium transition-colors flex-shrink-0 ${
            awaitingClient
              ? 'bg-orange-500 border-orange-500 text-white'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Esp. cliente
        </button>
        {(orderFilter !== 'all' || stateFilter !== 'all' || einFilter !== 'all' || awaitingClient) && (
          <button
            onClick={() => { setOrderFilter('all'); setStateFilter('all'); setEinFilter('all'); setAwaitingClient(false); reset() }}
            className="h-9 px-3 rounded-md border border-gray-200 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-400">
        {filtered.length} {filtered.length === 1 ? 'caso' : 'casos'}
        {(queueFilter !== 'all' || planFilter !== 'all' || orderFilter !== 'all' ||
          stateFilter !== 'all' || einFilter !== 'all' || priorityOnly || awaitingClient || search)
          && ' (filtrado)'}
      </p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1250px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 w-6"></th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Empresa / Cliente</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Estado</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Plan</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Orden</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Queue</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Handoff</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Responsable</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Siguiente paso</th>
                <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Bienvenida</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Fecha</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-gray-400 text-sm">
                    No hay casos con estos filtros.
                  </td>
                </tr>
              ) : paged.map(row => {
                const user     = row.clients?.users
                const priority = getPriority(row)
                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-gray-50 transition-colors ${priority === 'blocked' ? 'bg-red-50/30' : priority === 'needs_attention' ? 'bg-amber-50/20' : ''}`}
                  >
                    {/* Priority flag */}
                    <td className="px-4 py-3">
                      {priority && (
                        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${priority === 'blocked' ? 'bg-red-500' : priority === 'needs_attention' ? 'bg-amber-400' : 'bg-yellow-300'}`} />
                      )}
                    </td>
                    {/* Company / client */}
                    <td className="px-4 py-3 min-w-[180px]">
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{row.company_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{user?.full_name ?? user?.email ?? '—'}</p>
                      {priority && <div className="mt-1"><PriorityFlag priority={priority} /></div>}
                    </td>
                    {/* State */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-600">{row.state ?? '—'}</span>
                    </td>
                    {/* Plan */}
                    <td className="px-4 py-3">
                      <PlanBadge plan={row.package} />
                    </td>
                    {/* Order status */}
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={row.order_status} />
                    </td>
                    {/* Queue status */}
                    <td className="px-4 py-3">
                      <QueueBadge status={row.work_queue_status} />
                    </td>
                    {/* Handoff status */}
                    <td className="px-4 py-3">
                      <HandoffBadge status={row.customer_handoff_status} />
                    </td>
                    {/* Case owner — inline editable */}
                    <td className="px-4 py-3 min-w-[120px]">
                      <CaseOwnerCell companyId={row.id} initial={row.case_owner} />
                    </td>
                    {/* Next action — inline editable */}
                    <td className="px-4 py-3 min-w-[180px]">
                      <NextActionCell companyId={row.id} initial={row.next_action} />
                    </td>
                    {/* Welcome dots */}
                    <td className="px-4 py-3 text-center">
                      <WelcomeDots waStatus={row.whatsapp_status} />
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(row.created_at)}</span>
                    </td>
                    {/* Link */}
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/clients/${row.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 whitespace-nowrap"
                      >
                        Ver caso <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Legend + pagination footer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Bloqueado</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Atencion</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500" /> Email</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500" /> WA</span>
            <span className="text-gray-300">— icono doble: email · wa</span>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-100"
              >
                ←
              </button>
              <span>{page} / {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-2 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-100"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
