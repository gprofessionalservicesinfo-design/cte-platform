import { redirect } from 'next/navigation'
import { createAdminServerClient } from "@/lib/supabase/server"
import { AdminSidebar } from '@/components/admin/sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createAdminServerClient()

  // LOCAL DEV ONLY — skip auth so CRM pages load without a session.
  const isLocalDev = process.env.NODE_ENV === 'development'

  if (!isLocalDev) {
    // Production: enforce session + admin role
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
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
      <div className={`lg:pl-64 ${isLocalDev ? 'pt-8' : ''}`}>
        <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  )
}
