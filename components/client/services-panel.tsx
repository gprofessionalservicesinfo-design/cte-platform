'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Clock, AlertTriangle, ExternalLink } from 'lucide-react'

const ADVISOR_WA = 'https://wa.me/18669958013'

interface AddonService {
  id:           string
  service_type: string
  status:       string
  price:        number | null
  expires_at:   string | null
}

interface ComplianceEvent {
  id:         string
  event_type: string
  due_date:   string
  status:     string
}

const SERVICE_LABELS: Record<string, string> = {
  registered_agent: 'Agente Registrado',
  business_address: 'Dirección Comercial',
  itin:             'Solicitud ITIN',
  annual_report:    'Reporte Anual',
  bookkeeping:      'Contabilidad',
  trademark:        'Registro de Marca',
  ein:              'Obtención de EIN',
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  active:    'bg-green-100  text-green-700',
  expired:   'bg-red-100    text-red-700',
  cancelled: 'bg-gray-100   text-gray-500',
}

const STATUS_LABELS: Record<string, string> = {
  pending:   'Pendiente',
  active:    'Activo',
  expired:   'Vencido',
  cancelled: 'Cancelado',
}

interface UpsellItem {
  type:  string
  label: string
  price: string
  desc:  string
}

const UPSELLS: UpsellItem[] = [
  { type: 'registered_agent', label: 'Agente Registrado',    price: '$149/año',  desc: 'Mantén tu empresa en cumplimiento con un agente registrado certificado.' },
  { type: 'business_address', label: 'Dirección Comercial',  price: '$149/año',  desc: 'Dirección profesional en EE.UU. para recibir correspondencia oficial.' },
  { type: 'itin',             label: 'Solicitud ITIN',       price: '$299',      desc: 'Obtén tu ITIN para abrir cuentas bancarias y cumplir con el IRS.' },
  { type: 'annual_report',    label: 'Reporte Anual',        price: '$149',      desc: 'Presentación de reporte anual para mantener tu LLC activa.' },
  { type: 'bookkeeping',      label: 'Contabilidad',         price: '$99/mes',   desc: 'Lleva tus registros contables al día con nuestro servicio mensual.' },
]

function getDaysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function ServicesPanel({ companyId }: { companyId: string }) {
  const [services,   setServices]   = useState<AddonService[]>([])
  const [compliance, setCompliance] = useState<ComplianceEvent[]>([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('addon_services')    .select('id,service_type,status,price,expires_at').eq('company_id', companyId),
      supabase.from('compliance_events') .select('id,event_type,due_date,status').eq('company_id', companyId).order('due_date'),
    ]).then(([{ data: svc }, { data: cmp }]) => {
      setServices(svc ?? [])
      setCompliance(cmp ?? [])
      setLoading(false)
    })
  }, [companyId])

  const activeTypes = new Set(services.filter(s => s.status === 'active').map(s => s.service_type))
  const upsells     = UPSELLS.filter(u => !activeTypes.has(u.type))

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-400 text-sm">
        Cargando servicios...
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Active services */}
      {services.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Mis servicios activos</h2>
          <div className="space-y-2">
            {services.map(s => (
              <div key={s.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {SERVICE_LABELS[s.service_type] ?? s.service_type}
                  </p>
                  {s.expires_at && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Vence: {new Date(s.expires_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS_STYLES[s.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABELS[s.status] ?? s.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Compliance calendar */}
      {compliance.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Calendario de cumplimiento</h2>
          <div className="space-y-2">
            {compliance.map(ev => {
              const days = getDaysUntil(ev.due_date)
              const done = ev.status === 'completed'
              return (
                <div key={ev.id} className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${done ? 'bg-green-50 border-green-100' : days < 0 ? 'bg-red-50 border-red-200' : days <= 30 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
                  {done
                    ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    : days < 0
                      ? <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                      : <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{ev.event_type}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(ev.due_date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                      {!done && (
                        <span className={`ml-2 font-medium ${days < 0 ? 'text-red-600' : days <= 30 ? 'text-yellow-600' : 'text-gray-400'}`}>
                          {days < 0 ? `${Math.abs(days)} días de retraso` : `${days} días restantes`}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Upsell cards */}
      {upsells.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-1">Servicios adicionales</h2>
          <p className="text-sm text-gray-500 mb-4">Amplía la protección y soporte para tu empresa.</p>
          <div className="space-y-3">
            {upsells.map(u => (
              <div key={u.type} className="border border-gray-200 rounded-xl px-4 py-4 bg-white flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800">{u.label}</p>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{u.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-snug">{u.desc}</p>
                </div>
                <a
                  href={`${ADVISOR_WA}?text=${encodeURIComponent(`Hola, me interesa el servicio de ${u.label} (${u.price}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  Consultar
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
