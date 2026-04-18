'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Download, RefreshCw, Filter } from 'lucide-react'
import Link from 'next/link'

const DOC_LABELS: Record<string, string> = {
  articles:              'Articles of Organization',
  operating_agreement:   'Operating Agreement',
  ein_letter:            'EIN Letter',
  formation_certificate: 'Certificate of Formation',
  annual_report:         'Annual Report',
  other:                 'Other',
}

const STATUS_STYLES: Record<string, string> = {
  approved:          'bg-green-100  text-green-700',
  pending_approval:  'bg-yellow-100 text-yellow-700',
  draft:             'bg-gray-100   text-gray-600',
  rejected:          'bg-red-100    text-red-700',
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatFileSize(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

interface Doc {
  id:              string
  type:            string
  file_name:       string
  file_size:       number | null
  status:          string
  approval_status: string | null
  created_at:      string
  companies:       { company_name: string; id: string } | null
}

export default function AdminDocumentsPage() {
  const [docs,       setDocs]       = useState<Doc[]>([])
  const [loading,    setLoading]    = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  async function load(quiet = false) {
    if (!quiet) setLoading(true)
    else setRefreshing(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('documents')
      .select('id, type, file_name, file_size, status, approval_status, created_at, companies(company_name, id)')
      .order('created_at', { ascending: false })
      .limit(500)
    setDocs((data ?? []) as any[])
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  const filtered = docs.filter(d => {
    if (filterType !== 'all' && d.type !== filterType) return false
    if (filterStatus === 'pending' && d.approval_status !== 'pending_approval') return false
    if (filterStatus === 'approved' && d.approval_status !== 'approved') return false
    if (filterStatus === 'draft' && d.status !== 'draft') return false
    return true
  })

  // Stats
  const now = new Date()
  const thisMonth = docs.filter(d => {
    const dt = new Date(d.created_at)
    return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth()
  })
  const statsApprovedThisMonth = thisMonth.filter(d => d.approval_status === 'approved').length
  const statsPending           = docs.filter(d => d.approval_status === 'pending_approval').length
  const statsTotal             = docs.length

  const docTypes = Array.from(new Set(docs.map(d => d.type)))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Documents</h1>
          <p className="text-gray-500 mt-1 text-sm">{statsTotal} documents total</p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing} className="text-gray-400 hover:text-gray-600">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{statsTotal}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total generados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{statsPending}</p>
            <p className="text-xs text-gray-500 mt-0.5">Pendientes aprobación</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-2xl font-bold text-green-600">{statsApprovedThisMonth}</p>
            <p className="text-xs text-gray-500 mt-0.5">Aprobados este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="h-3.5 w-3.5 text-gray-400" />
        <div className="flex gap-1 flex-wrap">
          {(['all', ...docTypes]).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filterType === t ? 'bg-[#0A2540] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {t === 'all' ? 'All types' : DOC_LABELS[t] ?? t}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-2">
          {[
            { v: 'all',      l: 'Any status' },
            { v: 'pending',  l: 'Pending' },
            { v: 'approved', l: 'Approved' },
            { v: 'draft',    l: 'Draft' },
          ].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setFilterStatus(v)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${filterStatus === v ? 'bg-[#0A2540] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="mx-auto h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No documents found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">File</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Size</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(doc => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {DOC_LABELS[doc.type] ?? doc.type}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {doc.companies ? (
                          <Link href={`/admin/clients/${doc.companies.id}`} className="hover:text-blue-600 hover:underline">
                            {doc.companies.company_name}
                          </Link>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-[200px] truncate">
                        {doc.file_name}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[doc.approval_status ?? doc.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {doc.approval_status ?? doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {doc.file_size ? formatFileSize(doc.file_size) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <a href={`/api/documents/download/${doc.id}`} target="_blank" rel="noreferrer"
                          className="text-gray-400 hover:text-blue-600">
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
