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

/* ── SOS portals by state ─────────────────────────────────────── */
const SOS_LINKS: Record<string, { label: string; href: string }> = {
  WY: { label: 'Wyoming SOS',    href: 'https://sos.wyo.gov/business/' },
  FL: { label: 'Florida SunBiz', href: 'https://dos.myflorida.com/sunbiz/' },
  CO: { label: 'Colorado SOS',   href: 'https://www.sos.state.co.us/biz/' },
  DE: { label: 'Delaware SOS',   href: 'https://icis.corp.delaware.gov/' },
  TX: { label: 'Texas SOS',      href: 'https://www.sos.state.tx.us/corp/' },
  NM: { label: 'New Mexico SOS', href: 'https://www.sos.nm.gov/business-services/' },
  NV: { label: 'Nevada SOS',     href: 'https://esos.nv.gov/EntitySearch/OnlineEntitySearch' },
  AZ: { label: 'Arizona SOS',    href: 'https://azsos.gov/business' },
  GA: { label: 'Georgia SOS',    href: 'https://ecorp.sos.ga.gov/' },
  NY: { label: 'New York DOS',   href: 'https://apps.dos.ny.gov/publicInquiry/' },
  CA: { label: 'California SOS', href: 'https://bizfileonline.sos.ca.gov/' },
  TX2: { label: 'Texas SOS',     href: 'https://www.sos.state.tx.us/corp/' },
}

const ANNUAL_LINKS: Record<string, { label: string; href: string }> = {
  WY: { label: 'WY Annual Report', href: 'https://wyobiz.wyo.gov/' },
  FL: { label: 'FL Annual Report', href: 'https://dos.myflorida.com/sunbiz/maintain/fees/' },
  CO: { label: 'CO Periodic Report', href: 'https://www.sos.state.co.us/biz/' },
  DE: { label: 'DE Franchise Tax',   href: 'https://icis.corp.delaware.gov/' },
  TX: { label: 'TX No Annual Report', href: 'https://www.sos.state.tx.us/corp/' },
  NM: { label: 'NM No Annual Report', href: 'https://www.sos.nm.gov/' },
  NV: { label: 'NV Annual List',      href: 'https://esos.nv.gov/' },
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
    <Button variant="outline" size="sm" asChild>
      <a href={href} target="_blank" rel="noopener noreferrer" className="gap-1.5">
        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
        {children}
      </a>
    </Button>
  )
}

interface Props {
  company: {
    id: string
    company_name: string
    state: string | null
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

  const stateCode = (company.state ?? '').toUpperCase()
  const sos = SOS_LINKS[stateCode] ?? { label: 'State SOS Portal', href: `https://www.google.com/search?q=${stateCode}+secretary+of+state+LLC+filing` }
  const annual = ANNUAL_LINKS[stateCode] ?? SOS_LINKS[stateCode] ?? { label: 'Annual Report', href: `https://www.google.com/search?q=${stateCode}+LLC+annual+report` }

  /* Derived statuses */
  const einStatus   = company.ein ? 'green' : 'yellow'
  const einLabel    = company.ein ? 'Completado' : 'Pendiente'
  const addrStatus  = company.address_status
  const addrColor   = addrStatus === 'active' ? 'green' : addrStatus === 'in_progress' || addrStatus === 'awaiting_client' ? 'blue' : addrStatus === 'issue' ? 'red' : 'gray'
  const addrLabel   = addrStatus === 'active' ? 'Activo' : addrStatus === 'in_progress' ? 'En proceso' : addrStatus === 'awaiting_client' ? 'Esperando cliente' : addrStatus === 'issue' ? 'Problema' : 'No contratado'
  const bankColor   = company.banking_setup_enabled ? 'green' : 'gray'
  const bankLabel   = company.banking_setup_enabled ? 'Habilitado' : 'No habilitado'

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* 1 — Company Formation */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500" /> Company Formation
            </CardTitle>
            <Badge label="SOS Filing" color="gray" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <ExtBtn href={sos.href}>{sos.label}</ExtBtn>
        </CardContent>
      </Card>

      {/* 2 — EIN */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-500" /> EIN / Tax ID
            </CardTitle>
            <Badge label={einLabel} color={einStatus} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <ExtBtn href="https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online">
            Apply EIN Online (IRS)
          </ExtBtn>
          <ExtBtn href="https://www.irs.gov/pub/irs-pdf/fss4.pdf">
            EIN by Fax (SS-4)
          </ExtBtn>
        </CardContent>
      </Card>

      {/* 3 — ITIN */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" /> ITIN (Form W-7)
            </CardTitle>
            <Badge label="Opcional" color="gray" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <ExtBtn href="https://www.irs.gov/forms-pubs/about-form-w-7">Open Form W-7</ExtBtn>
          <ExtBtn href="https://www.irs.gov/individuals/international-taxpayers/acceptance-agent-program">Find CAA Near Me</ExtBtn>
        </CardContent>
      </Card>

      {/* 4 — Business Address */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" /> Business Address (VPM)
            </CardTitle>
            <Badge label={addrLabel} color={addrColor} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <ExtBtn href="https://www.virtualpostmail.com/login">Open VPM Dashboard</ExtBtn>
          <ExtBtn href="https://www.virtualpostmail.com/signup">Create VPM Account</ExtBtn>
        </CardContent>
      </Card>

      {/* 5 — Banking */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Landmark className="h-4 w-4 text-gray-500" /> Banking Setup
            </CardTitle>
            <Badge label={bankLabel} color={bankColor} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <ExtBtn href="https://relayfi.com">Relay</ExtBtn>
          <ExtBtn href="https://mercury.com">Mercury</ExtBtn>
          <ExtBtn href="https://wise.com/us/business/">Wise Business</ExtBtn>
          <ExtBtn href="https://stripe.com/atlas">Stripe Atlas</ExtBtn>
          <ExtBtn href="https://www.payoneer.com">Payoneer</ExtBtn>
        </CardContent>
      </Card>

      {/* 6 — Taxes & Compliance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="h-4 w-4 text-gray-500" /> Taxes & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <ExtBtn href="https://www.irs.gov/businesses">IRS Tax Center</ExtBtn>
          </div>
          <div className="border-t pt-3 space-y-2">
            <p className="text-xs font-medium text-gray-500">Upload Tax Docs</p>
            <DocumentUpload companyId={company.id} initialDocs={documents} />
          </div>
          <div className="border-t pt-3">
            <p className="text-xs font-medium text-gray-500 mb-2">Send to CPA</p>
            <SendEmailModal
              clientEmail={clientEmail}
              clientName={clientName}
              companyId={company.id}
            />
          </div>
        </CardContent>
      </Card>

      {/* 7 — Annual Compliance */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" /> Annual Compliance
            </CardTitle>
            <Badge label="Upcoming" color="yellow" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <ExtBtn href={annual.href}>{annual.label}</ExtBtn>
          <ExtBtn href={sos.href}>Check Good Standing</ExtBtn>
        </CardContent>
      </Card>

    </div>

    {/* 8 — Accounting & Bookkeeping (only when EIN exists) */}
    {company.ein && (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-500" /> Accounting & Bookkeeping
            </CardTitle>
            <div className="flex items-center gap-2">
              {bkFeedback && <span className="text-xs text-gray-400">{bkFeedback}</span>}
              <Badge label={bkStatusLabel} color={bkStatusColor} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 3-card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* QuickBooks */}
            <div className={`border rounded-lg p-3 space-y-2 transition-colors ${bkTool === 'quickbooks' ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">QuickBooks</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Popular</span>
              </div>
              <p className="text-xs text-gray-500">Track income, expenses and prepare for taxes.</p>
              <Button variant="outline" size="sm" className="w-full gap-1.5" asChild
                onClick={() => handleBkTool('quickbooks')}>
                <a href="https://quickbooks.intuit.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                  Open QuickBooks →
                </a>
              </Button>
            </div>

            {/* Xero */}
            <div className={`border rounded-lg p-3 space-y-2 transition-colors ${bkTool === 'xero' ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Xero</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Digital</span>
              </div>
              <p className="text-xs text-gray-500">Modern accounting for online businesses and international founders.</p>
              <Button variant="outline" size="sm" className="w-full gap-1.5" asChild
                onClick={() => handleBkTool('xero')}>
                <a href="https://xero.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                  Open Xero →
                </a>
              </Button>
            </div>

            {/* CPA Support */}
            <div className={`border rounded-lg p-3 space-y-2 transition-colors ${bkTool === 'cpa' ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
              <p className="text-sm font-semibold text-gray-900">CPA Support</p>
              <p className="text-xs text-gray-500">Upload financial documents and let a professional handle accounting.</p>
              <DocumentUpload companyId={company.id} initialDocs={documents} />
              <Button variant="outline" size="sm" className="w-full" disabled={bkSaving}
                onClick={() => handleBkTool('cpa')}>
                📤 Mark as Sent to CPA
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1 border-t">
            {bkStatus !== 'completed' && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={bkSaving}
                onClick={handleBkComplete}>
                ✅ Mark as Completed
              </Button>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2 pt-1 border-t">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">📝 Notes</p>
            {bkNotes && (
              <pre className="text-xs text-gray-700 bg-gray-50 rounded p-2 whitespace-pre-wrap font-sans border border-gray-100">
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
                className="flex-1 text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <Button size="sm" onClick={handleBkNote} disabled={bkSaving || !bkNote.trim()}>
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )}
    </>
  )
}
