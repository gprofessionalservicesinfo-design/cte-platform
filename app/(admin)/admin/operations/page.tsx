import { createAdminServerClient } from '@/lib/supabase/server'
import { OpsQueueTable } from '@/components/admin/ops-queue-table'
import { LayoutList, CheckCircle2, AlertTriangle, Clock, XCircle, MessageCircle } from 'lucide-react'

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default async function AdminOperationsPage() {
  const supabase = createAdminServerClient()

  const { data: companies, error } = await supabase
    .from('companies')
    .select(`
      id, company_name, state, package, status, ein,
      order_status, work_queue_status, customer_handoff_status, next_action, case_owner,
      whatsapp_status, created_at,
      clients ( users ( full_name, email ) )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-sm">Error: {error.message}</p>
      </div>
    )
  }

  const all = (companies ?? []) as any[]

  // KPIs
  const total        = all.length
  const needsStart   = all.filter(c => (c.work_queue_status === 'new' || !c.work_queue_status) && c.status !== 'completed').length
  const blocked      = all.filter(c => c.work_queue_status === 'blocked').length
  const noNextAction = all.filter(c => !c.next_action && c.work_queue_status !== 'done').length
  const completed    = all.filter(c => c.work_queue_status === 'done' || c.status === 'completed').length
  const waFailed     = all.filter(c => c.whatsapp_status === 'failed').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-slate-100 p-2 rounded-lg">
          <LayoutList className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Operations Queue</h1>
          <p className="text-sm text-gray-500">Cola de trabajo operacional. Edita el siguiente paso directamente en la tabla.</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard label="Casos activos"    value={total - completed}   icon={Clock}           color="bg-blue-500" />
        <KpiCard label="Sin iniciar"      value={needsStart}          icon={AlertTriangle}   color="bg-amber-500" />
        <KpiCard label="Bloqueados"       value={blocked}             icon={XCircle}         color="bg-red-500" />
        <KpiCard label="Completados"      value={completed}           icon={CheckCircle2}    color="bg-green-500" />
        <KpiCard label="WA fallidos"      value={waFailed}            icon={MessageCircle}   color="bg-rose-500" />
      </div>

      {/* Missing next action notice */}
      {noNextAction > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
          <strong>{noNextAction}</strong> {noNextAction === 1 ? 'caso no tiene' : 'casos no tienen'} siguiente paso definido.
          Haz click en el campo <em>Siguiente paso</em> en la tabla para editarlo directamente.
        </div>
      )}

      {/* Queue table */}
      <OpsQueueTable rows={all} />
    </div>
  )
}
