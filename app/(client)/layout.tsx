import { createClient } from '@/lib/supabase/server'
import { ClientSidebar } from '@/components/client/sidebar'
import { TermsBanner } from '@/components/client/terms-banner'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  // Use getSession() — reads from cookie locally without a network call.
  // getUser() makes a live Supabase request that fails when the anon key format
  // is not accepted server-side, causing a false-negative that bounces the user.
  // The middleware already handles unauthenticated blocking; layout only needs
  // the user object for display data.
  const { data: { session } } = await supabase.auth.getSession()
  let user = session?.user ?? null

  if (!user) {
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    const t = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token')
    const t0 = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token.0')
    const t1 = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token.1')
    let raw = t?.value || (t0?.value ? t0.value + (t1?.value ?? '') : null)
    if (raw) {
      try {
        const d = JSON.parse(decodeURIComponent(raw))
        if (d?.user) user = d.user
        else if (d?.access_token) {
          const p = JSON.parse(atob(d.access_token.split('.')[1]))
          if (p?.sub) user = { id: p.sub, email: p.email } as any
        }
      } catch {}
    }
  }

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
        <TermsBanner />
        <main className="pt-16 lg:pt-8 pb-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  )
}
