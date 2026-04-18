'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { STATUS_LABELS } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2, CheckCircle2, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const STATUSES = ['name_check', 'articles_filed', 'ein_processing', 'completed'] as const
type Status = (typeof STATUSES)[number]

interface StatusHistoryItem {
  id: string
  old_status: string | null
  new_status: string
  note: string | null
  created_at: string
  users?: { full_name: string | null } | null
}

interface StatusWorkflowProps {
  companyId: string
  currentStatus: string
  statusHistory?: StatusHistoryItem[]
}

export function StatusWorkflow({ companyId, currentStatus, statusHistory = [] }: StatusWorkflowProps) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState<string | null>(null)

  async function updateStatus(newStatus: Status) {
    if (newStatus === status) return
    setLoading(newStatus)

    const supabase = createClient()
    const { error } = await supabase
      .from('companies')
      .update({ status: newStatus })
      .eq('id', companyId)

    if (error) {
      toast.error('Failed to update status: ' + error.message)
      setLoading(null)
      return
    }

    setStatus(newStatus)
    toast.success(`Status updated to "${STATUS_LABELS[newStatus]}"`)

    // Auto-create compliance events when company is completed
    if (newStatus === 'completed') {
      const nextYear = new Date()
      nextYear.setFullYear(nextYear.getFullYear() + 1)
      const dueDateStr = nextYear.toISOString().split('T')[0]
      try {
        await Promise.all([
          fetch('/api/admin/compliance-events', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              company_id: companyId,
              event_type: 'Annual Report Filing',
              due_date:   dueDateStr,
              notes:      'Auto-created on formation completion',
            }),
          }),
          fetch('/api/admin/compliance-events', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              company_id: companyId,
              event_type: 'Registered Agent Renewal',
              due_date:   dueDateStr,
              notes:      'Auto-created on formation completion',
            }),
          }),
        ])
      } catch {
        // Non-fatal
      }
    }

    setLoading(null)
  }

  const STATUS_ORDER: Record<string, number> = {
    name_check: 0,
    articles_filed: 1,
    ein_processing: 2,
    completed: 3,
  }

  const currentIndex = STATUS_ORDER[status] ?? 0

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">Update Formation Status</p>
      <div className="grid grid-cols-2 gap-2">
        {STATUSES.map((s) => {
          const isActive = s === status
          const isCompleted = STATUS_ORDER[s] < currentIndex
          const isLoading = loading === s

          return (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={loading !== null || isActive}
              className={cn(
                'relative flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all text-left',
                isActive && 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500',
                isCompleted && !isActive && 'border-green-200 bg-green-50 text-green-700',
                !isActive &&
                  !isCompleted &&
                  'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                loading !== null && 'opacity-60 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
              ) : isCompleted ? (
                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
              ) : (
                <span
                  className={cn(
                    'h-3.5 w-3.5 rounded-full border-2 flex-shrink-0',
                    isActive ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  )}
                />
              )}
              <span className="truncate">{STATUS_LABELS[s]}</span>
              {isActive && (
                <span className="absolute right-2 text-xs text-blue-500 font-normal">current</span>
              )}
            </button>
          )
        })}
      </div>
      {/* Status history timeline */}
      {statusHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            History
          </p>
          <ol className="space-y-2.5">
            {statusHistory.map((entry) => (
              <li key={entry.id} className="flex gap-3 text-xs">
                <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
                </span>
                <div>
                  <span className="font-medium text-gray-700">
                    {STATUS_LABELS[entry.new_status] ?? entry.new_status}
                  </span>
                  {entry.note && (
                    <p className="text-gray-500 mt-0.5">{entry.note}</p>
                  )}
                  <p className="text-gray-400 mt-0.5">{formatDate(entry.created_at)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
