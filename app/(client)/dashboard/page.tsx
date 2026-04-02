import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/client/status-badge'
import { StatusTimeline } from '@/components/client/status-timeline'
import { FileText, Mail, Building2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  // Read user from cookie directly (legacy anon key workaround)
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
  console.log('[dashboard] user:', user?.id, user?.email)

  const db = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await db.from('users').select('full_name').eq('id', user.id).single()
  const { data: clientRow } = await db.from('clients').select('id').eq('user_id', user.id).single()

  if (!clientRow?.id) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Tu caso esta siendo configurado</h2>
        <p className="text-gray-500 mb-6">Tu empresa aparecera aqui en breve. Contactanos si tienes dudas.</p>
        <a href="https://wa.me/19046248859" target="_blank" className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-medium">WhatsApp</a>
      </div>
    )
  }

  const { data: company } = await db.from('companies').select('*').eq('client_id', clientRow.id).order('created_at').limit(1).maybeSingle()

  if (!company) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Tu empresa esta siendo configurada</h2>
        <p className="text-gray-500">Aparecera aqui en breve.</p>
      </div>
    )
  }

  const [{ count: docCount }, { count: unreadMailCount }] = await Promise.all([
    db.from('documents').select('*', { count: 'exact', head: true }).eq('company_id', company.id),
    db.from('mail_items').select('*', { count: 'exact', head: true }).eq('company_id', company.id).eq('is_read', false),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Cliente'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {firstName}</h1>
        <p className="text-gray-500 mt-1">Aqui esta el resumen de tu formacion de LLC.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{company.company_name}</CardTitle>
              <p className="text-gray-500 text-sm mt-1">Estado de formacion: {company.state}</p>
              <p className="text-gray-500 text-sm">Paquete: <span className="capitalize font-medium text-gray-700">{company.package}</span></p>
              {company.order_reference && <p className="text-gray-400 text-xs mt-1">Orden: {company.order_reference}</p>}
            </div>
            <StatusBadge status={company.status} />
          </div>
        </CardHeader>
        <CardContent>
          {company.formation_date && (
            <p className="text-sm text-gray-500 mb-6">Fecha de formacion: {formatDate(company.formation_date)}</p>
          )}
          <div className="pt-2">
            <p className="text-sm font-medium text-gray-700 mb-6">Progreso de formacion</p>
            <StatusTimeline currentStatus={company.status} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg"><FileText className="h-5 w-5 text-blue-600" /></div>
              <div><p className="text-2xl font-bold text-gray-900">{docCount ?? 0}</p><p className="text-sm text-gray-500">Documentos</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg"><Mail className="h-5 w-5 text-yellow-600" /></div>
              <div><p className="text-2xl font-bold text-gray-900">{unreadMailCount ?? 0}</p><p className="text-sm text-gray-500">Correo sin leer</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg"><Building2 className="h-5 w-5 text-green-600" /></div>
              <div><StatusBadge status={company.status} /><p className="text-sm text-gray-500 mt-1">Estado actual</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {company.ein && (
        <Card>
          <CardHeader><CardTitle className="text-base">EIN (Tax ID)</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xl sm:text-2xl font-mono font-bold text-gray-900 break-all">{company.ein}</p>
            <p className="text-sm text-gray-500 mt-1">Numero de identificacion fiscal federal</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">💳 Configura tus pagos</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {[
              { name: 'Relay', desc: 'Cuenta bancaria para negocios. Sin tarifas mensuales.', href: 'https://relayfi.com', icon: '🏦' },
              { name: 'Mercury', desc: 'Banca digital para startups y LLCs. 100% online.', href: 'https://mercury.com', icon: '🚀' },
              { name: 'Wise Business', desc: 'Pagos internacionales con tasas bajas. Ideal para latinos.', href: 'https://wise.com/us/business/', icon: '🌎' },
              { name: 'Stripe', desc: 'Acepta pagos online con tarjeta. Fácil de integrar.', href: 'https://stripe.com', icon: '💳' },
              { name: 'Payoneer', desc: 'Cobra desde marketplaces y clientes internacionales.', href: 'https://www.payoneer.com', icon: '💸' },
            ].map(s => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                <span className="text-2xl leading-none mt-0.5">{s.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{s.desc}</p>
                </div>
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-400">Estos son servicios de terceros. CreaTuEmpresaUSA te guía pero no garantiza aprobación.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Necesitas ayuda?</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <a href="https://wa.me/19046248859" target="_blank" className="bg-green-500 text-white px-5 py-2 rounded-lg font-medium text-sm">WhatsApp</a>
          <a href="mailto:info@creatuempresausa.com" className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg font-medium text-sm">Email</a>
        </CardContent>
      </Card>
    </div>
  )
}
