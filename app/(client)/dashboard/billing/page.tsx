'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export default function BillingPage() {
  const [company, setCompany] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const { data: co } = await supabase
        .from('companies')
        .select('*')
        .order('created_at')
        .limit(1)
        .maybeSingle()

      setCompany(co)

      if (co?.id) {
        const { data: pay } = await supabase
          .from('payments')
          .select('*')
          .eq('company_id', co.id)
          .order('created_at', { ascending: false })
        setPayments(pay ?? [])
      }

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>

      {company && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen del paquete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Paquete</span>
              <span className="font-medium capitalize">{company.package}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Empresa</span>
              <span className="font-medium">{company.company_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Orden</span>
              <span className="font-medium">{company.order_reference}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{p.description ?? 'Pago'}</p>
                    <p className="text-sm text-gray-500">{formatDate(p.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(p.amount / 100).toFixed(2)}</p>
                    <p className="text-sm text-green-600">{p.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {payments.length === 0 && (
        <p className="text-gray-500 text-center py-8">No hay pagos registrados.</p>
      )}
    </div>
  )
}
