import { redirect } from 'next/navigation'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { AlertTriangle, CheckCircle2, Clock, ShieldCheck, MessageCircle, ExternalLink, Info, CalendarClock } from 'lucide-react'
import { RENEWAL_TYPE_LABELS } from '@/lib/renewals/state-obligations'

// ── Auth helper ──────────────────────────────────────────────────
function getUserFromCookies() {
  const cookieStore = cookies()
  const t  = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token')
  const t0 = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token.0')
  const t1 = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token.1')
  const raw = t?.value || (t0?.value ? t0.value + (t1?.value ?? '') : null)
  if (!raw) return null
  try {
    const d = JSON.parse(decodeURIComponent(raw))
    if (d?.user) return d.user
    if (d?.access_token) {
      const p = JSON.parse(Buffer.from(d.access_token.split('.')[1], 'base64').toString())
      if (p?.sub) return { id: p.sub, email: p.email }
    }
  } catch {}
  return null
}

// ── Helpers ────────────────────────────────────────────────────────
function daysUntil(dateStr: string): number {
  const due   = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86400000)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  })
}

function formatCents(cents: number) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

type StatusKey = 'upcoming' | 'due_soon' | 'overdue' | 'paid' | 'waived' | 'not_applicable'

const STATUS_CONFIG: Record<StatusKey, {
  label: string; badgeClass: string; icon: React.FC<any>; iconClass: string
}> = {
  upcoming:       { label: 'Próximamente',  badgeClass: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',   icon: CalendarClock, iconClass: 'text-blue-500' },
  due_soon:       { label: 'Vence Pronto',  badgeClass: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', icon: Clock,         iconClass: 'text-amber-500' },
  overdue:        { label: 'Vencida',       badgeClass: 'bg-red-50 text-red-700 ring-1 ring-red-200',       icon: AlertTriangle, iconClass: 'text-red-500' },
  paid:           { label: 'Pagada',        badgeClass: 'bg-green-50 text-green-700 ring-1 ring-green-200', icon: CheckCircle2,  iconClass: 'text-green-500' },
  waived:         { label: 'Exenta',        badgeClass: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200',    icon: CheckCircle2,  iconClass: 'text-gray-400' },
  not_applicable: { label: 'No Aplica',     badgeClass: 'bg-gray-50 text-gray-500 ring-1 ring-gray-200',    icon: Info,          iconClass: 'text-gray-400' },
}

// ── Page ───────────────────────────────────────────────────────────
export default async function RenovacionesPage() {
  const user = getUserFromCookies()
  if (!user) redirect('/login')

  const db = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: clientRow } = await db.from('clients').select('id').eq('user_id', user.id).single()
  if (!clientRow) redirect('/dashboard')

  const { data: company } = await db
    .from('companies')
    .select('id, company_name, state, entity_type, formation_date, package')
    .eq('client_id', clientRow.id)
    .order('created_at')
    .limit(1)
    .maybeSingle()

  const { data: renewals } = company
    ? await db
        .from('renewals')
        .select('*')
        .eq('company_id', company.id)
        .order('due_date', { ascending: true })
    : { data: [] }

  const allRenewals = (renewals ?? []) as any[]

  // Partition into active vs paid/waived
  const active = allRenewals.filter(r => !['paid', 'waived', 'not_applicable'].includes(r.status))
  const completed = allRenewals.filter(r => ['paid', 'waived', 'not_applicable'].includes(r.status))
  const hasOverdue = active.some(r => r.status === 'overdue')
  const hasDueSoon = active.some(r => r.status === 'due_soon')
  const hasCompliancePlan = company?.package === 'premium' || company?.package === 'growth'

  const WA_URL = `https://wa.me/19046248859?text=${encodeURIComponent('Hola, tengo preguntas sobre las renovaciones de mi empresa.')}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Renovaciones y Cumplimiento</h1>
        <p className="mt-1 text-sm text-gray-500">
          {company?.company_name
            ? `Obligaciones activas para ${company.company_name} · ${company.state}`
            : 'Mantén tu empresa al día con todas sus obligaciones legales'}
        </p>
      </div>

      {/* Alert banner */}
      {hasOverdue && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Tienes obligaciones vencidas</p>
            <p className="text-sm text-red-700 mt-0.5">Actúa de inmediato para evitar penalidades o la pérdida del estatus activo de tu empresa.</p>
          </div>
          <a href={WA_URL} target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors">
            Hablar con un agente
          </a>
        </div>
      )}

      {!hasOverdue && hasDueSoon && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Clock className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Algunas obligaciones vencen pronto</p>
            <p className="text-sm text-amber-700 mt-0.5">Revisa las fechas y renueva con tiempo para evitar cargos por mora.</p>
          </div>
        </div>
      )}

      {/* No renewals state */}
      {allRenewals.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <CalendarClock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-base font-semibold text-gray-700 mb-1">Sin obligaciones registradas aún</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">Tu plan de cumplimiento aparecerá aquí una vez que tu empresa esté formada.</p>
          <a href={WA_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-white bg-[#25D366] hover:bg-[#1eba57] px-5 py-2.5 rounded-lg transition-colors">
            <MessageCircle className="h-4 w-4" /> Preguntar por WhatsApp
          </a>
        </div>
      )}

      {/* Active obligations */}
      {active.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Obligaciones activas
          </h2>
          <div className="space-y-3">
            {active.map((renewal: any) => (
              <RenewalCard key={renewal.id} renewal={renewal} waUrl={WA_URL} />
            ))}
          </div>
        </div>
      )}

      {/* Compliance Plan Upsell */}
      {!hasCompliancePlan && active.length > 0 && (
        <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 p-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-indigo-900 mb-1">Plan de Cumplimiento — Gestión automática de renovaciones</h3>
              <p className="text-sm text-indigo-700 mb-3">
                Con el Plan de Cumplimiento, gestionamos automáticamente todas tus renovaciones: recordatorios en tiempo, presentación de reportes, y soporte prioritario para que nunca pierdas una fecha límite.
              </p>
              <ul className="text-sm text-indigo-700 space-y-1 mb-4">
                {[
                  'Recordatorios automáticos por email y WhatsApp',
                  'Seguimiento de reportes anuales estatales',
                  'Visibilidad completa en tu dashboard',
                  'Soporte prioritario con un especialista',
                  'Menos riesgo de penalidades o disolución',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors">
                <MessageCircle className="h-4 w-4" /> Activar Plan de Cumplimiento
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Completed obligations */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Historial
          </h2>
          <div className="space-y-2">
            {completed.map((renewal: any) => (
              <RenewalCardCompact key={renewal.id} renewal={renewal} />
            ))}
          </div>
        </div>
      )}

      {/* Footer help */}
      <div className="rounded-xl bg-gray-50 border border-gray-100 p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-700">¿Tienes preguntas sobre una renovación?</p>
          <p className="text-xs text-gray-500 mt-0.5">Nuestro equipo está disponible por WhatsApp o email.</p>
        </div>
        <a href={WA_URL} target="_blank" rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#25D366] hover:bg-[#1eba57] px-4 py-2.5 rounded-lg transition-colors">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      </div>
    </div>
  )
}

// ── Renewal Card (active) ──────────────────────────────────────────
function RenewalCard({ renewal, waUrl }: { renewal: any; waUrl: string }) {
  const days     = daysUntil(renewal.due_date)
  const statusKey = (renewal.status as StatusKey) || 'upcoming'
  const cfg      = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.upcoming
  const typeInfo = RENEWAL_TYPE_LABELS[renewal.type] ?? { label: renewal.type, icon: '📋' }
  const StatusIcon = cfg.icon

  const urgencyBorder = statusKey === 'overdue' ? 'border-red-200' : statusKey === 'due_soon' ? 'border-amber-200' : 'border-gray-100'

  return (
    <div className={`bg-white rounded-xl border ${urgencyBorder} p-5 shadow-sm`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className="flex-shrink-0 w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center text-lg">
            {typeInfo.icon}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-900">{renewal.label}</p>
              {renewal.is_required && (
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Requerido</span>
              )}
              {renewal.compliance_plan_covers && (
                <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Plan incluido
                </span>
              )}
            </div>
            {renewal.description && (
              <p className="text-xs text-gray-500 mb-2 leading-relaxed">{renewal.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3.5 w-3.5" />
                {formatDate(renewal.due_date)}
                {days >= 0 && days <= 365
                  ? <span className={`ml-1 font-semibold ${days <= 7 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-gray-600'}`}>
                      ({days === 0 ? 'Hoy' : `en ${days} días`})
                    </span>
                  : days < 0
                  ? <span className="ml-1 font-semibold text-red-600">({Math.abs(days)} días vencida)</span>
                  : null}
              </span>
              {renewal.estimated_cost_cents > 0 && (
                <span className="font-medium text-gray-700">
                  {formatCents(renewal.estimated_cost_cents)} estimado
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badgeClass}`}>
            <StatusIcon className={`h-3.5 w-3.5 ${cfg.iconClass}`} />
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Actions */}
      {statusKey !== 'paid' && statusKey !== 'waived' && statusKey !== 'not_applicable' && (
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3">
          {renewal.stripe_payment_link ? (
            <a
              href={renewal.stripe_payment_link}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#0A2540] hover:bg-[#0d2f52] px-4 py-2 rounded-lg transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Renovar ahora
            </a>
          ) : (
            <a
              href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#0A2540] hover:bg-[#0d2f52] px-4 py-2 rounded-lg transition-colors"
            >
              Renovar ahora
            </a>
          )}
          <a
            href={waUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" /> Hablar con un agente
          </a>
        </div>
      )}
    </div>
  )
}

// ── Renewal Card (compact / completed) ────────────────────────────
function RenewalCardCompact({ renewal }: { renewal: any }) {
  const statusKey = (renewal.status as StatusKey) || 'paid'
  const cfg      = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.paid
  const typeInfo = RENEWAL_TYPE_LABELS[renewal.type] ?? { label: renewal.type, icon: '📋' }
  const StatusIcon = cfg.icon

  return (
    <div className="bg-white rounded-lg border border-gray-100 px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-base flex-shrink-0">{typeInfo.icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">{renewal.label}</p>
          <p className="text-xs text-gray-400">{formatDate(renewal.due_date)}</p>
        </div>
      </div>
      <span className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badgeClass}`}>
        <StatusIcon className={`h-3.5 w-3.5 ${cfg.iconClass}`} />
        {cfg.label}
      </span>
    </div>
  )
}
