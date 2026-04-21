import { createAdminServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  BarChart3, TrendingUp, Users, AlertTriangle, Clock,
  CheckCircle2, XCircle, MessageSquare, FileText,
  DollarSign, Building2, ArrowRight, Activity,
  ShieldAlert, Inbox,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/client/status-badge'

// ── Constants ─────────────────────────────────────────────────────────────────

const PLAN_NORMALIZED: Record<string, string> = {
  starter: 'Starter', basic: 'Starter',
  professional: 'Pro', growth: 'Pro',
  premium: 'Premium',
}

const STATUS_LABEL: Record<string, string> = {
  pending:        'Pendiente',
  name_check:     'Verificación nombre',
  articles_filed: 'Articles radicados',
  ein_processing: 'Procesando EIN',
  ein_obtained:   'EIN obtenido',
  in_progress:    'En proceso',
  under_review:   'En revisión',
  active:         'Activo',
  completed:      'Completado',
  on_hold:        'En espera',
}

const STATUS_COLOR: Record<string, string> = {
  pending:        'bg-yellow-400',
  name_check:     'bg-orange-400',
  articles_filed: 'bg-blue-400',
  ein_processing: 'bg-indigo-400',
  ein_obtained:   'bg-violet-500',
  in_progress:    'bg-blue-500',
  under_review:   'bg-orange-400',
  active:         'bg-[#4DB39A]',
  completed:      'bg-[#2CB98A]',
  on_hold:        'bg-gray-400',
}

const ISSUE_BADGE: Record<string, string> = {
  'Onboarding pendiente':      'bg-amber-100 text-amber-800 border-amber-200',
  'WhatsApp fallido':          'bg-red-100 text-red-800 border-red-200',
  'Doc esperando aprobación':  'bg-blue-100 text-blue-800 border-blue-200',
  'Caso bloqueado':            'bg-gray-100 text-gray-700 border-gray-200',
}

// ── UI Components ─────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, alert = false,
}: {
  label: string; value: string | number; sub?: string
  icon?: React.ElementType; alert?: boolean
}) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${alert ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
      {Icon && (
        <div className={`inline-flex p-2 rounded-xl mb-3 ${alert ? 'bg-red-100' : 'bg-[#4DB39A]/10'}`}>
          <Icon className={`h-4 w-4 ${alert ? 'text-red-500' : 'text-[#2CB98A]'}`} />
        </div>
      )}
      <p className="text-2xl font-bold text-[#2A3544] tabular-nums">{value}</p>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1 leading-tight">{label}</p>
      {sub && <p className="text-xs text-gray-300 mt-0.5">{sub}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold text-[#2A3544] uppercase tracking-widest mb-4 flex items-center gap-2">
      <span className="inline-block w-1 h-4 rounded-full bg-[#2CB98A]" />
      {children}
    </h2>
  )
}

function FunnelBar({
  label, count, total, color = 'bg-[#4DB39A]',
}: {
  label: string; count: number; total: number; color?: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center gap-2">
        <span className="text-sm text-gray-700 font-medium truncate">{label}</span>
        <span className="text-sm tabular-nums text-gray-500 flex-shrink-0">
          {count} <span className="text-gray-300 text-xs">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.max(pct, count > 0 ? 3 : 0)}%` }}
        />
      </div>
    </div>
  )
}

function CommStat({
  label, count, icon: Icon, variant = 'neutral',
}: {
  label: string; count: number; icon: React.ElementType
  variant?: 'success' | 'danger' | 'neutral'
}) {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-700',
    danger:  'bg-red-50 border-red-200 text-red-700',
    neutral: 'bg-gray-50 border-gray-200 text-gray-600',
  }
  const iconStyles = {
    success: 'text-green-500',
    danger:  'text-red-500',
    neutral: 'text-gray-400',
  }
  return (
    <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${styles[variant]}`}>
      <Icon className={`h-4 w-4 flex-shrink-0 ${iconStyles[variant]}`} />
      <div>
        <p className="text-xl font-bold tabular-nums">{count}</p>
        <p className="text-xs font-medium opacity-80">{label}</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CEODashboardPage() {
  const supabase = createAdminServerClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  // Three parallel queries cover everything
  const [{ data: allCompanies }, { data: documents }, { data: paymentsData }] = await Promise.all([
    supabase
      .from('companies')
      .select(`
        id, company_name, state, status, package, created_at,
        onboarding_completed, whatsapp_status, whatsapp_sent_at,
        clients ( id, users ( full_name, email ) )
      `)
      .order('created_at', { ascending: false }),
    supabase
      .from('documents')
      .select('id, company_id, type, approval_status, created_at'),
    supabase
      .from('payments')
      .select('id, company_id, amount_paid, created_at'),
  ])

  const all      = (allCompanies ?? []) as any[]
  const docs     = (documents    ?? []) as any[]
  const payments = (paymentsData ?? []) as any[]

  // ── Monthly slice ────────────────────────────────────────────────────────────
  const thisMonth = all.filter(c => c.created_at >= startOfMonth)

  // Shared lookup: company by id
  const companyById: Record<string, any> = {}
  for (const c of all) companyById[c.id] = c

  // ── Section 1: CEO KPIs ──────────────────────────────────────────────────────
  const revenueTotalCents = payments.reduce((s: number, p: any) => s + (p.amount_paid ?? 0), 0)
  const revenueMonthCents = payments
    .filter((p: any) => p.created_at >= startOfMonth)
    .reduce((s: number, p: any) => s + (p.amount_paid ?? 0), 0)
  const revenueDisplay      = `$${(revenueTotalCents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  const revenueMonthDisplay = `$${(revenueMonthCents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })} este mes`
  const newClients      = thisMonth.length
  const activeCases     = all.filter(c => c.status !== 'completed').length
  const blockedCases    = all.filter(c => c.status === 'on_hold').length
  const pendingOnboard  = all.filter(c => !c.onboarding_completed).length
  const failedWA        = all.filter(c => c.whatsapp_status === 'failed').length
  const approvedDocsMo  = docs.filter(d =>
    d.approval_status === 'approved' && d.created_at >= startOfMonth
  ).length

  // Revenue by plan this month (from payments table, joined to company for plan)
  const revByPlan: Record<string, number> = {}
  for (const p of payments.filter((p: any) => p.created_at >= startOfMonth)) {
    const company = companyById[p.company_id]
    const plan = PLAN_NORMALIZED[company?.package ?? ''] ?? 'Otro'
    revByPlan[plan] = (revByPlan[plan] ?? 0) + (p.amount_paid ?? 0)
  }

  // ── Section 2: Sales Funnel ──────────────────────────────────────────────────
  const total = all.length

  // By status (sorted by frequency)
  const statusMap: Record<string, number> = {}
  for (const c of all) {
    const s = c.status ?? 'unknown'
    statusMap[s] = (statusMap[s] ?? 0) + 1
  }
  const statusEntries = Object.entries(statusMap).sort((a, b) => b[1] - a[1])

  // By plan (normalized)
  const planMap: Record<string, number> = { Starter: 0, Pro: 0, Premium: 0, Otro: 0 }
  for (const c of all) {
    const norm = PLAN_NORMALIZED[c.package ?? ''] ?? 'Otro'
    planMap[norm] = (planMap[norm] ?? 0) + 1
  }

  // By state
  const TARGET_STATES = ['WY', 'FL', 'DE', 'NM', 'CO', 'TX']
  const stateMap: Record<string, number> = { WY: 0, FL: 0, DE: 0, NM: 0, CO: 0, TX: 0, Otros: 0 }
  for (const c of all) {
    const st = (c.state ?? '').toUpperCase().replace(/\bwyoming\b/i, 'WY').slice(0, 2).toUpperCase()
    if (TARGET_STATES.includes(st)) stateMap[st] = (stateMap[st] ?? 0) + 1
    else stateMap['Otros'] = (stateMap['Otros'] ?? 0) + 1
  }
  const stateEntries = Object.entries(stateMap).sort((a, b) => b[1] - a[1])

  // ── Section 3: Operations Queue ───────────────────────────────────────────────
  type QueueItem = {
    id: string; name: string; email: string
    issue: string; daysAgo: number; status: string
  }
  const queueMap = new Map<string, QueueItem>()

  function addToQueue(c: any, issue: string) {
    const key = `${c.id}::${issue}`
    if (!queueMap.has(key)) {
      const user = c.clients?.users
      queueMap.set(key, {
        id:      c.id,
        name:    c.company_name ?? '—',
        email:   user?.email ?? '—',
        issue,
        daysAgo: Math.floor((Date.now() - new Date(c.created_at).getTime()) / 86_400_000),
        status:  c.status ?? '',
      })
    }
  }

  for (const c of all) {
    if (!c.onboarding_completed)        addToQueue(c, 'Onboarding pendiente')
    if (c.whatsapp_status === 'failed') addToQueue(c, 'WhatsApp fallido')
    if (c.status === 'on_hold')         addToQueue(c, 'Caso bloqueado')
  }
  for (const doc of docs.filter((d: any) => d.approval_status === 'pending_approval')) {
    const c = companyById[doc.company_id]
    if (c) addToQueue(c, 'Doc esperando aprobación')
  }

  const queue = Array.from(queueMap.values())
    .sort((a, b) => b.daysAgo - a.daysAgo)
    .slice(0, 25)

  // ── Section 4: Recent Activity ────────────────────────────────────────────────
  const recent10 = all.slice(0, 10)

  // ── Section 5: Communications Health ─────────────────────────────────────────
  const waSentAll    = all.filter(c => c.whatsapp_status === 'sent').length
  const waFailedAll  = all.filter(c => c.whatsapp_status === 'failed').length
  const waPending    = all.filter(c => !c.whatsapp_status || c.whatsapp_status === 'pending').length
  const waSentMo     = thisMonth.filter(c => c.whatsapp_status === 'sent').length
  const waFailedMo   = thisMonth.filter(c => c.whatsapp_status === 'failed').length
  const pendingDocsN = docs.filter((d: any) => d.approval_status === 'pending_approval').length

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-10 pb-12">

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <div className="bg-[#2CB98A]/10 p-3 rounded-2xl">
          <BarChart3 className="h-6 w-6 text-[#2CB98A]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#2A3544]">CEO Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Vista ejecutiva en tiempo real ·{' '}
            {now.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — CEO SNAPSHOT
          ══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionTitle>Snapshot del mes</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            label="Revenue total"
            value={revenueDisplay}
            sub={revenueMonthDisplay}
            icon={DollarSign}
          />
          <KpiCard
            label="Nuevos clientes"
            value={newClients}
            sub="este mes"
            icon={Users}
          />
          <KpiCard
            label="Casos activos"
            value={activeCases}
            sub="en proceso"
            icon={Activity}
          />
          <KpiCard
            label="Docs aprobados"
            value={approvedDocsMo}
            sub="este mes"
            icon={CheckCircle2}
          />
        </div>

        {/* Alert row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <KpiCard
            label="Onboardings pendientes"
            value={pendingOnboard}
            icon={Clock}
            alert={pendingOnboard > 0}
          />
          <KpiCard
            label="Casos bloqueados"
            value={blockedCases}
            icon={ShieldAlert}
            alert={blockedCases > 0}
          />
          <KpiCard
            label="WhatsApps fallidos"
            value={failedWA}
            icon={XCircle}
            alert={failedWA > 0}
          />
          <KpiCard
            label="Docs esperando aprobación"
            value={pendingDocsN}
            icon={FileText}
            alert={pendingDocsN > 0}
          />
        </div>

        {/* Revenue by plan */}
        {Object.keys(revByPlan).length > 0 && (
          <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Revenue por plan — este mes</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(revByPlan).map(([plan, cents]) => (
                <div key={plan} className="flex items-center gap-2 bg-[#4DB39A]/5 border border-[#4DB39A]/20 rounded-xl px-4 py-2.5">
                  <span className="text-xs font-semibold text-gray-500">{plan}</span>
                  <span className="text-base font-bold text-[#2A3544]">
                    ${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — SALES FUNNEL
          ══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionTitle>Sales Funnel — {total} empresas en total</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* By status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Por status</p>
            {statusEntries.map(([status, count]) => (
              <FunnelBar
                key={status}
                label={STATUS_LABEL[status] ?? status}
                count={count}
                total={total}
                color={STATUS_COLOR[status] ?? 'bg-gray-300'}
              />
            ))}
            {statusEntries.length === 0 && <p className="text-sm text-gray-400">Sin datos</p>}
          </div>

          {/* By plan */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Por plan</p>
            <FunnelBar label="Starter" count={planMap.Starter} total={total} color="bg-slate-400" />
            <FunnelBar label="Pro"     count={planMap.Pro}     total={total} color="bg-[#4DB39A]" />
            <FunnelBar label="Premium" count={planMap.Premium} total={total} color="bg-[#2CB98A]" />
            {planMap.Otro > 0 && (
              <FunnelBar label="Otro" count={planMap.Otro} total={total} color="bg-gray-200" />
            )}
          </div>

          {/* By state */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Por estado</p>
            {stateEntries.filter(([, n]) => n > 0).map(([state, count]) => (
              <FunnelBar
                key={state}
                label={state}
                count={count}
                total={total}
                color={state === 'WY' ? 'bg-blue-500' : state === 'FL' ? 'bg-orange-400' : state === 'DE' ? 'bg-indigo-500' : state === 'NM' ? 'bg-violet-400' : state === 'CO' ? 'bg-cyan-500' : state === 'TX' ? 'bg-red-400' : 'bg-gray-300'}
              />
            ))}
            {stateEntries.every(([, n]) => n === 0) && <p className="text-sm text-gray-400">Sin datos</p>}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — OPERATIONS QUEUE
          ══════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Cola de operaciones</SectionTitle>
          {queue.length > 0 && (
            <span className="text-xs text-white bg-red-500 font-bold px-2.5 py-1 rounded-full -mt-4">
              {queue.length} items
            </span>
          )}
        </div>

        {queue.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <CheckCircle2 className="h-8 w-8 text-[#2CB98A] mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-600">Todo al día — sin items pendientes</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Empresa</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Problema</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Días</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {queue.map((item) => (
                    <tr key={`${item.id}-${item.issue}`} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 truncate max-w-[160px]">{item.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-500 truncate max-w-[180px]">{item.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${ISSUE_BADGE[item.issue] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {item.issue}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-semibold tabular-nums ${item.daysAgo > 7 ? 'text-red-500' : item.daysAgo > 3 ? 'text-amber-500' : 'text-gray-400'}`}>
                          {item.daysAgo}d
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/clients/${item.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2CB98A] hover:text-[#24a87c] transition-colors"
                        >
                          Ver <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {queue.length >= 25 && (
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60">
                <Link href="/admin/clients" className="text-xs text-[#2CB98A] font-semibold hover:underline">
                  Ver todos los clientes →
                </Link>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — RECENT ACTIVITY
          ══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionTitle>Actividad reciente — últimas 10 empresas</SectionTitle>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Empresa</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Estado</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Creado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent10.map((c: any) => {
                  const user = c.clients?.users
                  const plan = PLAN_NORMALIZED[c.package ?? ''] ?? (c.package ?? '—')
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 truncate max-w-[160px]">{c.company_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-gray-700 truncate max-w-[160px]">{user?.full_name ?? '—'}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[160px]">{user?.email ?? '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          plan === 'Premium' ? 'bg-violet-100 text-violet-700' :
                          plan === 'Pro'     ? 'bg-[#4DB39A]/10 text-[#2CB98A]' :
                                              'bg-gray-100 text-gray-600'
                        }`}>
                          {plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.state ?? '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(c.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/clients/${c.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#2CB98A] hover:text-[#24a87c] transition-colors"
                        >
                          Ver <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {recent10.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                      Sin actividad reciente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60">
            <Link href="/admin/clients" className="text-xs text-[#2CB98A] font-semibold hover:underline">
              Ver todos los clientes →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5 — COMMUNICATIONS HEALTH
          ══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionTitle>Salud de comunicaciones</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* WhatsApp */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5" /> WhatsApp bienvenida
            </p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <CommStat label="Enviados (total)" count={waSentAll}   icon={CheckCircle2} variant="success" />
              <CommStat label="Fallidos (total)" count={waFailedAll}  icon={XCircle}      variant={waFailedAll > 0 ? 'danger' : 'neutral'} />
              <CommStat label="Pendientes"       count={waPending}    icon={Clock}        variant="neutral" />
            </div>
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs text-gray-400">Este mes: <span className="font-semibold text-gray-700">{waSentMo} enviados</span>, <span className={`font-semibold ${waFailedMo > 0 ? 'text-red-500' : 'text-gray-700'}`}>{waFailedMo} fallidos</span></p>
                {waFailedAll > 0 && (
                  <p className="text-xs text-red-500 font-medium">
                    {waFailedAll} mensaje(s) requieren reenvío manual
                  </p>
                )}
              </div>
              <Link href="/admin/whatsapp" className="text-xs font-semibold text-[#2CB98A] hover:underline">
                Ver bandeja →
              </Link>
            </div>
          </div>

          {/* Email + Documents */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" /> Documentos + correos
            </p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <CommStat label="Aprobados este mes" count={approvedDocsMo}  icon={CheckCircle2} variant="success" />
              <CommStat label="Esperando aprobación" count={pendingDocsN}  icon={Clock}        variant={pendingDocsN > 0 ? 'danger' : 'neutral'} />
              <CommStat label="Total documentos"    count={docs.length}    icon={FileText}     variant="neutral" />
            </div>
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {all.length} correos de bienvenida enviados en total
              </p>
              <Link href="/admin/documents" className="text-xs font-semibold text-[#2CB98A] hover:underline">
                Ver documentos →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
