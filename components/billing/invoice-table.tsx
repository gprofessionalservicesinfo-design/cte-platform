import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download, ExternalLink } from 'lucide-react'
import {
  formatAmount,
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_COLOR,
} from '@/lib/billing'
import { formatDate } from '@/lib/utils'

export interface InvoiceRow {
  id:                  string
  invoice_number:      string | null
  description:         string | null
  status:              string
  amount_paid:         number
  amount_due:          number
  currency:            string
  paid_at:             string | null
  created_at:          string
  invoice_pdf_url:     string | null
  hosted_invoice_url:  string | null
  line_items:          Array<{ description: string; amount: number; currency: string }> | null
}

interface InvoiceTableProps {
  invoices: InvoiceRow[]
  showDownload?: boolean
}

export function InvoiceTable({ invoices, showDownload = true }: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 py-12 text-center">
        <FileText className="mx-auto h-8 w-8 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500 font-medium">No invoices yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Your invoices will appear here after your first payment.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-xs">Invoice</TableHead>
            <TableHead className="text-xs">Description</TableHead>
            <TableHead className="text-xs">Date</TableHead>
            <TableHead className="text-xs text-right">Amount</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            {showDownload && <TableHead className="text-xs w-24" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => {
            const amount = inv.status === 'paid' ? inv.amount_paid : inv.amount_due
            const date   = inv.paid_at ?? inv.created_at

            return (
              <TableRow key={inv.id} className="text-sm">
                <TableCell className="font-mono text-xs text-gray-500">
                  {inv.invoice_number ?? `#${inv.id.slice(0, 8)}`}
                </TableCell>
                <TableCell className="text-gray-700 max-w-[200px] truncate">
                  {inv.description ?? inv.line_items?.[0]?.description ?? '—'}
                </TableCell>
                <TableCell className="text-gray-500 whitespace-nowrap">
                  {formatDate(date)}
                </TableCell>
                <TableCell className="text-right font-semibold text-gray-900 whitespace-nowrap">
                  {formatAmount(amount, inv.currency)}
                </TableCell>
                <TableCell>
                  <Badge
                    className={`text-xs font-medium border-0 ${
                      INVOICE_STATUS_COLOR[inv.status] ?? 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {INVOICE_STATUS_LABEL[inv.status] ?? inv.status}
                  </Badge>
                </TableCell>
                {showDownload && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {inv.invoice_pdf_url && (
                        <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                          <a href={inv.invoice_pdf_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                      {inv.hosted_invoice_url && (
                        <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                          <a href={inv.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
