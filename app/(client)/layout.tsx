import { createClient } from '@/lib/supabase/server'
import { ClientSidebar } from '@/components/client/sidebar'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  // Use getSession() — reads from cookie locally without a network call.
  // getUser() makes a live Supabase request that fails when the anon key format
  // is not accepted server-side, causing a false-negative that bounces the user.
  // The middleware already handles unauthenticated blocking; layout only needs
  // the user object for display data.
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  // Fetch display data only when we have a user — degrade gracefully if not
  const [{ data: profile }, { data: company }] = user
    ? await Promise.all([
        supabase.from('users').select('full_name, email, role').eq('id', user.id).single(),
        supabase.from('companies').select('company_name').order('created_at').limit(1).maybeSingle(),
      ])
    : [{ data: null }, { data: null }]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* DASHBOARD ACCESS GRANTED */}
      <ClientSidebar
        companyName={company?.company_name}
        userEmail={profile?.email ?? user?.email}
      />
      <div className="lg:pl-64">
        <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  )
}
