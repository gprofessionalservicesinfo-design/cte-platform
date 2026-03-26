import Link from 'next/link'
import { createAdminServerClient } from "@/lib/supabase/server"
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/client/status-badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ShoppingBag } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const PACKAGE_LABEL: Record<string, string> = {
  starter:      'Starter $299',
  professional: 'Professional $499',
  premium:      'Premium $799',
}
const PACKAGE_COLOR: Record<string, string> = {
  starter:      'bg-slate-100 text-slate-700',
  professional: 'bg-blue-100 text-blue-700',
  premium:      'bg-purple-100 text-purple-700',
}

export default async function AdminOrdersPage() {
  const supabase = createAdminServerClient()

  const { data: orders, error } = await supabase
    .from('companies')
    .select(`
      id,
      company_name,
      state,
      status,
      package,
      service_fee,
      state_fee,
      addons_total,
      total_paid,
      order_reference,
      stripe_customer_id,
      created_at,
      clients (
        country,
        users ( full_name, email )
      )
    `)
    .order('created_at', { ascending: false })

  const totalRevenue = (orders ?? []).reduce((s, o) => s + (o.total_paid ?? 0), 0)
  const byPackage = (pkg: string) => (orders ?? []).filter((o) => o.package === pkg).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">{orders?.length ?? 0} total orders</p>
        </div>
        <div className="bg-blue-50 p-2.5 rounded-lg">
          <ShoppingBag className="h-5 w-5 text-blue-600" />
        </div>
      </div>

      {/* ORDER OPS READY marker */}
      <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-2 rounded-md text-xs font-bold tracking-widest text-center uppercase">
        ORDER OPS READY
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${(totalRevenue / 100).toFixed(0)}
            </p>
          </CardContent>
        </Card>
        {(['starter', 'professional', 'premium'] as const).map((pkg) => (
          <Card key={pkg}>
            <CardContent className="pt-5">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{pkg}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{byPackage(pkg)}</p>
              <p className="text-xs text-gray-400 mt-0.5">orders</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Add-ons</TableHead>
                <TableHead>Total Paid</TableHead>
                <TableHead>Order Ref</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!orders || orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                    <ShoppingBag className="mx-auto h-8 w-8 mb-2 opacity-30" />
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const client = order.clients as any
                  const userProfile = client?.users
                  return (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/clients/${order.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {order.company_name}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">{order.state}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-900">{userProfile?.full_name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{userProfile?.email ?? '—'}</p>
                      </TableCell>
                      <TableCell>
                        {order.package ? (
                          <Badge className={cn('text-xs border-0', PACKAGE_COLOR[order.package] ?? 'bg-gray-100 text-gray-600')}>
                            {PACKAGE_LABEL[order.package] ?? order.package}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {order.addons_total
                            ? `$${(order.addons_total / 100).toFixed(0)}`
                            : '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900 text-sm">
                          {order.total_paid
                            ? `$${(order.total_paid / 100).toFixed(0)}`
                            : '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-gray-500">
                          {order.order_reference ?? '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
