'use client'

import { useEffect, useState, useTransition, useMemo } from 'react'
import { toast } from 'sonner'
import { GitBranch, FlaskConical, Filter, AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react'
import { bulkCompleteTestCases, updateCaseStatus } from './actions'
import type { PipelineRow } from './page'

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  pending:        'Pendiente',
  name_check:     'Name Check',
  under_review:   'En revisión',
  in_progress:    'En proceso',
  articles_filed: 'Articles Filed',
  ein_processing: 'EIN Processing',
  ein_obtained:   'EIN Obtenido',
  active:         'Activo',
  completed:      'Completado',
  on_hold:        'Bloqueado',
}

const STATUS_BADGE: Record<string, string> = {
  pending:        'bg-yellow-100 text-yellow-800',
  name_check:     'bg-orange-100 text-orange-800',
  under_review:   'bg-orange-100 text-orange-800',
  in_progress:    'bg-blue-100 text-blue-800',
  articles_filed: 'bg-blue-100 text-blue-800',
  ein_processing: 'bg-indigo-100 text-indigo-800',
  ein_obtained:   'bg-violet-100 text-violet-800',
  active:         'bg-teal-100 text-teal-800',
  completed:      'bg-green-100 text-green-800',
  on_hold:        'bg-gray-100 text-gray-700',
}

// Statuses allowed in the per-row dropdown
const CHANGEABLE: { value: string; label: string }[] = [
  { value: 'name_check',     label: 'Name Check'     },
  { value: 'articles_filed', label: 'Articles Filed' },
  { value: 'ein_processing', label: 'EIN Processing' },
  { value: 'completed',      label: 'Completed'      },
]

function staleBadge(days: number) {
  if (days <= 2)  return 'text-gray-400'
  if (days <= 7)  return 'text-amber-600 font-semibold'
  return 'text-red-600 font-bold'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: '2-digit',
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PipelineClient({ data }: { data: PipelineRow[] }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [pendingRowId, setPendingRowId] = useState<string | null>(null)

  // Close modal on ESC
  useEffect(() => {
    if (!showConfirm) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowConfirm(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showConfirm])

  // ── Filter state ──────────────────────────────────────────────────────────
  const allStatuses = useMemo(
    () => Array.from(new Set(data.map(r => r.status ?? 'unknown'))).sort(),
    [data]
  )
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set())
  const [testFilter, setTestFilter]             = useState<'all' | 'test' | 'real'>('all')
  const [onlyStale, setOnlyStale]               = useState(false)
  const [statusMenuOpen, setStatusMenuOpen]     = useState(false)

  // ── Derived data ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return data.filter(r => {
      if (selectedStatuses.size > 0 && !selectedStatuses.has(r.status ?? 'unknown')) return false
      if (testFilter === 'test' && !r.is_test)  return false
      if (testFilter === 'real' &&  r.is_test)  return false
      if (onlyStale && r.days_stale <= 7)        return false
      return true
    })
  }, [data, selectedStatuses, testFilter, onlyStale])

  const testCount = useMemo(
    () => data.filter(r => r.is_test && r.status !== 'completed').length,
    [data]
  )

  // ── Bulk action ───────────────────────────────────────────────────────────
  function handleBulkConfirm() {
    setShowConfirm(false)
    startTransition(async () => {
      const result = await bulkCompleteTestCases()
      if (result.error) {
        toast.error(`Error: ${result.error}`)
      } else if (result.count === 0) {
        toast.info('No había cases de test pendientes.')
      } else {
        toast.success(`✅ ${result.count} case${result.count !== 1 ? 's' : ''} de TEST completados`)
      }
    })
  }

  // ── Row status change ─────────────────────────────────────────────────────
  function handleStatusChange(row: PipelineRow, newStatus: string) {
    if (!newStatus || newStatus === row.status) return
    setPendingRowId(row.id)
    startTransition(async () => {
      const result = await updateCaseStatus(row.id, newStatus)
      setPendingRowId(null)
      if (result.error) {
        toast.error(`Error: ${result.error}`)
      } else {
        toast.success(`${row.company_name} → ${STATUS_LABEL[newStatus] ?? newStatus}`)
      }
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#2CB98A]/10 p-2.5 rounded-xl">
            <GitBranch className="h-5 w-5 text-[#2CB98A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#2A3544]">Pipeline</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {data.length} empresas · {filtered.length} visibles
            </p>
          </div>
        </div>

        {/* Bulk action button */}
        {testCount > 0 && (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isPending}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <FlaskConical className="h-4 w-4" />
            Completar {testCount} case{testCount !== 1 ? 's' : ''} de TEST
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-wrap items-center gap-4">
        <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />

        {/* Status multi-select */}
        <div className="relative">
          <button
            onClick={() => setStatusMenuOpen(o => !o)}
            className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-600">
              {selectedStatuses.size === 0
                ? 'Todos los status'
                : `${selectedStatuses.size} status`}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {statusMenuOpen && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-3 min-w-[200px] space-y-1">
              <button
                onClick={() => { setSelectedStatuses(new Set()); setStatusMenuOpen(false) }}
                className="w-full text-left text-xs font-semibold text-[#2CB98A] hover:underline mb-2"
              >
                Limpiar filtro
              </button>
              {allStatuses.map(s => (
                <label key={s} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.has(s)}
                    onChange={e => {
                      setSelectedStatuses(prev => {
                        const next = new Set(prev)
                        e.target.checked ? next.add(s) : next.delete(s)
                        return next
                      })
                    }}
                    className="rounded accent-[#2CB98A]"
                  />
                  {STATUS_LABEL[s] ?? s}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* TEST / REAL / Ambos */}
        <div className="flex items-center gap-1 text-sm border border-gray-200 rounded-lg overflow-hidden">
          {(['all', 'real', 'test'] as const).map(v => (
            <button
              key={v}
              onClick={() => setTestFilter(v)}
              className={`px-3 py-1.5 transition-colors ${
                testFilter === v
                  ? 'bg-[#2CB98A] text-white font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {v === 'all' ? 'Todos' : v === 'real' ? 'REAL' : 'TEST'}
            </button>
          ))}
        </div>

        {/* Stale toggle */}
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <div
            onClick={() => setOnlyStale(o => !o)}
            className={`w-9 h-5 rounded-full transition-colors relative ${
              onlyStale ? 'bg-[#2CB98A]' : 'bg-gray-200'
            }`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              onlyStale ? 'translate-x-4' : 'translate-x-0.5'
            }`} />
          </div>
          Solo atascados &gt;7 días
        </label>

        {/* Active filter chips */}
        {(selectedStatuses.size > 0 || testFilter !== 'all' || onlyStale) && (
          <button
            onClick={() => { setSelectedStatuses(new Set()); setTestFilter('all'); setOnlyStale(false) }}
            className="text-xs text-gray-400 hover:text-red-500 underline"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">Empresa</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">Estado / Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">Creado</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">Días sin update</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">Tipo</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <CheckCircle2 className="h-7 w-7 text-[#2CB98A] mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      Sin resultados para los filtros seleccionados.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map(row => {
                  const loading = isPending && pendingRowId === row.id
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-gray-50/50 transition-colors ${loading ? 'opacity-50' : ''}`}
                    >
                      {/* Company name */}
                      <td className="px-4 py-3">
                        <a
                          href={`/admin/clients/${row.id}`}
                          className="font-semibold text-gray-900 hover:text-[#2CB98A] transition-colors truncate block max-w-[160px]"
                        >
                          {row.company_name}
                        </a>
                      </td>

                      {/* Client */}
                      <td className="px-4 py-3">
                        <p className="text-gray-700 truncate max-w-[170px]">{row.full_name ?? '—'}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[170px]">{row.email || '—'}</p>
                      </td>

                      {/* State / entity_type */}
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        <span>{row.state ?? '—'}</span>
                        {row.entity_type && (
                          <span className="text-gray-300 ml-1">· {row.entity_type}</span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          STATUS_BADGE[row.status ?? ''] ?? 'bg-gray-100 text-gray-600'
                        }`}>
                          {STATUS_LABEL[row.status ?? ''] ?? row.status ?? '—'}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(row.created_at)}
                      </td>

                      {/* Days stale */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`tabular-nums ${staleBadge(row.days_stale)}`}>
                          {row.days_stale}d
                        </span>
                        {row.days_stale > 7 && (
                          <AlertTriangle className="inline h-3.5 w-3.5 ml-1 text-red-400" />
                        )}
                      </td>

                      {/* TEST / REAL badge */}
                      <td className="px-4 py-3">
                        {row.is_test ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                            <FlaskConical className="h-3 w-3" /> TEST
                          </span>
                        ) : (
                          <span className="inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-[#4DB39A]/10 text-[#2CB98A] border border-[#4DB39A]/20">
                            REAL
                          </span>
                        )}
                      </td>

                      {/* Action dropdown */}
                      <td className="px-4 py-3 text-right">
                        <select
                          key={row.id + '-' + row.status}
                          defaultValue=""
                          disabled={loading}
                          onChange={e => handleStatusChange(row, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 hover:border-[#4DB39A] focus:outline-none focus:ring-1 focus:ring-[#4DB39A] cursor-pointer disabled:opacity-50"
                        >
                          <option value="" disabled>Cambiar status…</option>
                          {CHANGEABLE.map(opt => (
                            <option
                              key={opt.value}
                              value={opt.value}
                              disabled={opt.value === row.status}
                            >
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-between text-xs text-gray-400">
            <span>Mostrando {filtered.length} de {data.length} empresas</span>
            <span>
              {data.filter(r => r.days_stale > 7 && r.status !== 'completed').length} atascados &gt;7d
            </span>
          </div>
        )}
      </div>

      {/* ── Bulk confirm modal ───────────────────────────────────────────────── */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-xl">
                <FlaskConical className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900">
                ¿Completar todos los cases de TEST?
              </h2>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Esta acción moverá <strong>{testCount} empresa{testCount !== 1 ? 's' : ''} de test</strong> a
              status <span className="font-semibold text-green-700">completed</span>. Los datos reales no
              se afectan. ¿Continuar?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkConfirm}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
