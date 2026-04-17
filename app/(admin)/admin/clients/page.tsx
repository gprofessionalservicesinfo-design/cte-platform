import { createAdminServerClient } from "@/lib/supabase/server"
import { ClientTable } from '@/components/admin/client-table'
import { Users } from 'lucide-react'

export default async function AdminClientsPage() {
  const supabase = createAdminServerClient()

  // Join: companies → clients → users
  const { data: companies, error } = await supabase
    .from('companies')
    .select(`
      id,
      company_name,
      state,
      status,
      package,
      ein,
      order_reference,
      created_at,
      stripe_customer_id,
      onboarding_completed,
      clients (
        user_id,
        phone,
        country,
        users (
          full_name,
          email
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">Error loading clients: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">
            {companies?.length ?? 0} total company formations
          </p>
        </div>
        <div className="bg-blue-50 p-2.5 rounded-lg">
          <Users className="h-5 w-5 text-blue-600" />
        </div>
      </div>

      {/* CRM ADMIN READY marker */}
      <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-2 rounded-md text-xs font-bold tracking-widest text-center uppercase">
        CRM ADMIN READY
      </div>

      <ClientTable clients={(companies as any) ?? []} />
    </div>
  )
}
