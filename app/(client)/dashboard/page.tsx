'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/client/status-badge'
import { StatusTimeline } from '@/components/client/status-timeline'
import { FileText, Mail, Building2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const [company, setCompany] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [docCount, setDocCount] = useState(0)
  const [unreadMail, setUnreadMail] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const [profileRes, clientRes] = await Promise.all([
        supabase.from('users').select('full_name').eq('id', user.id).single(),
        supabase.from('clients').select('id').eq('user_id', user.id).single(),
      ])

      setProfile(profileRes.data)

      if (clientRes.data?.id) {
        const { data: co } = await supabase
          .from('companies')
          .select('*')
          .eq('client_id', clientRes.data.id)
          .order('created_at')
          .limit(1)
          .maybeSingle()

        setCompany(co)

        if (co?.id) {
          const [docsRes, mailRes] = await Promise.all([
            supabase.from('documents').select('*', { count: 'exact', head: true }).eq('company_id', co.id),
            supabase.from('mail_items').select('*', { count: 'exact', head: true }).eq('company_id', co.id).eq('is_read', false),
          ])
          setDocCount(docsRes.count ?? 0)
          setUnreadMail(mailRes.count ?? 0)
        }
      }

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando tu portal...</div>

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Cliente'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {firstName}</h1>
        <p className="text-gray-500 mt-1">Aquí está el resumen de tu formación de LLC.</p>
      </div>

      {!company ? (
        <div className="text-center py-20">
          <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Tu caso está siendo configurado</h2>
          <p className="text-gray-500">Tu empresa aparecerá aquí en breve. Si tienes dudas contáctanos por WhatsApp.</p>
          <a href="https://wa.me/19046248859" className="inline-block mt-4 bg-green-500 text-white px-6 py-2 rounded-lg font-medium">
            💬 Hablar por WhatsApp
          </a>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{company.company_name}</CardTitle>
                  <p className="text-gray-500 text-sm mt-1">Estado de formación: {company.state}</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{docCount}</p>
                    <p className="text-sm text-gray-500">Documentos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{unreadMail}</p>
                    <p className="text-sm text-gray-500">Correo sin leer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      <StatusBadge status={company.status} />
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Estado actual</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">¿Necesitas ayuda?</CardTitle>
            </CardHeader>
            <CardContent>
              <a href="https://wa.me/19046248859" className="inline-block bg-green-500 text-white px-6 py-2 rounded-lg font-medium">
                💬 Hablar por WhatsApp
              </a>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
