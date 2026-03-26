import { createAdminServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/client/status-badge'
import { STATUS_LABELS } from '@/lib/utils'

const STATUSES = ['name_check', 'articles_filed', 'ein_processing', 'completed', 'on_hold']

export default async function AdminStatusPage() {
  const supabase = createAdminServerClient()

  const { data: companies } = await supabase
    .from('companies')
    .select('id, company_name, status, created_at')
    .order('created_at', { ascending: false })

  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = companies?.filter((c) => c.status === s).length ?? 0
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Formation Status Overview</h1>
        <p className="text-gray-500 mt-1">Pipeline view of all company formations.</p>
      </div>

      {/* CLIENT TIMELINE READY marker */}
      <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-2 rounded-md text-xs font-bold tracking-widest text-center uppercase">
        CLIENT TIMELINE READY
      </div>

      {/* Status counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATUSES.map((status) => (
          <Card key={status}>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-gray-900">{counts[status]}</p>
              <StatusBadge status={status} className="mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Companies by status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATUSES.map((status) => {
          const statusCompanies = companies?.filter((c) => c.status === status) ?? []
          return (
            <Card key={status} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-600">
                  {STATUS_LABELS[status]}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                {statusCompanies.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No companies</p>
                ) : (
                  <ul className="space-y-2">
                    {statusCompanies.map((c) => (
                      <li key={c.id}>
                        <a
                          href={`/admin/clients/${c.id}`}
                          className="text-sm text-gray-700 hover:text-primary hover:underline block truncate"
                        >
                          {c.company_name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
