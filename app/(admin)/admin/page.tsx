import { createAdminServerClient } from '@/lib/supabase/server'
import { LayoutDashboard } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/client/status-badge'

const PACKAGE_LABEL: Record<string, string> = {
  basic:      'Basic',
  growth:     'Growth',
  premium:    'Premium',
  starter:    'Starter',
  professional: 'Professional',
}

const STATUS_GROUPS: { label: string; statuses: string[]; color: string }[] = [
  { label: 'Pendiente',        statuses: ['pending'],                         color: 'bg-yellow-400' },
  { label: 'En revisión',      statuses: ['under_review', 'name_check'],      color: 'bg-orange-400' },
  { label: 'En proceso',       statuses: ['in_progress', 'active'],           color: 'bg-blue-500' },
  { label: 'EIN obtenido',     statuses: ['ein_obtained'],                    color: 'bg-indigo-500' },
  { label: 'Completado',       statuses: ['completed'],                       color: 'bg-green-500' },
  { label: 'En espera',        statuses: ['on_hold'],                         color: 'bg-gray-400' },
]

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-1">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

export default async function AdminDashboardPage() {
  const supabase = createAdminServerClient()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: companies },
    { count: totalClients },
    { count: newThisWeek },
  ] = await Promise.all([
    supabase
      .from('companies')
      .select(`
        id, company_name, state, status, package, total_paid, created_at,
        clients ( users ( full_name, email ) )
      `)
      .order('created_at', { ascending: false }),
    supabase.from('clients').select('id', { count: 'exact', head: true }),
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo),
  ])

  const all = companies ?? []

  /* ── KPIs ── */
  const totalRevenue   = all.reduce((s, c) => s + (c.total_paid ?? 0), 0)
  const activeCases    = all.filter(c => c.status !== 'completed').length
  const completedCases = all.filter(c => c.status === 'completed').length
  const actionNeeded   = all.filter(c => ['pending', 'on_hold', 'name_check'].includes(c.status ?? '')).length

  /* ── Recent 5 clients ── */
  const recent = all.slice(0, 5)

  /* ── Cases by status ── */
  const statusCounts: Record<string, number> = {}
  for (const c of all) {
    const s = c.status ?? 'unknown'
    statusCounts[s] = (statusCounts[s] ?? 0) + 1
  }
  const statusRows = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])
  const maxCount = Math.max(1, ...statusRows.map(([, n]) => n))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-slate-100 p-2 rounded-lg">
          <LayoutDashboard className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Vista general del negocio en tiempo real.</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard label="Total clientes"       value={totalClients ?? 0} />
        <KpiCard label="Revenue total"        value={`$${(totalRevenue / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`} sub="USD" />
        <KpiCard label="Casos activos"        value={activeCases} />
        <KpiCard label="Nuevos esta semana"   value={newThisWeek ?? 0} />
        <KpiCard label="Completados"          value={completedCases} />
        <KpiCard label="Pendientes de acción" value={actionNeeded} />
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent clients */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Últimos 5 clientes registrados</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recent.map(c => {
              const user = (c as any).clients?.users
              return (
                <a key={c.id} href={`/admin/clients/${c.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email ?? c.company_name}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <StatusBadge status={c.status} />
                    {c.package && (
                      <span className="hidden sm:inline text-xs text-gray-400 capitalize">
                        {PACKAGE_LABEL[c.package] ?? c.package}
                      </span>
                    )}
                    <span className="text-xs text-gray-300">{formatDate(c.created_at)}</span>
                  </div>
                </a>
              )
            })}
            {recent.length === 0 && (
              <p className="px-5 py-4 text-sm text-gray-400">No hay clientes aún.</p>
            )}
          </div>
        </div>

        {/* Cases by status */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Casos por status</h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            {statusRows.map(([status, count]) => {
              const group = STATUS_GROUPS.find(g => g.statuses.includes(status))
              const barColor = group?.color ?? 'bg-gray-300'
              const label = group?.label ?? status
              const pct = Math.round((count / maxCount) * 100)
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 font-medium">{label}</span>
                    <span className="text-gray-400 tabular-nums">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
            {statusRows.length === 0 && (
              <p className="text-sm text-gray-400">Sin datos.</p>
            )}
          </div>
          {/* Totals footer */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-between text-xs text-gray-500">
            <span>{all.length} casos en total</span>
            <span>{completedCases} completados ({all.length ? Math.round(completedCases / all.length * 100) : 0}%)</span>
          </div>
        </div>

      </div>
    </div>
  )
}
