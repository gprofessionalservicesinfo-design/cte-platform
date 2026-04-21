import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/client/status-badge'
import { StatusTimeline } from '@/components/client/status-timeline'
import { FileText, Mail, Building2, CheckCircle2, Clock, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { ServicesPanel } from '@/components/client/services-panel'

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
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Tu caso está siendo configurado</h2>
        <p className="text-gray-500 mb-6">Tu empresa aparecerá aquí en breve. Contáctanos si tienes dudas.</p>
        <a href="https://wa.me/19046248859" target="_blank" className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-medium">WhatsApp</a>
      </div>
    )
  }

  const { data: company } = await db.from('companies').select('*, onboarding_completed').eq('client_id', clientRow.id).order('created_at').limit(1).maybeSingle()

  if (!company) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Tu empresa está siendo configurada</h2>
        <p className="text-gray-500">Aparecerá aquí en breve.</p>
      </div>
    )
  }

  const [{ count: docCount }, { count: unreadMailCount }] = await Promise.all([
    db.from('documents').select('*', { count: 'exact', head: true }).eq('company_id', company.id),
    db.from('mail_items').select('*', { count: 'exact', head: true }).eq('company_id', company.id).eq('is_read', false),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Cliente'
  const wa = company as any

  const planLabel: Record<string, string> = {
    starter: 'Plan Starter', basic: 'Plan Starter',
    professional: 'Plan Pro', growth: 'Plan Pro',
    premium: 'Plan Premium',
  }

  return (
    <div className="space-y-8">
      {/* Onboarding banner */}
      {!company.onboarding_completed && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4">
          <div className="flex items-start gap-3">
            <span className="text-xl leading-none mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold text-amber-900 text-sm">Completa la información de tu empresa</p>
              <p className="text-amber-700 text-xs mt-0.5">Necesitamos algunos datos para preparar tus documentos legales.</p>
            </div>
          </div>
          <a
            href="/dashboard/onboarding"
            className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          >
            Completar ahora →
          </a>
        </div>
      )}

      {/* Welcome header */}
      <div className="rounded-2xl bg-[#0A2540] text-white px-6 py-8 sm:px-10 relative overflow-hidden">
        {/* subtle brand accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4DB39A] to-[#2CB98A]" />
        <p className="text-xs font-semibold uppercase tracking-widest text-[#4DB39A] mb-2">Portal de Cliente</p>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Bienvenido, {firstName}</h1>
        <p className="text-blue-100 text-sm leading-relaxed">
          Tu empresa <strong className="text-white">{company.company_name}</strong>
          {company.state ? ` · ${company.state}` : ''} está en proceso de formación.
          Nuestro equipo está trabajando en tu caso.
        </p>
        {company.order_reference && (
          <p className="text-blue-400 text-xs mt-4 font-mono">#{company.order_reference}</p>
        )}
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{company.company_name}</CardTitle>
              <p className="text-gray-500 text-sm mt-1">Estado de formación: {company.state}</p>
              <p className="text-gray-500 text-sm">Paquete: <span className="font-medium text-gray-700">{planLabel[company.package ?? ''] ?? company.package}</span></p>
              {company.order_reference && <p className="text-gray-400 text-xs mt-1">Orden: {company.order_reference}</p>}
            </div>
            <StatusBadge status={company.status} />
          </div>
        </CardHeader>
        <CardContent>
          {company.formation_date && (
            <p className="text-sm text-gray-500 mb-6">Fecha de formación: {formatDate(company.formation_date)}</p>
          )}
          <div className="pt-2">
            <p className="text-sm font-medium text-gray-700 mb-6">Progreso de formación</p>
            <StatusTimeline currentStatus={company.status} />
          </div>
        </CardContent>
      </Card>

      {/* Services + Compliance + Upsells */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Servicios adicionales</CardTitle>
        </CardHeader>
        <CardContent>
          <ServicesPanel companyId={company.id} />
        </CardContent>
      </Card>

      {/* Communication status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Comunicaciones de bienvenida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Email — always sent */}
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-800">Correo de bienvenida enviado</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          {/* WhatsApp */}
          {wa.whatsapp_status === 'sent' && (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">WhatsApp de bienvenida enviado</p>
                {wa.whatsapp_sent_at && (
                  <p className="text-xs text-gray-400">{formatDate(wa.whatsapp_sent_at)}</p>
                )}
              </div>
            </div>
          )}
          {wa.whatsapp_status && wa.whatsapp_status !== 'sent' && (
            <div className="flex items-start gap-3">
              <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-600">WhatsApp pendiente</p>
                <p className="text-xs text-gray-400">Contacta a tu asesor si no recibiste el mensaje.</p>
              </div>
            </div>
          )}
          {/* Next steps note */}
          <div className="flex items-start gap-3 pt-1 border-t border-gray-100 mt-1">
            <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              Nuestro equipo comenzará a procesar tu caso en las próximas <strong>24–48 horas</strong> hábiles.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a href="/dashboard/documents">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#4DB39A]/10 p-3 rounded-xl"><FileText className="h-5 w-5 text-[#2CB98A]" /></div>
                <div><p className="text-2xl font-bold text-[#2A3544]">{docCount ?? 0}</p><p className="text-sm text-gray-500">Documentos</p></div>
              </div>
            </CardContent>
          </Card>
        </a>
        <a href="/dashboard/mail">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-amber-50 p-3 rounded-xl relative">
                  <Mail className="h-5 w-5 text-amber-600" />
                  {(unreadMailCount ?? 0) > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadMailCount}</span>
                  )}
                </div>
                <div><p className="text-2xl font-bold text-[#2A3544]">{unreadMailCount ?? 0}</p><p className="text-sm text-gray-500">Correo sin leer</p></div>
              </div>
            </CardContent>
          </Card>
        </a>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-[#4DB39A]/10 p-3 rounded-xl"><Building2 className="h-5 w-5 text-[#2CB98A]" /></div>
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

      {company.banking_setup_enabled ? (
        <Card>
          <CardHeader><CardTitle className="text-base">Configura tus pagos</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {[
                { name: 'Relay', desc: 'Cuenta bancaria para negocios. Sin tarifas mensuales.', href: 'https://relayfi.com' },
                { name: 'Mercury', desc: 'Banca digital para startups y LLCs. 100% online.', href: 'https://mercury.com' },
                { name: 'Wise Business', desc: 'Pagos internacionales con tasas bajas. Ideal para latinos.', href: 'https://wise.com/us/business/' },
                { name: 'Stripe', desc: 'Acepta pagos online con tarjeta. Facil de integrar.', href: 'https://stripe.com' },
                { name: 'Payoneer', desc: 'Cobra desde marketplaces y clientes internacionales.', href: 'https://www.payoneer.com' },
              ].map(s => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors">
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
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base">Configuracion de pagos</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col items-start py-2 gap-2">
              <p className="text-sm text-gray-500">Este servicio estará disponible una vez que tu asesor lo active.</p>
              <a href="https://wa.me/19046248859" target="_blank" rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 underline underline-offset-2">
                Contactar asesor por WhatsApp
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {(company as any).address_service_enabled ? (
        <Card>
          <CardHeader><CardTitle className="text-base">Tu direccion comercial</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-green-700 bg-green-100 px-2.5 py-1 rounded-full">Activa</span>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {(company as any).address_service_type === 'vip' ? 'Corporate Address VIP' : 'Standard Business Address'}
                </span>
                <span className="text-xs text-gray-400">
                  · {(company as any).address_service_period === 'annual' ? 'Plan anual' : 'Plan mensual'}
                </span>
              </div>
              <p className="text-sm text-gray-500">Tu dirección comercial en EE.UU. está activa. Nuestro equipo gestionará tu correo entrante.</p>
              <a href="https://wa.me/19046248859" target="_blank" rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg font-medium text-sm">
                Ver detalles →
              </a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base">Tu direccion comercial</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col items-start py-2 gap-2">
              <p className="text-sm text-gray-500">Tu dirección comercial estará disponible una vez activada por tu asesor.</p>
              <a href="https://wa.me/19046248859" target="_blank" rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 underline underline-offset-2">
                Contactar asesor por WhatsApp
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">¿Necesitas ayuda?</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Nuestro equipo está disponible para resolver cualquier pregunta sobre tu caso.</p>
          <div className="flex flex-wrap gap-3">
            <a href="https://wa.me/19046248859" target="_blank" rel="noopener noreferrer"
              className="bg-[#2CB98A] hover:bg-[#24a87c] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />WhatsApp
            </a>
            <a href="mailto:soporte@creatuempresausa.com"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-2">
              <Mail className="h-4 w-4" />Email
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
