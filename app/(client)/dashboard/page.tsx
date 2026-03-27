'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/client/status-badge'
import { StatusTimeline } from '@/components/client/status-timeline'
import { FileText, Mail, Building2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const [company, setCompany] = useState(null)
  const [profile, setProfile] = useState(null)
  const [docCount, setDocCount] = useState(0)
  const [unreadMail, setUnreadMail] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data: p } = await supabase.from('users').select('full_name').eq('id', user.id).single()
      setProfile(p)
      const { data: cl } = await supabase.from('clients').select('id').eq('user_id', user.id).single()
      if (cl && cl.id) {
        const { data: co } = await supabase.from('companies').select('*').eq('client_id', cl.id).order('created_at').limit(1).maybeSingle()
        setCompany(co)
        if (co && co.id) {
          const dr = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('company_id', co.id)
          const mr = await supabase.from('mail_items').select('*', { count: 'exact', head: true }).eq('company_id', co.id).eq('is_read', false)
          setDocCount(dr.count || 0)
          setUnreadMail(mr.count || 0)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return React.createElement('div', {className: 'flex items-center justify-center min-h-96'}, React.createElement('p', {className: 'text-gray-500'}, 'Cargando...'))

  const firstName = (profile && profile.full_name) ? profile.full_name.split(' ')[0] : 'Cliente'

  if (!company) return React.createElement('div', {className: 'text-center py-20'},
    React.createElement(Building2, {className: 'mx-auto h-12 w-12 text-gray-300 mb-4'}),
    React.createElement('h2', {className: 'text-xl font-semibold mb-2'}, 'Tu caso esta siendo configurado'),
    React.createElement('a', {href: 'https://wa.me/19046248859', className: 'bg-green-500 text-white px-6 py-2 rounded-lg'}, 'WhatsApp')
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {firstName}</h1>
        <p className="text-gray-500">Resumen de tu formacion de LLC.</p>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{company.company_name}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Estado: {company.state} | Paquete: {company.package}</p>
              {company.order_reference && <p className="text-xs text-gray-400 mt-1">Orden: {company.order_reference}</p>}
            </div>
            <StatusBadge status={company.status} />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium text-gray-700 mb-4">Progreso de formacion</p>
          <StatusTimeline currentStatus={company.status} />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="bg-blue-100 p-2 rounded-lg"><FileText className="h-5 w-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{docCount}</p><p className="text-sm text-gray-500">Documentos</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="bg-yellow-100 p-2 rounded-lg"><Mail className="h-5 w-5 text-yellow-600" /></div><div><p className="text-2xl font-bold">{unreadMail}</p><p className="text-sm text-gray-500">Correo sin leer</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><div className="bg-green-100 p-2 rounded-lg"><Building2 className="h-5 w-5 text-green-600" /></div><div><StatusBadge status={company.status} /><p className="text-sm text-gray-500 mt-1">Estado actual</p></div></div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Necesitas ayuda?</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <a href="https://wa.me/19046248859" className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium">WhatsApp</a>
          <a href="mailto:info@creatuempresausa.com" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">Email</a>
        </CardContent>
      </Card>
    </div>
  )
}
