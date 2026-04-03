'use client'

import { useState } from 'react'
import {
  ExternalLink, Building2, Hash, FileText,
  Mail, Landmark, Calculator, Calendar, BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SendEmailModal } from '@/components/admin/send-email-modal'
import { DocumentUpload } from '@/components/admin/document-upload'

/* ── SOS portals — keyed by 2-letter code AND full name ──────── */
const SOS_LINKS: Record<string, { label: string; href: string }> = {
  WY: { label: 'Wyoming SOS',       href: 'https://sos.wyo.gov/business/' },
  FL: { label: 'Florida SunBiz',    href: 'https://dos.myflorida.com/sunbiz/' },
  CO: { label: 'Colorado SOS',      href: 'https://www.sos.state.co.us/biz/' },
  DE: { label: 'Delaware Corporations', href: 'https://icis.corp.delaware.gov/' },
  TX: { label: 'Texas SOS',         href: 'https://www.sos.state.tx.us/corp/' },
  NM: { label: 'New Mexico SOS',    href: 'https://www.sos.nm.gov/business-services/' },
  NV: { label: 'Nevada SOS',        href: 'https://esos.nv.gov/EntitySearch/OnlineEntitySearch' },
  AZ: { label: 'Arizona SOS',       href: 'https://azsos.gov/business' },
  GA: { label: 'Georgia SOS',       href: 'https://ecorp.sos.ga.gov/' },
  NY: { label: 'New York DOS',      href: 'https://apps.dos.ny.gov/publicInquiry/' },
  CA: { label: 'California SOS',    href: 'https://bizfileonline.sos.ca.gov/' },
  // Full state names as fallback keys
  Wyoming:      { label: 'Wyoming SOS',       href: 'https://sos.wyo.gov/business/' },
  Florida:      { label: 'Florida SunBiz',    href: 'https://dos.myflorida.com/sunbiz/' },
  Colorado:     { label: 'Colorado SOS',      href: 'https://www.sos.state.co.us/biz/' },
  Delaware:     { label: 'Delaware Corporations', href: 'https://icis.corp.delaware.gov/' },
  Texas:        { label: 'Texas SOS',         href: 'https://www.sos.state.tx.us/corp/' },
  'New Mexico': { label: 'New Mexico SOS',    href: 'https://www.sos.nm.gov/business-services/' },
  Nevada:       { label: 'Nevada SOS',        href: 'https://esos.nv.gov/EntitySearch/OnlineEntitySearch' },
  Arizona:      { label: 'Arizona SOS',       href: 'https://azsos.gov/business' },
  Georgia:      { label: 'Georgia SOS',       href: 'https://ecorp.sos.ga.gov/' },
  'New York':   { label: 'New York DOS',      href: 'https://apps.dos.ny.gov/publicInquiry/' },
  California:   { label: 'California SOS',    href: 'https://bizfileonline.sos.ca.gov/' },
}

const ANNUAL_LINKS: Record<string, { label: string; href: string }> = {
  WY: { label: 'WY Annual Report',    href: 'https://wyobiz.wyo.gov/' },
  FL: { label: 'FL Annual Report',    href: 'https://dos.myflorida.com/sunbiz/maintain/fees/' },
  CO: { label: 'CO Periodic Report',  href: 'https://www.sos.state.co.us/biz/' },
  DE: { label: 'DE Franchise Tax',    href: 'https://icis.corp.delaware.gov/' },
  TX: { label: 'TX No Annual Report', href: 'https://www.sos.state.tx.us/corp/' },
  NM: { label: 'NM No Annual Report', href: 'https://www.sos.nm.gov/' },
  NV: { label: 'NV Annual List',      href: 'https://esos.nv.gov/' },
  // Full name keys
  Wyoming:    { label: 'WY Annual Report',    href: 'https://wyobiz.wyo.gov/' },
  Florida:    { label: 'FL Annual Report',    href: 'https://dos.myflorida.com/sunbiz/maintain/fees/' },
  Colorado:   { label: 'CO Periodic Report',  href: 'https://www.sos.state.co.us/biz/' },
  Delaware:   { label: 'DE Franchise Tax',    href: 'https://icis.corp.delaware.gov/' },
  Texas:      { label: 'TX No Annual Report', href: 'https://www.sos.state.tx.us/corp/' },
  'New Mexico': { label: 'NM No Annual Report', href: 'https://www.sos.nm.gov/' },
  Nevada:     { label: 'NV Annual List',      href: 'https://esos.nv.gov/' },
}

/* ── Badge helper ─────────────────────────────────────────────── */
function Badge({ label, color }: { label: string; color: 'gray' | 'blue' | 'green' | 'yellow' | 'red' }) {
  const cls = {
    gray:   'bg-gray-100 text-gray-600',
    blue:   'bg-blue-100 text-blue-700',
    green:  'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red:    'bg-red-100 text-red-700',
  }[color]
  return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>{label}</span>
}

/* ── External link button ─────────────────────────────────────── */
function ExtBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm" asChild>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
        {children}
      </a>
    </Button>
  )
}

/* ── Section header ───────────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, badge }: {
  icon: React.ElementType
  title: string
  badge?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
      <div className="flex items-center gap-2.5">
        <div className="bg-gray-100 rounded-md p-1.5">
          <Icon className="h-4 w-4 text-gray-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      {badge}
    </div>
  )
}

interface Props {
  company: {
    id: string
    company_name: string
    state: string | null
    state_code: string | null
    ein: string | null
    address_status: string | null
    banking_setup_enabled: boolean | null
    bookkeeping_status: string | null
    bookkeeping_tool_selected: string | null
    bookkeeping_notes: string | null
  }
  clientEmail: string
  clientName: string
  documents: any[]
}

export function OperationsHub({ company, clientEmail, clientName, documents }: Props) {
  const [bkStatus, setBkStatus]   = useState(company.bookkeeping_status ?? 'not_started')
  const [bkTool, setBkTool]       = useState(company.bookkeeping_tool_selected ?? 'none')
  const [bkNote, setBkNote]       = useState('')
  const [bkNotes, setBkNotes]     = useState(company.bookkeeping_notes ?? '')
  const [bkSaving, setBkSaving]   = useState(false)
  const [bkFeedback, setBkFeedback] = useState('')

  async function bkPatch(fields: Record<string, any>) {
    setBkSaving(true)
    setBkFeedback('')
    try {
      const res = await fetch('/api/admin/update-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, ...fields }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setBkFeedback('✓ Guardado')
    } catch (e: any) {
      setBkFeedback('Error: ' + e.message)
    } finally {
      setBkSaving(false)
      setTimeout(() => setBkFeedback(''), 3000)
    }
  }

  async function handleBkTool(tool: string) {
    await bkPatch({ bookkeeping_tool_selected: tool, bookkeeping_status: 'in_progress' })
    setBkTool(tool)
    setBkStatus('in_progress')
  }

  async function handleBkComplete() {
    await bkPatch({ bookkeeping_status: 'completed' })
    setBkStatus('completed')
  }

  async function handleBkNote() {
    if (!bkNote.trim()) return
    const updated = bkNotes ? bkNotes + '\n' + bkNote.trim() : bkNote.trim()
    await bkPatch({ bookkeeping_notes: updated })
    setBkNotes(updated)
    setBkNote('')
  }

  const bkStatusColor: 'gray' | 'blue' | 'green' =
    bkStatus === 'completed' ? 'green' : bkStatus === 'in_progress' ? 'blue' : 'gray'
  const bkStatusLabel =
    bkStatus === 'completed' ? 'Completado' : bkStatus === 'in_progress' ? 'En proceso' : 'No iniciado'

  const stateCode = (company.state_code ?? '').toUpperCase().trim()
  const stateName = (company.state ?? '').trim()
  const DEFAULT_SOS = { label: 'State SOS Portal', href: 'https://www.google.com/search?q=secretary+of+state+business+search' }
  const sos    = SOS_LINKS[stateCode] ?? SOS_LINKS[stateName] ?? DEFAULT_SOS
  const annual = ANNUAL_LINKS[stateCode] ?? ANNUAL_LINKS[stateName] ?? SOS_LINKS[stateCode] ?? SOS_LINKS[stateName] ?? { label: 'Annual Report', href: `https://www.google.com/search?q=${stateName || stateCode}+LLC+annual+report` }

  /* Derived statuses */
  const einStatus   = company.ein ? 'green' : 'yellow'
  const einLabel    = company.ein ? 'Completado' : 'Pendiente'
  const addrStatus  = company.address_status
  const addrColor   = addrStatus === 'active' ? 'green' : addrStatus === 'in_progress' || addrStatus === 'awaiting_client' ? 'blue' : addrStatus === 'issue' ? 'red' : 'gray'
  const addrLabel   = addrStatus === 'active' ? 'Activo' : addrStatus === 'in_progress' ? 'En proceso' : addrStatus === 'awaiting_client' ? 'Esperando cliente' : addrStatus === 'issue' ? 'Problema' : 'No contratado'
  const bankColor   = company.banking_setup_enabled ? 'green' : 'gray'
  const bankLabel   = company.banking_setup_enabled ? 'Habilitado' : 'No habilitado'

  return (
    <div className="space-y-6">

      {/* 1 — Company Formation */}
      <Card className="shadow-sm">
        <CardContent className="pt-5 pb-5">
          <SectionHeader icon={Building2} title="Company Formation"
            badge={<Badge label="SOS Filing" color="gray" />} />
          <div className="flex flex-wrap gap-3">
            <ExtBtn href={sos.href}>{sos.label}</ExtBtn>
          </div>
        </CardContent>
      </Card>

      {/* 2 — EIN */}
      <Card className="shadow-sm">
        <CardContent className="pt-5 pb-5">
          <SectionHeader icon={Hash} title="EIN / Tax ID"
            badge={<Badge label={einLabel} color={einStatus} />} />
          <div className="flex flex-wrap gap-3">
            <ExtBtn href="https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online">
              Apply EIN Online (IRS)
            </ExtBtn>
            <ExtBtn href="https://www.irs.gov/pub/irs-pdf/fss4.pdf">
              EIN by Fax (SS-4)
            </ExtBtn>
          </div>
        </CardContent>
      </Card>

      {/* 3 — ITIN */}
      <Card className="shadow-sm">
        <CardContent className="pt-5 pb-5">
          <SectionHeader icon={FileText} title="ITIN (Form W-7)"
            badge={<Badge label="Opcional" color="gray" />} />
          <div className="flex flex-wrap gap-3">
            <ExtBtn href="https://www.irs.gov/forms-pubs/about-form-w-7">Open Form W-7</ExtBtn>
            <ExtBtn href="https://www.irs.gov/individuals/international-taxpayers/acceptance-agent-program">Find CAA Near Me</ExtBtn>
          </div>
        </CardContent>
      </Card>

      {/* 4 — Business Address */}
      <Card className="shadow-sm">
        <CardContent className="pt-5 pb-5">
          <SectionHeader icon={Mail} title="Business Address (VPM)"
            badge={<Badge label={addrLabel} color={addrColor} />} />
          <div className="flex flex-wrap gap-3">
            <ExtBtn href="https://www.virtualpostmail.com/login">Open VPM Dashboard</ExtBtn>
            <ExtBtn href="https://www.virtualpostmail.com/signup">Create VPM Account</ExtBtn>
          </div>
        </CardContent>
      </Card>

      {/* 5 — Banking */}
      <Card className="shadow-sm">
        <CardContent className="pt-5 pb-5">
          <SectionHeader icon={Landmark} title="Banking Setup"
            badge={<Badge label={bankLabel} color={bankColor} />} />
          <div className="flex flex-wrap gap-3">
            <ExtBtn href="https://relayfi.com">Relay</ExtBtn>
            <ExtBtn href="https://mercury.com">Mercury</ExtBtn>
            <ExtBtn href="https://wise.com/us/business/">Wise Business</ExtBtn>
            <ExtBtn href="https://stripe.com/atlas">Stripe Atlas</ExtBtn>
            <ExtBtn href="https://www.payoneer.com">Payoneer</ExtBtn>
          </div>
        </CardContent>
      </Card>

      {/* 6 — Taxes & Compliance */}
      <Card className="shadow-sm">
        <CardContent className="pt-5 pb-5">
          <SectionHeader icon={Calculator} title="Taxes & Compliance" />
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <ExtBtn href="https://www.irs.gov/businesses">IRS Tax Center</ExtBtn>
            </div>
            <div className="border-t pt-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Upload Tax Docs</p>
              <DocumentUpload companyId={company.id} initialDocs={documents} />
            </div>
            <div className="border-t pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Send to CPA</p>
              <SendEmailModal
                clientEmail={clientEmail}
                clientName={clientName}
                companyId={company.id}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7 — Annual Compliance */}
      <Card className="shadow-sm">
        <CardContent className="pt-5 pb-5">
          <SectionHeader icon={Calendar} title="Annual Compliance"
            badge={<Badge label="Upcoming" color="yellow" />} />
          <div className="flex flex-wrap gap-3">
            <ExtBtn href={annual.href}>{annual.label}</ExtBtn>
            <ExtBtn href={sos.href}>Check Good Standing</ExtBtn>
          </div>
        </CardContent>
      </Card>

      {/* 8 — Accounting & Bookkeeping (only when EIN exists) */}
      {company.ein && (
        <Card className="shadow-sm">
          <CardContent className="pt-5 pb-5">
            <SectionHeader icon={BookOpen} title="Accounting & Bookkeeping"
              badge={
                <div className="flex items-center gap-2">
                  {bkFeedback && <span className="text-xs text-gray-400">{bkFeedback}</span>}
                  <Badge label={bkStatusLabel} color={bkStatusColor} />
                </div>
              }
            />

            {/* 3-card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              {/* QuickBooks */}
              <div className={`border rounded-xl p-5 space-y-3 min-h-[140px] shadow-sm transition-colors ${bkTool === 'quickbooks' ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">QuickBooks</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Popular</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">Track income, expenses and prepare for taxes.</p>
                <Button variant="outline" size="sm" className="w-full h-9 gap-1.5" asChild
                  onClick={() => handleBkTool('quickbooks')}>
                  <a href="https://quickbooks.intuit.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                    Open QuickBooks →
                  </a>
                </Button>
              </div>

              {/* Xero */}
              <div className={`border rounded-xl p-5 space-y-3 min-h-[140px] shadow-sm transition-colors ${bkTool === 'xero' ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Xero</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Digital</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">Modern accounting for online businesses and international founders.</p>
                <Button variant="outline" size="sm" className="w-full h-9 gap-1.5" asChild
                  onClick={() => handleBkTool('xero')}>
                  <a href="https://xero.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                    Open Xero →
                  </a>
                </Button>
              </div>

              {/* CPA Support */}
              <div className={`border rounded-xl p-5 space-y-3 min-h-[140px] shadow-sm transition-colors ${bkTool === 'cpa' ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                <p className="text-sm font-semibold text-gray-900">CPA Support</p>
                <p className="text-xs text-gray-500 leading-relaxed">Upload docs in the Taxes section below, then mark as sent to your CPA.</p>
                <Button variant="outline" size="sm" className="w-full h-9" disabled={bkSaving}
                  onClick={() => handleBkTool('cpa')}>
                  📤 Mark as Sent to CPA
                </Button>
              </div>
            </div>

            {/* Complete action */}
            {bkStatus !== 'completed' && (
              <div className="flex flex-wrap gap-3 pb-4 border-b">
                <Button size="sm" className="h-9 bg-green-600 hover:bg-green-700 text-white" disabled={bkSaving}
                  onClick={handleBkComplete}>
                  ✅ Mark as Completed
                </Button>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-3 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">📝 Notes</p>
              {bkNotes && (
                <pre className="text-xs text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap font-sans border border-gray-100">
                  {bkNotes}
                </pre>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bkNote}
                  onChange={e => setBkNote(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleBkNote()}
                  placeholder="Add note…"
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <Button size="sm" className="h-9" onClick={handleBkNote} disabled={bkSaving || !bkNote.trim()}>
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
