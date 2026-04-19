import { redirect } from 'next/navigation'
import { createAdminServerClient } from "@/lib/supabase/server"
import { AdminSidebar } from '@/components/admin/sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createAdminServerClient()

  // LOCAL DEV ONLY — skip auth so CRM pages load without a session.
  const isLocalDev = process.env.NODE_ENV === 'development'

  if (!isLocalDev) {
    // Production: read session from cookie directly
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    let user: any = null
    const t = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token')
    const t0 = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token.0')
    const t1 = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token.1')
    let raw = t?.value || (t0?.value ? t0.value + (t1?.value ?? '') : null)
    if (raw) {
      try {
        const d = JSON.parse(decodeURIComponent(raw))
        if (d?.user) user = d.user
        else if (d?.access_token) {
          const p = JSON.parse(Buffer.from(d.access_token.split('.')[1], 'base64').toString())
          if (p?.sub) user = { id: p.sub, email: p.email }
        }
      } catch {}
    }
    if (!user) redirect('/login')
    const { data: profile } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') redirect('/dashboard')
  }

  // In dev: render without an authenticated user context
  const devEmail = isLocalDev ? 'dev@local' : undefined

  return (
    <div className="min-h-screen bg-gray-50">
      {/* DEV ADMIN PREVIEW MODE banner — only shown in local dev */}
      {isLocalDev && (
        <div className="bg-amber-400 text-amber-900 text-xs font-bold tracking-widest text-center py-2 px-4 uppercase sticky top-0 z-50 shadow">
          ⚠ DEV ADMIN PREVIEW MODE — Auth bypassed — Not visible in production
        </div>
      )}
      <AdminSidebar userEmail={devEmail} />
      <div className="lg:pl-64">
        {isLocalDev && <div className="pt-8" />}
        <main className="pt-16 lg:pt-8 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  )
}
