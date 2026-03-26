import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InvoiceTable, type InvoiceRow } from '@/components/billing/invoice-table'
import { ExternalLink, CreditCard, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react'
import { formatAmount, PACKAGE_LABELS, PACKAGE_COLORS } from '@/lib/billing'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PaymentPanelProps {
  company: {
    id:                 string
    package:            string | null
    service_fee:        number | null
    state_fee:          number | null
    addons_total:       number | null
    total_paid:         number | null
    stripe_customer_id: string | null
    stripe_session_id:  string | null
    order_reference:    string | null
    created_at:         string
  }
  invoices: InvoiceRow[]
}

export function PaymentPanel({ company, invoices }: PaymentPanelProps) {
  const totalDue =
    (company.service_fee ?? 0) +
    (company.state_fee ?? 0) +
    (company.addons_total ?? 0)

  const lastInvoice  = invoices[0] ?? null
  const paymentStatus = lastInvoice?.status ?? (company.stripe_customer_id ? 'open' : 'no_customer')
  const isPaid        = invoices.some((inv) => inv.status === 'paid')

  const stripeCustomerUrl = company.stripe_customer_id
    ? `https://dashboard.stripe.com/customers/${company.stripe_customer_id}`
    : null

  return (
    <div className="space-y-5">
      {/* Payment Summary */}
      <div className="grid grid-cols-2 gap-3">
        {/* Package */}
        <div className="rounded-lg border bg-white p-3">
          <p className="text-xs text-gray-400 mb-1">Package</p>
          {company.package ? (
            <Badge className={cn('text-xs font-semibold border-0', PACKAGE_COLORS[company.package])}>
              {PACKAGE_LABELS[company.package] ?? company.package}
            </Badge>
          ) : (
            <span className="text-sm text-gray-400">—</span>
          )}
        </div>

        {/* Total */}
        <div className="rounded-lg border bg-white p-3">
          <p className="text-xs text-gray-400 mb-1">Total</p>
          <p className="text-sm font-bold text-gray-900">
            {totalDue > 0 ? formatAmount(totalDue * 100) : '—'}
          </p>
        </div>

        {/* Payment status */}
        <div className="rounded-lg border bg-white p-3">
          <p className="text-xs text-gray-400 mb-1">Payment</p>
          <div className="flex items-center gap-1.5">
            {isPaid ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span className="text-sm font-medium text-green-700">Paid</span>
              </>
            ) : company.stripe_customer_id ? (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">Pending</span>
              </>
            ) : (
              <>
                <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-sm text-gray-500">No customer</span>
              </>
            )}
          </div>
        </div>

        {/* Stripe link */}
        <div className="rounded-lg border bg-white p-3">
          <p className="text-xs text-gray-400 mb-1">Stripe</p>
          {stripeCustomerUrl ? (
            <Button variant="ghost" size="sm" className="h-6 px-0 text-xs text-blue-600 hover:text-blue-700" asChild>
              <a href={stripeCustomerUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Ver en Stripe
              </a>
            </Button>
          ) : (
            <span className="text-xs text-gray-400">Not linked</span>
          )}
        </div>
      </div>

      {/* Fee breakdown */}
      {totalDue > 0 && (
        <div className="rounded-lg border bg-gray-50 p-3 space-y-1.5 text-sm">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <DollarSign className="h-3 w-3" />
            Breakdown
          </p>
          {company.service_fee != null && (
            <div className="flex justify-between">
              <span className="text-gray-600">Service fee</span>
              <span className="font-medium text-gray-900">{formatAmount(company.service_fee * 100)}</span>
            </div>
          )}
          {company.state_fee != null && (
            <div className="flex justify-between">
              <span className="text-gray-600">State filing fee</span>
              <span className="font-medium text-gray-900">{formatAmount(company.state_fee * 100)}</span>
            </div>
          )}
          {company.addons_total != null && company.addons_total > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Add-ons</span>
              <span className="font-medium text-gray-900">{formatAmount(company.addons_total * 100)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1.5 border-t font-semibold">
            <span className="text-gray-800">Total</span>
            <span className="text-gray-900">{formatAmount(totalDue * 100)}</span>
          </div>
        </div>
      )}

      {/* Invoice history */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Invoices ({invoices.length})
        </p>
        <InvoiceTable invoices={invoices} showDownload={true} />
      </div>
    </div>
  )
}
