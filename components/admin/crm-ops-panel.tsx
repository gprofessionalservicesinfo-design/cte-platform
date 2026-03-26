'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Bell, CalendarClock, TrendingUp, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp
} from 'lucide-react'

/* ─── Future Obligations ────────────────────────────────────────────────────
   Dates are illustrative — wire to company.formation_date + state rules
   when DB support is added.                                                 */
const FUTURE_OBLIGATIONS = [
  { id: 'annual_report',  label: 'Annual Report / BOI Filing',    when: '1 year from formation', priority: 'high' },
  { id: 'reg_agent',      label: 'Registered Agent Renewal',      when: '1 year from formation', priority: 'medium' },
  { id: 'franchise_tax',  label: 'State Franchise Tax',           when: 'Depends on state',      priority: 'medium' },
  { id: 'fed_taxes',      label: 'Federal Tax Return (1065/1120)', when: 'April 15 annually',    priority: 'high' },
  { id: 'ein_use',        label: 'First EIN Use / Bank Account',  when: 'Within 60 days',        priority: 'low' },
]

/* ─── Upsell Opportunities ──────────────────────────────────────────────────
   These map to the add-ons defined in config.js / precios.html.           */
const UPSELL_ITEMS = [
  { id: 'bank',     label: 'Bank Account Setup (Mercury/Relay)',   pkg: ['starter'] },
  { id: 'boi',      label: 'BOI / FinCEN Filing',                 pkg: ['starter', 'professional'] },
  { id: 'annual',   label: 'Annual Report Service',               pkg: ['starter', 'professional'] },
  { id: 'address',  label: 'Commercial US Address',               pkg: ['starter', 'professional'] },
  { id: 'tax',      label: 'Tax Advisory Session',                pkg: ['starter', 'professional'] },
  { id: 'itin',     label: 'ITIN Application (Foreign clients)',  pkg: ['starter', 'professional', 'premium'] },
]

const PRIORITY_STYLE: Record<string, string> = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-gray-100 text-gray-500',
}

interface CrmOpsPanelProps {
  companyId:   string
  currentPkg?: string | null
  country?:    string | null
  clientName?: string | null
}

export function CrmOpsPanel({ companyId, currentPkg, country, clientName }: CrmOpsPanelProps) {
  const [followUpNote, setFollowUpNote] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [reminders, setReminders]       = useState<{ date: string; note: string }[]>([])
  const [savedMsg, setSavedMsg]         = useState(false)
  const [obligationsOpen, setObligationsOpen] = useState(true)
  const [upsellOpen, setUpsellOpen]     = useState(true)

  const isForeign = country && !['US', 'USA', 'United States'].includes(country.trim())
  const eligibleUpsells = UPSELL_ITEMS.filter((u) =>
    !currentPkg || u.pkg.includes(currentPkg)
  )

  function saveFollowUp() {
    if (!followUpNote && !followUpDate) return
    setReminders((prev) => [...prev, { date: followUpDate, note: followUpNote }])
    setFollowUpNote('')
    setFollowUpDate('')
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2000)
  }

  return (
    <div className="space-y-5">
      {/* ── Follow-Up Reminder ─────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5" />
          Follow-Up Reminder
        </p>
        <div className="space-y-2">
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            value={followUpNote}
            onChange={(e) => setFollowUpNote(e.target.value)}
            placeholder="Follow-up action or note…"
            rows={2}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={saveFollowUp}
            className="w-full py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            {savedMsg ? '✓ Saved' : 'Add Reminder'}
          </button>
        </div>

        {reminders.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {reminders.map((r, i) => (
              <li key={i} className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-md px-3 py-2 text-xs">
                <CalendarClock className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  {r.date && <p className="font-medium text-blue-700">{r.date}</p>}
                  <p className="text-gray-700">{r.note}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Client Context ─────────────────────────────────────────── */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm space-y-1.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Client Context</p>
        <div className="flex justify-between">
          <span className="text-gray-500">Package</span>
          <span className="font-medium capitalize">{currentPkg ?? '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Country</span>
          <span className="font-medium">{country ?? '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Client type</span>
          <span className={cn('font-medium', isForeign ? 'text-amber-600' : 'text-blue-600')}>
            {isForeign ? '🌎 Foreign' : '🇺🇸 US Resident'}
          </span>
        </div>
      </div>

      {/* ── Future Obligations ─────────────────────────────────────── */}
      <div>
        <button
          onClick={() => setObligationsOpen((o) => !o)}
          className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
        >
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            Future Obligations
          </span>
          {obligationsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {obligationsOpen && (
          <ul className="space-y-1.5">
            {FUTURE_OBLIGATIONS.map((ob) => (
              <li key={ob.id} className="flex items-start gap-2 border border-gray-100 rounded-md px-3 py-2 bg-white">
                <AlertTriangle className={cn('h-3.5 w-3.5 mt-0.5 flex-shrink-0', ob.priority === 'high' ? 'text-red-400' : 'text-amber-400')} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{ob.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{ob.when}</p>
                </div>
                <span className={cn('text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0', PRIORITY_STYLE[ob.priority])}>
                  {ob.priority}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Upsell / Cross-Sell ────────────────────────────────────── */}
      <div>
        <button
          onClick={() => setUpsellOpen((o) => !o)}
          className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2"
        >
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            Upsell Opportunities
          </span>
          {upsellOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {upsellOpen && (
          <ul className="space-y-1.5">
            {eligibleUpsells.length === 0 ? (
              <li className="text-xs text-gray-400 italic text-center py-3">
                Client has Premium — all add-ons included.
              </li>
            ) : (
              eligibleUpsells.map((u) => (
                <li key={u.id} className="flex items-center gap-2 border border-green-100 bg-green-50 rounded-md px-3 py-2">
                  <TrendingUp className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 flex-1">{u.label}</span>
                  <span className="text-xs text-green-600 font-medium">Offer</span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
