'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/client/status-badge'
import { formatDate } from '@/lib/utils'

export default function CompanyPage() {
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/client/company')
      if (!res.ok) {
        if (res.status === 401) { window.location.href = '/login'; return }
        setLoading(false)
        return
      }
      const { company } = await res.json()
      setCompany(company)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando...</div>

  if (!company) return (
    <div className="text-center py-20">
      <p className="text-gray-500">No se encontró información de tu empresa.</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mi Empresa</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{company.company_name}</CardTitle>
            <StatusBadge status={company.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Estado de formación</p>
              <p className="font-medium">{company.state}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Paquete</p>
              <p className="font-medium capitalize">{company.package}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Número de orden</p>
              <p className="font-medium">{company.order_reference}</p>
            </div>
            {company.ein && (
              <div>
                <p className="text-sm text-gray-500">EIN</p>
                <p className="font-medium">{company.ein}</p>
              </div>
            )}
            {company.formation_date && (
              <div>
                <p className="text-sm text-gray-500">Fecha de formación</p>
                <p className="font-medium">{formatDate(company.formation_date)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
