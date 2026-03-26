import { createAdminServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InvoiceTable, type InvoiceRow } from '@/components/billing/invoice-table'
import { formatAmount, INVOICE_STATUS_LABEL, INVOICE_STATUS_COLOR, PACKAGE_LABELS, PACKAGE_COLORS } from '@/lib/billing'
import { cn } from '@/lib/utils'
import { DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react'

export default async function AdminBillingPage() {
  const supabase = createAdminServerClient()

  // All payments + company join for context
  const { data: payments } = await supabase
    .from('payments')
    .select(`
      *,
      companies (
        company_name,
        package,
        clients (
          users ( full_name, email )
        )
      )
    `)
    .order('created_at', { ascending: false })

  const allPayments = (payments ?? []) as any[]

  // Revenue stats
  const totalRevenue = allPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount_paid ?? 0), 0)

  const pendingAmount = allPayments
    .filter((p) => p.status === 'open')
    .reduce((sum, p) => sum + (p.amount_due ?? 0), 0)

  const paidCount   = allPayments.filter((p) => p.status === 'paid').length
  const openCount   = allPayments.filter((p) => p.status === 'open').length
  const failedCount = allPayments.filter((p) => p.status === 'uncollectible').length

  // Revenue by package (from companies table, not payments)
  const { data: companiesData } = await supabase
    .from('companies')
    .select('package, total_paid, stripe_customer_id')

  const packageRevenue: Record<string, number> = {}
  for (const co of companiesData ?? []) {
    if (!co.package) continue
    packageRevenue[co.package] = (packageRevenue[co.package] ?? 0) + (co.total_paid ?? 0)
  }

  // Flatten invoices for the table (with company context as description override)
  const invoiceRows: InvoiceRow[] = allPayments.map((p) => ({
    ...p,
    description: p.companies?.company_name ?? p.description,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing Overview</h1>
        <p className="text-gray-500 mt-1">Revenue, invoices, and payment pipeline.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatAmount(totalRevenue)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{paidCount} paid invoices</p>
              </div>
              <div className="bg-green-50 p-2 rounded-lg">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Pending
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatAmount(pendingAmount)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{openCount} open invoices</p>
              </div>
              <div className="bg-yellow-50 p-2 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  This Month
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatAmount(
                    allPayments
                      .filter((p) => {
                        if (p.status !== 'paid' || !p.paid_at) return false
                        const d = new Date(p.paid_at)
                        const now = new Date()
                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                      })
                      .reduce((s, p) => s + (p.amount_paid ?? 0), 0)
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Current month</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Failed
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{failedCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">Uncollectible invoices</p>
              </div>
              <div className="bg-red-50 p-2 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by package */}
      {Object.keys(packageRevenue).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Revenue by Package</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {(['starter', 'professional', 'premium'] as const).map((pkg) => (
                <div key={pkg} className="rounded-lg border p-4 text-center">
                  <Badge className={cn('text-xs font-semibold border-0 mb-3', PACKAGE_COLORS[pkg])}>
                    {PACKAGE_LABELS[pkg]}
                  </Badge>
                  <p className="text-xl font-bold text-gray-900">
                    {formatAmount((packageRevenue[pkg] ?? 0) * 100)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(companiesData ?? []).filter((c) => c.package === pkg).length} companies
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice pipeline by status */}
      <div className="grid grid-cols-3 gap-4">
        {(['paid', 'open', 'uncollectible'] as const).map((status) => {
          const count = allPayments.filter((p) => p.status === status).length
          return (
            <Card key={status}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <Badge className={cn('text-xs font-medium border-0', INVOICE_STATUS_COLOR[status])}>
                    {INVOICE_STATUS_LABEL[status]}
                  </Badge>
                  <span className="text-xl font-bold text-gray-900">{count}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* All invoices table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Invoices</h2>
            <p className="text-sm text-gray-500">{invoiceRows.length} total</p>
          </div>
        </div>
        <InvoiceTable invoices={invoiceRows} showDownload />
      </div>
    </div>
  )
}
