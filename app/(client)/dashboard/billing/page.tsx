import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PortalButton } from '@/components/billing/portal-button'
import { AddonGrid } from '@/components/billing/addon-grid'
import { InvoiceTable, type InvoiceRow } from '@/components/billing/invoice-table'
import {
  CreditCard, CheckCircle2, AlertCircle, Clock,
  RefreshCw, ShieldCheck, Zap,
} from 'lucide-react'
import {
  formatAmount,
  PACKAGE_LABELS,
  PACKAGE_COLORS,
} from '@/lib/billing'
import { cn } from '@/lib/utils'

// Return URL params injected by Stripe after checkout
interface PageProps {
  searchParams: { addon_success?: string }
}

export default async function BillingPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch company (RLS filters to this client automatically)
  const { data: company } = await supabase
    .from('companies')
    .select(`
      id, company_name, package, state,
      service_fee, state_fee, addons_total, total_paid,
      stripe_customer_id, stripe_session_id, order_reference,
      status, created_at
    `)
    .order('created_at')
    .limit(1)
    .maybeSingle()

  // Fetch cached invoices from Supabase payments table
  const { data: rawInvoices } = company
    ? await supabase
        .from('payments')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  const invoices: InvoiceRow[] = (rawInvoices ?? []) as InvoiceRow[]

  const totalDue =
    (company?.service_fee ?? 0) +
    (company?.state_fee   ?? 0) +
    (company?.addons_total ?? 0)

  const isPaid         = invoices.some((inv) => inv.status === 'paid')
  const hasCustomer    = Boolean(company?.stripe_customer_id)
  const addonSuccess   = searchParams.addon_success

  // Payment status config
  const paymentStatus = isPaid
    ? { label: 'Pago confirmado', color: 'text-green-700', bg: 'bg-green-50', Icon: CheckCircle2, iconColor: 'text-green-500' }
    : hasCustomer
    ? { label: 'Pendiente de pago', color: 'text-yellow-700', bg: 'bg-yellow-50', Icon: AlertCircle, iconColor: 'text-yellow-500' }
    : { label: 'Sin información de pago', color: 'text-gray-600', bg: 'bg-gray-50', Icon: CreditCard, iconColor: 'text-gray-400' }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
        <p className="text-gray-500 mt-1">
          Pagos, facturas y servicios adicionales para tu empresa.
        </p>
      </div>

      {/* Add-on success banner */}
      {addonSuccess && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-800 font-medium">
            ¡Pago completado! Tu servicio adicional ha sido registrado. El equipo se pondrá en
            contacto pronto.
          </p>
        </div>
      )}

      {/* ─── Top grid: Order + Payment status ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Order Summary */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">Resumen de tu orden</CardTitle>
                {company?.order_reference && (
                  <CardDescription className="font-mono text-xs mt-0.5">
                    {company.order_reference}
                  </CardDescription>
                )}
              </div>
              {company?.package && (
                <Badge className={cn('text-xs font-semibold border-0', PACKAGE_COLORS[company.package])}>
                  {PACKAGE_LABELS[company.package]}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {company ? (
              <dl className="divide-y divide-gray-100 text-sm">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-gray-500">Empresa</dt>
                  <dd className="font-medium text-gray-900">{company.company_name}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-gray-500">Estado de formación</dt>
                  <dd className="font-medium text-gray-900">{company.state}</dd>
                </div>

                {/* Fee breakdown */}
                {company.service_fee != null && (
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-gray-500">Servicio de formación</dt>
                    <dd className="text-gray-900">{formatAmount(company.service_fee * 100)}</dd>
                  </div>
                )}
                {company.state_fee != null && (
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-gray-500">Tarifa estatal ({company.state})</dt>
                    <dd className="text-gray-900">{formatAmount(company.state_fee * 100)}</dd>
                  </div>
                )}
                {company.addons_total != null && company.addons_total > 0 && (
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-gray-500">Servicios adicionales</dt>
                    <dd className="text-gray-900">{formatAmount(company.addons_total * 100)}</dd>
                  </div>
                )}

                {/* Total row */}
                {totalDue > 0 && (
                  <div className="py-3 flex justify-between font-semibold text-base">
                    <dt className="text-gray-800">Total</dt>
                    <dd className="text-gray-900">{formatAmount(totalDue * 100)}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">
                No hay información de orden disponible.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Payment status + Portal */}
        <Card className={cn('border', paymentStatus.bg)}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Estado del pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status pill */}
            <div className={`flex items-center gap-2 ${paymentStatus.color}`}>
              <paymentStatus.Icon className={`h-5 w-5 ${paymentStatus.iconColor}`} />
              <span className="text-sm font-semibold">{paymentStatus.label}</span>
            </div>

            {isPaid && invoices[0]?.paid_at && (
              <p className="text-xs text-gray-500">
                Pagado el {new Date(invoices[0].paid_at).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            )}

            <Separator />

            {/* Portal CTA */}
            <div className="space-y-2">
              <PortalButton
                label="Gestionar pagos"
                variant={hasCustomer ? 'default' : 'outline'}
              />
              <p className="text-xs text-gray-400 leading-snug">
                Accede a tu portal de Stripe para ver facturas, métodos de pago y recibos.
              </p>
            </div>

            {/* Last invoice quick-view */}
            {invoices[0] && (
              <div className="rounded-lg bg-white/70 border p-3 text-xs space-y-1">
                <p className="font-medium text-gray-700">Última factura</p>
                <div className="flex justify-between text-gray-500">
                  <span>{invoices[0].invoice_number ?? '—'}</span>
                  <span className="font-semibold text-gray-800">
                    {formatAmount(
                      invoices[0].status === 'paid'
                        ? invoices[0].amount_paid
                        : invoices[0].amount_due,
                      invoices[0].currency
                    )}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Invoice history ─────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Historial de facturas</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {invoices.length > 0
                ? `${invoices.length} factura${invoices.length === 1 ? '' : 's'} registrada${invoices.length === 1 ? '' : 's'}`
                : 'Las facturas aparecerán aquí después de tu primer pago'}
            </p>
          </div>
          {invoices.length > 0 && (
            <PortalButton label="Ver todas en Stripe" variant="outline" size="sm" />
          )}
        </div>
        <InvoiceTable invoices={invoices} showDownload />
      </div>

      {/* ─── Add-on services ─────────────────────────────────────────────── */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Servicios adicionales</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Complementa tu formación con servicios a la carta.
            {company?.package && (
              <span className="text-blue-600 ml-1">
                Los marcados como "Incluido" ya están en tu plan.
              </span>
            )}
          </p>
        </div>
        <AddonGrid packageId={company?.package ?? null} hasStripeCustomer={hasCustomer} />
      </div>

      {/* ─── Annual subscriptions (placeholder) ─────────────────────────── */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Suscripciones anuales</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Servicios recurrentes que mantienen tu empresa en cumplimiento.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Registered Agent */}
          <Card className="border-dashed">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Registered Agent</p>
                  <p className="text-xs text-gray-400">$99/año</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Renovación automática del agente registrado. Evita multas por incumplimiento.
              </p>
              <Badge className="text-xs bg-blue-50 text-blue-600 border-0">
                Próximamente — auto-renovación
              </Badge>
            </CardContent>
          </Card>

          {/* Compliance reminders */}
          <Card className="border-dashed">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Compliance Alerts</p>
                  <p className="text-xs text-gray-400">$49/año</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Recordatorios automáticos de Annual Report, renovaciones y fechas límite.
              </p>
              <Badge className="text-xs bg-violet-50 text-violet-600 border-0">
                Próximamente
              </Badge>
            </CardContent>
          </Card>

          {/* Bookkeeping */}
          <Card className="border-dashed">
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Bookkeeping Basic</p>
                  <p className="text-xs text-gray-400">$29/mes</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Contabilidad básica mensual para tu LLC. Categorización de transacciones.
              </p>
              <Badge className="text-xs bg-emerald-50 text-emerald-600 border-0">
                Próximamente
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── Pro upgrade teaser ──────────────────────────────────────────── */}
      {company?.package === 'starter' && (
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white">
          <CardContent className="py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-base">Upgrade a Professional</p>
                  <p className="text-blue-100 text-sm mt-0.5">
                    Incluye EIN, Operating Agreement y soporte prioritario. Por solo $200 más.
                  </p>
                </div>
              </div>
              <PortalButton label="Hablar con asesor" variant="outline" size="sm" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
