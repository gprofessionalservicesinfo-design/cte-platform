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
  package: string | null
  ein: string | null
  created_at: string
  stripe_customer_id: string | null
  onboarding_completed: boolean | null
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
  { value: 'all', label: 'Todos los estados' },
  { value: 'name_check', label: 'Name Check' },
  { value: 'articles_filed', label: 'Articles Filed' },
  { value: 'ein_processing', label: 'EIN Processing' },
  { value: 'completed', label: 'Completed' },
]

const PACKAGE_OPTIONS = [
  { value: 'all', label: 'Todos los paquetes' },
  { value: 'basic', label: 'Basic' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
]

const STATE_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'WY', label: 'Wyoming (WY)' },
  { value: 'DE', label: 'Delaware (DE)' },
  { value: 'FL', label: 'Florida (FL)' },
  { value: 'CO', label: 'Colorado (CO)' },
  { value: 'TX', label: 'Texas (TX)' },
]

export function ClientTable({ clients }: ClientTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [packageFilter, setPackageFilter] = useState('all')
  const [stateFilter, setStateFilter] = useState('all')
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

    if (packageFilter !== 'all') {
      result = result.filter((c) => c.package === packageFilter)
    }

    if (stateFilter !== 'all') {
      result = result.filter((c) => c.state === stateFilter)
    }

    result.sort((a, b) => {
      const aVal = String(a[sortKey] ?? '')
      const bVal = String(b[sortKey] ?? '')
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    })

    return result
  }, [clients, search, statusFilter, packageFilter, stateFilter, sortKey, sortDir])

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

  function handlePackageChange(value: string) {
    setPackageFilter(value)
    setPage(1)
  }

  function handleStateChange(value: string) {
    setStateFilter(value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por empresa, email o nombre…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={packageFilter} onValueChange={handlePackageChange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Paquete" />
          </SelectTrigger>
          <SelectContent>
            {PACKAGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stateFilter} onValueChange={handleStateChange}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {STATE_OPTIONS.map((opt) => (
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
              <TableHead>Onboarding</TableHead>
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
                <TableCell colSpan={8} className="text-center py-10 text-gray-400">
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
                    {client.onboarding_completed
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Onboarding ✅</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Pendiente ⚠️</span>
                    }
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
          Mostrando {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} clientes
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
