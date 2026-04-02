import { createAdminServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Mail } from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  not_purchased:   { label: 'No contratado',    className: 'bg-gray-100 text-gray-500' },
  pending:         { label: 'Pendiente',         className: 'bg-gray-100 text-gray-600' },
  in_progress:     { label: 'En proceso',        className: 'bg-blue-100 text-blue-700' },
  awaiting_client: { label: 'Esperando cliente', className: 'bg-yellow-100 text-yellow-700' },
  active:          { label: 'Activo',            className: 'bg-green-100 text-green-700' },
  issue:           { label: 'Problema',          className: 'bg-red-100 text-red-700' },
}

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function AdminAddressesPage({
  searchParams,
}: {
  searchParams: { status?: string; plan?: string }
}) {
  const supabase = createAdminServerClient()

  let query = supabase
    .from('companies')
    .select(`
      id,
      company_name,
      address_status,
      address_provider,
      address_plan_type,
      address_service_type,
      address_renewal_date,
      address_created_at,
      clients (
        users ( full_name, email )
      )
    `)
    .eq('address_service_enabled', true)
    .order('address_created_at', { ascending: false })

  if (searchParams.status) {
    query = query.eq('address_status', searchParams.status)
  }
  if (searchParams.plan) {
    query = query.eq('address_plan_type', searchParams.plan)
  }

  const { data: rows, error } = await query

  const statuses = ['pending', 'in_progress', 'awaiting_client', 'active', 'issue']
  const plans    = ['standard', 'vip']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Mail className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Business Addresses</h1>
          <p className="text-sm text-gray-500">{rows?.length ?? 0} clientes con dirección habilitada</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/addresses"
          className={`text-xs px-3 py-1.5 rounded-full border font-medium ${!searchParams.status && !searchParams.plan ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
        >
          Todos
        </Link>
        {statuses.map(s => {
          const cfg = STATUS_LABELS[s]
          const active = searchParams.status === s
          return (
            <Link
              key={s}
              href={`/admin/addresses?status=${s}${searchParams.plan ? '&plan=' + searchParams.plan : ''}`}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
            >
              {cfg?.label ?? s}
            </Link>
          )
        })}
        <span className="text-gray-300 self-center">|</span>
        {plans.map(p => {
          const active = searchParams.plan === p
          return (
            <Link
              key={p}
              href={`/admin/addresses?plan=${p}${searchParams.status ? '&status=' + searchParams.status : ''}`}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium capitalize transition-colors ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
            >
              {p}
            </Link>
          )
        })}
      </div>

      {/* Table */}
      {error ? (
        <p className="text-red-500 text-sm">Error: {error.message}</p>
      ) : !rows?.length ? (
        <div className="text-center py-20 text-gray-400 text-sm">No hay registros con los filtros seleccionados.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Plan</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Provider</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Renovación</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Creado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map(row => {
                  const client = (row as any).clients
                  const user   = client?.users
                  const statusKey = (row.address_status ?? 'not_purchased') as string
                  const cfg = STATUS_LABELS[statusKey] ?? STATUS_LABELS.not_purchased
                  const plan = row.address_plan_type ?? (row as any).address_service_type ?? '—'
                  return (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{user?.full_name ?? row.company_name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{user?.email ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700 capitalize">{plan}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{row.address_provider ?? 'VPM'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmt(row.address_renewal_date ?? null)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{fmt((row as any).address_created_at ?? null)}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/clients/${row.id}`}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          Ver expediente →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
