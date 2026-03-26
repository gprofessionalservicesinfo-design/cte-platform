'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react'

/* ─── Document requirements by client type ─────────────────────────────────
   Extend this list as intake requirements evolve.
   "received" state is session-only for now — wire to DB when a
   doc_checklist table is added.                                             */

const US_DOCS = [
  { id: 'gov_id',       label: 'Government-issued photo ID',        note: 'Passport or Driver\'s License' },
  { id: 'ssn_itin',     label: 'SSN or ITIN',                       note: 'Required for EIN filing' },
  { id: 'proof_addr',   label: 'Proof of US address',               note: 'Utility bill, lease, or bank statement' },
  { id: 'ein_auth',     label: 'EIN authorization form (SS-4)',     note: 'Signed by member/owner' },
  { id: 'op_agree',     label: 'Operating Agreement signature',     note: 'Signed copy required' },
]

const FOREIGN_DOCS = [
  { id: 'passport',     label: 'Passport (primary ID)',             note: 'Full color scan, all pages' },
  { id: 'foreign_addr', label: 'Proof of foreign address',          note: 'Bank statement or utility bill' },
  { id: 'itin_status',  label: 'ITIN / application status',         note: 'Provide existing ITIN or note "applying"' },
  { id: 'source_funds', label: 'Source of funds documentation',     note: 'Bank letter or accountant confirmation' },
  { id: 'ein_auth',     label: 'EIN authorization form (SS-4)',     note: 'Signed — admin files on client\'s behalf' },
  { id: 'op_agree',     label: 'Operating Agreement signature',     note: 'Digital signature acceptable' },
  { id: 'wire_info',    label: 'Preferred banking / wire info',     note: 'For Mercury or Relay account setup' },
]

interface DocItem {
  id: string
  label: string
  note: string
}

function DocRow({
  doc,
  received,
  onToggle,
}: {
  doc: DocItem
  received: boolean
  onToggle: () => void
}) {
  return (
    <li className="flex items-start gap-3 py-2.5 border-b last:border-0">
      <button
        onClick={onToggle}
        className="mt-0.5 flex-shrink-0 transition-colors"
        aria-label={received ? 'Mark pending' : 'Mark received'}
      >
        {received ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <Circle className="h-4 w-4 text-gray-300 hover:text-gray-400" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', received ? 'text-green-700 line-through decoration-green-400' : 'text-gray-800')}>
          {doc.label}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{doc.note}</p>
      </div>
      <span
        className={cn(
          'flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full',
          received
            ? 'bg-green-100 text-green-700'
            : 'bg-amber-100 text-amber-700'
        )}
      >
        {received ? 'Received' : 'Pending'}
      </span>
    </li>
  )
}

interface DocumentChecklistProps {
  /** 'us' or 'foreign' — pre-selects the correct tab */
  clientType?: 'us' | 'foreign' | null
}

export function DocumentChecklist({ clientType }: DocumentChecklistProps) {
  const defaultTab = clientType === 'us' ? 'us' : 'foreign'
  const [tab, setTab]       = useState<'us' | 'foreign'>(defaultTab)
  const [received, setReceived] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState(true)

  const docs = tab === 'us' ? US_DOCS : FOREIGN_DOCS
  const receivedCount = docs.filter((d) => received.has(d.id)).length

  function toggle(id: string) {
    setReceived((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-3">
      {/* DOCUMENT CENTER READY marker */}
      <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-1.5 rounded text-xs font-bold tracking-widest text-center uppercase">
        DOCUMENT CENTER READY
      </div>

      {/* Tab selector */}
      <div className="flex gap-2">
        {(['us', 'foreign'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setReceived(new Set()) }}
            className={cn(
              'flex-1 py-1.5 rounded-md text-xs font-semibold border transition-colors',
              tab === t
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            )}
          >
            {t === 'us' ? '🇺🇸 US Resident' : '🌎 Foreign Client'}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Documents received</span>
          <span className="font-semibold">{receivedCount} / {docs.length}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${(receivedCount / docs.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <span>Required Documents — {tab === 'us' ? 'US Resident' : 'Foreign Client'}</span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {expanded && (
          <ul className="px-3 py-1 bg-white">
            {docs.map((doc) => (
              <DocRow
                key={doc.id}
                doc={doc}
                received={received.has(doc.id)}
                onToggle={() => toggle(doc.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
