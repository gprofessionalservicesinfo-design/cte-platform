import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/client/status-badge'
import { StatusTimeline } from '@/components/client/status-timeline'
import { Building2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function CompanyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // RLS (owns_company via current_client_id) filters to current client automatically
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .order('created_at')
    .limit(1)
    .maybeSingle()

  if (!company) {
    return (
      <div className="text-center py-20">
        <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700">No company found</h2>
        <p className="text-gray-500 text-sm mt-1">Contact support to get your company set up.</p>
      </div>
    )
  }

  const fields = [
    { label: 'Company Name',       value: company.company_name },
    { label: 'Entity Type',        value: company.entity_type },
    { label: 'State of Formation', value: company.state },
    { label: 'Registered Agent',   value: company.registered_agent },
    { label: 'Formation Date',     value: company.formation_date ? formatDate(company.formation_date) : 'Pending' },
    { label: 'EIN (Tax ID)',        value: company.ein ?? 'Pending assignment' },
    { label: 'Order Reference',    value: company.order_reference ?? '—' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Details</h1>
        <p className="text-gray-500 mt-1">Your LLC information and formation status.</p>
      </div>

      <Card>
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{company.company_name}</CardTitle>
          <StatusBadge status={company.status} />
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-gray-100">
            {fields.map((field) => (
              <div key={field.label} className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-medium">
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Formation Progress</CardTitle>
        </CardHeader>
        <CardContent className="pb-8">
          <StatusTimeline currentStatus={company.status} />
        </CardContent>
      </Card>
    </div>
  )
}
