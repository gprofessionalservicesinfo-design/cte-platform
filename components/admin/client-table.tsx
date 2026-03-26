'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/client/status-badge'
import { formatDate } from '@/lib/utils'
import { Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react'

interface ClientRow {
  id: string
  company_name: string
  state: string
  status: string
  ein: string | null
  created_at: string
  stripe_customer_id: string | null
  clients: {
    users: {
      full_name: string | null
      email: string
    } | null
  } | null
}

interface ClientTableProps {
  clients: ClientRow[]
}

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'name_check', label: 'Name Check' },
  { value: 'articles_filed', label: 'Articles Filed' },
  { value: 'ein_processing', label: 'EIN Processing' },
  { value: 'completed', label: 'Completed' },
]

export function ClientTable({ clients }: ClientTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<keyof ClientRow>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = useMemo(() => {
    let result = [...clients]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.company_name.toLowerCase().includes(q) ||
          c.clients?.users?.email.toLowerCase().includes(q) ||
          c.clients?.users?.full_name?.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter)
    }

    result.sort((a, b) => {
      const aVal = String(a[sortKey] ?? '')
      const bVal = String(b[sortKey] ?? '')
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    })

    return result
  }, [clients, search, statusFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleSort(key: keyof ClientRow) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by company or email…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort('company_name' as keyof ClientRow)}
              >
                Company
              </TableHead>
              <TableHead>Client</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>EIN</TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort('created_at' as keyof ClientRow)}
              >
                Created
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                  No clients found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.company_name}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {client.clients?.users?.full_name ?? '—'}
                      </p>
                      <p className="text-xs text-gray-500">{client.clients?.users?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{client.state}</TableCell>
                  <TableCell>
                    <StatusBadge status={client.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">{client.ein ?? '—'}</span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(client.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/clients/${client.id}`}>
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <p>
          Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} clients
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
