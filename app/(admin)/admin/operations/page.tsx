import { createAdminServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Wrench } from 'lucide-react'

function StatusDot({ color }: { color: 'green' | 'yellow' | 'gray' | 'red' | 'blue' }) {
  const cls = {
    green:  'bg-green-500',
    yellow: 'bg-yellow-400',
    gray:   'bg-gray-300',
    red:    'bg-red-500',
    blue:   'bg-blue-500',
  }[color]
  return <span className={`inline-block w-2 h-2 rounded-full ${cls}`} />
}

function addrColor(s: string | null): 'green' | 'blue' | 'yellow' | 'red' | 'gray' {
  if (s === 'active')          return 'green'
  if (s === 'in_progress')     return 'blue'
  if (s === 'awaiting_client') return 'yellow'
  if (s === 'issue')           return 'red'
  return 'gray'
}

export default async function AdminOperationsPage() {
  const supabase = createAdminServerClient()

  const { data: companies, error } = await supabase
    .from('companies')
    .select(`
      id, company_name, state, status, ein,
      address_service_enabled, address_status,
      banking_setup_enabled,
      clients ( users ( full_name, email ) )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-slate-100 p-2 rounded-lg">
          <Wrench className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Operations Hub</h1>
          <p className="text-sm text-gray-500">Estado operacional de todos los clientes. Click en un cliente para ver su hub.</p>
        </div>
      </div>

      {error ? (
        <p className="text-red-500 text-sm">Error: {error.message}</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Estado</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Formation</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">EIN</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Address</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Banking</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(companies ?? []).map(row => {
                  const user = (row as any).clients?.users
                  const formationColor: 'green' | 'yellow' | 'gray' =
                    row.status === 'completed' ? 'green' :
                    row.status === 'active' || row.status === 'ein_obtained' ? 'blue' as any :
                    row.status === 'pending' || row.status === 'under_review' ? 'yellow' : 'gray'
                  return (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{user?.full_name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{row.company_name}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">{row.state ?? '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusDot color={formationColor as any} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusDot color={row.ein ? 'green' : 'gray'} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusDot color={
                          !(row as any).address_service_enabled ? 'gray' :
                          addrColor((row as any).address_status)
                        } />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusDot color={(row as any).banking_setup_enabled ? 'green' : 'gray'} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/clients/${row.id}`}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          Ver hub →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t bg-gray-50 flex gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><StatusDot color="green" /> Completado</span>
            <span className="flex items-center gap-1.5"><StatusDot color="blue" /> En proceso</span>
            <span className="flex items-center gap-1.5"><StatusDot color="yellow" /> Pendiente</span>
            <span className="flex items-center gap-1.5"><StatusDot color="gray" /> No iniciado</span>
            <span className="flex items-center gap-1.5"><StatusDot color="red" /> Problema</span>
          </div>
        </div>
      )}
    </div>
  )
}
