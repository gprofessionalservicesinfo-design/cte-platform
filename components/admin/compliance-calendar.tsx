'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, AlertTriangle, CheckCircle2, Clock, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface ComplianceEvent {
  id:         string
  company_id: string
  event_type: string
  due_date:   string
  status:     string
  notes:      string | null
  companies:  { company_name: string; id: string } | null
}

function getDaysUntil(dateStr: string): number {
  const now   = new Date()
  const due   = new Date(dateStr)
  const diffMs = due.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function StatusDot({ days, status }: { days: number; status: string }) {
  if (status === 'completed') return <CheckCircle2 className="h-4 w-4 text-green-500" />
  if (status === 'overdue' || days < 0) return <AlertTriangle className="h-4 w-4 text-red-500" />
  if (days <= 30) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
  return <Clock className="h-4 w-4 text-gray-400" />
}

function rowColor(days: number, status: string): string {
  if (status === 'completed') return 'bg-green-50 border-green-100'
  if (status === 'overdue' || days < 0) return 'bg-red-50 border-red-200'
  if (days <= 30) return 'bg-yellow-50 border-yellow-200'
  return 'bg-white border-gray-100'
}

export function ComplianceCalendar() {
  const [events,    setEvents]    = useState<ComplianceEvent[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState<'all' | 'pending' | 'overdue'>('pending')
  const [updating,  setUpdating]  = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/compliance-events?all=true')
    if (res.ok) {
      const { events: e } = await res.json()
      setEvents(e ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function markComplete(id: string) {
    setUpdating(id)
    await fetch('/api/admin/compliance-events', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'completed' }),
    })
    await load()
    setUpdating(null)
  }

  const filtered = events.filter(e => {
    const days = getDaysUntil(e.due_date)
    if (filter === 'overdue')  return days < 0 && e.status !== 'completed'
    if (filter === 'pending')  return e.status !== 'completed'
    return true
  })

  const overdue = events.filter(e => getDaysUntil(e.due_date) < 0 && e.status !== 'completed').length
  const soon    = events.filter(e => { const d = getDaysUntil(e.due_date); return d >= 0 && d <= 30 && e.status !== 'completed' }).length

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="font-semibold text-red-600">{overdue}</span>
          <span className="text-gray-500">overdue</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="font-semibold text-yellow-600">{soon}</span>
          <span className="text-gray-500">due within 30 days</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="w-2 h-2 rounded-full bg-gray-300" />
          <span className="text-gray-500">{events.length} total</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(['pending', 'all', 'overdue'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              filter === f ? 'bg-[#0A2540] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'pending' ? 'Active' : f === 'overdue' ? 'Overdue' : 'All'}
          </button>
        ))}
        <button onClick={load} className="ml-auto text-gray-400 hover:text-gray-600">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No compliance events found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(ev => {
            const days = getDaysUntil(ev.due_date)
            return (
              <div key={ev.id} className={`border rounded-lg p-3 flex items-center gap-3 ${rowColor(days, ev.status)}`}>
                <StatusDot days={days} status={ev.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800">{ev.event_type}</span>
                    {ev.companies && (
                      <Link
                        href={`/admin/clients/${ev.companies.id}`}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        {ev.companies.company_name}
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Due: {new Date(ev.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    {ev.status !== 'completed' && (
                      <span className={`ml-2 font-medium ${days < 0 ? 'text-red-600' : days <= 30 ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {days < 0 ? `${Math.abs(days)} days overdue` : `${days} days remaining`}
                      </span>
                    )}
                  </p>
                  {ev.notes && <p className="text-xs text-gray-400 italic mt-0.5">{ev.notes}</p>}
                </div>
                {ev.status !== 'completed' && (
                  <button
                    onClick={() => markComplete(ev.id)}
                    disabled={updating === ev.id}
                    className="shrink-0 text-xs bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 rounded-lg font-medium disabled:opacity-50"
                  >
                    {updating === ev.id ? '…' : 'Done'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
