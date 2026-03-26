'use client'

import { useState }      from 'react'
import { useRouter }     from 'next/navigation'
import { toast }         from 'sonner'
import { Button }   from '@/components/ui/button'
import { Badge }    from '@/components/ui/badge'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  FileText, Plus, Trash2, RotateCcw, CheckCircle, ExternalLink, Download,
} from 'lucide-react'
import type {
  DocType, OASubtype, OAMember, ManagementType, GenerationResult,
} from '@/lib/document-templates/types'
import { SUPPORTED_ARTICLES_STATES } from '@/lib/document-templates/articles'

// ─── Types ─────────────────────────────────────────────────────────────────

interface Company {
  id: string
  name: string          // company_name from DB
  state: string
  state_code: string
  entity_type?: string | null
  registered_agent?: string | null   // single field from DB (name only)
}

interface ExistingDocument {
  id: string
  type: string
  file_name: string
  status: string
  template_id?: string | null
  created_at: string
}

interface DocumentGeneratorPanelProps {
  company: Company
  existingDocs: ExistingDocument[]
  onDocumentGenerated?: () => void
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const DOC_TYPE_LABELS: Record<DocType, string> = {
  articles:             'Articles of Organization',
  operating_agreement:  'Operating Agreement',
}

const OA_SUBTYPE_LABELS: Record<OASubtype, string> = {
  single_member:   'Single Member LLC',
  multi_member:    'Multi-Member LLC',
  manager_managed: 'Manager-Managed LLC',
}

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft:    { label: 'Draft',    variant: 'secondary' },
  final:    { label: 'Final',    variant: 'default' },
  uploaded: { label: 'Uploaded', variant: 'outline' },
}

function emptyMember(): OAMember {
  return { name: '', address: '', ownership_percentage: 0 }
}

// ─── Member form ────────────────────────────────────────────────────────────

function MemberRow({
  member,
  index,
  onChange,
  onRemove,
  removable,
}: {
  member: OAMember
  index: number
  onChange: (m: OAMember) => void
  onRemove: () => void
  removable: boolean
}) {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Member {index + 1}</span>
        {removable && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Full Name</Label>
          <Input
            placeholder="Jane Doe"
            value={member.name}
            onChange={(e) => onChange({ ...member, name: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Ownership %</Label>
          <Input
            type="number"
            min={0}
            max={100}
            placeholder="50"
            value={member.ownership_percentage || ''}
            onChange={(e) => onChange({ ...member, ownership_percentage: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs">Address</Label>
          <Input
            placeholder="123 Main St, City, State ZIP"
            value={member.address}
            onChange={(e) => onChange({ ...member, address: e.target.value })}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs">Capital Contribution (optional)</Label>
          <Input
            placeholder="$1,000.00"
            value={member.capital_contribution ?? ''}
            onChange={(e) => onChange({ ...member, capital_contribution: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export function DocumentGeneratorPanel({
  company,
  existingDocs,
  onDocumentGenerated,
}: DocumentGeneratorPanelProps) {
  const router = useRouter()
  const [open,        setOpen]        = useState(false)
  const [generating,  setGenerating]  = useState(false)
  const [lastResult,  setLastResult]  = useState<GenerationResult | null>(null)

  // Form fields
  const [docType,      setDocType]      = useState<DocType>('articles')
  const [oaSubtype,    setOaSubtype]    = useState<OASubtype>('single_member')
  const [replaceDocId, setReplaceDocId] = useState<string>('')

  // Shared
  const [effectiveDate, setEffectiveDate] = useState('')
  const [purpose,       setPurpose]       = useState('')
  const [managementType, setManagementType] = useState<ManagementType>('member_managed')

  // Articles-only
  const [organizerName,    setOrganizerName]    = useState('')
  const [organizerAddress, setOrganizerAddress] = useState('')

  // OA fields
  const [members,  setMembers]  = useState<OAMember[]>([emptyMember()])
  const [managers, setManagers] = useState<string[]>([''])
  const [fiscalYearEnd, setFiscalYearEnd] = useState('December 31')

  const isArticles = docType === 'articles'
  const supportsState = SUPPORTED_ARTICLES_STATES.includes(company.state_code.toUpperCase())

  function addMember()   { setMembers((ms) => [...ms, emptyMember()]) }
  function removeMember(i: number) { setMembers((ms) => ms.filter((_, idx) => idx !== i)) }
  function updateMember(i: number, m: OAMember) {
    setMembers((ms) => ms.map((x, idx) => (idx === i ? m : x)))
  }

  function addManager()   { setManagers((ms) => [...ms, '']) }
  function removeManager(i: number) { setManagers((ms) => ms.filter((_, idx) => idx !== i)) }
  function updateManager(i: number, val: string) {
    setManagers((ms) => ms.map((x, idx) => (idx === i ? val : x)))
  }

  async function handleGenerate() {
    if (isArticles && !supportsState) {
      toast.error(`Articles not supported for state: ${company.state_code}`)
      return
    }

    setGenerating(true)
    setLastResult(null)

    try {
      const params: Record<string, unknown> = {
        effective_date: effectiveDate || undefined,
        purpose:        purpose       || undefined,
      }

      if (isArticles) {
        params.organizer_name    = organizerName    || company.name
        params.organizer_address = organizerAddress || undefined
        params.management_type   = managementType
      } else {
        params.members         = members
        params.management_type = managementType
        params.fiscal_year_end = fiscalYearEnd || undefined
        if (oaSubtype === 'manager_managed') {
          params.managers = managers.filter(Boolean)
        }
      }

      const body = {
        company_id:     company.id,
        doc_type:       docType,
        subtype:        isArticles ? undefined : oaSubtype,
        params,
        replace_doc_id: replaceDocId || undefined,
      }

      const res = await fetch('/api/documents/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Generation failed')
      }

      setLastResult(data as GenerationResult)
      toast.success('Document generated successfully')
      router.refresh()
      onDocumentGenerated?.()

    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSetStatus(docId: string, status: 'draft' | 'final') {
    const res = await fetch('/api/documents/finalize', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ document_id: docId, status }),
    })
    if (res.ok) {
      toast.success(status === 'final' ? 'Document marked as final' : 'Document reverted to draft')
      router.refresh()
      onDocumentGenerated?.()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? 'Failed to update document status')
    }
  }

  // ── Existing docs list ─────────────────────────────────────────────────
  const generatedDocs = existingDocs.filter((d) => d.template_id)

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">Document Generator</CardTitle>
          <CardDescription>
            Generate draft legal documents for {company.name}
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Generate
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate Document</DialogTitle>
              <DialogDescription>
                {company.name} · {company.state} ({company.state_code})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 pt-2">

              {/* Document type */}
              <div className="space-y-1.5">
                <Label>Document Type</Label>
                <Select value={docType} onValueChange={(v) => setDocType(v as DocType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isArticles && !supportsState && (
                  <p className="text-xs text-destructive">
                    Articles not yet supported for {company.state_code}.
                    Supported: {SUPPORTED_ARTICLES_STATES.join(', ')}.
                  </p>
                )}
              </div>

              {/* OA subtype */}
              {!isArticles && (
                <div className="space-y-1.5">
                  <Label>Agreement Type</Label>
                  <Select value={oaSubtype} onValueChange={(v) => setOaSubtype(v as OASubtype)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(OA_SUBTYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Management type */}
              {isArticles && (
                <div className="space-y-1.5">
                  <Label>Management Structure</Label>
                  <Select value={managementType} onValueChange={(v) => setManagementType(v as ManagementType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member_managed">Member-Managed</SelectItem>
                      <SelectItem value="manager_managed">Manager-Managed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              {/* Shared fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Effective Date (optional)</Label>
                  <Input
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                  />
                </div>
                {!isArticles && (
                  <div className="space-y-1.5">
                    <Label>Fiscal Year End</Label>
                    <Input
                      placeholder="December 31"
                      value={fiscalYearEnd}
                      onChange={(e) => setFiscalYearEnd(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Purpose (optional — leave blank for default)</Label>
                <Textarea
                  rows={2}
                  placeholder="To engage in any lawful business..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              {/* Articles-specific */}
              {isArticles && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Organizer Information</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Organizer Name</Label>
                        <Input
                          placeholder="Full name or company"
                          value={organizerName}
                          onChange={(e) => setOrganizerName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Organizer Address</Label>
                        <Input
                          placeholder="123 Main St, City, State ZIP"
                          value={organizerAddress}
                          onChange={(e) => setOrganizerAddress(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* OA — Members */}
              {!isArticles && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Members</p>
                      {oaSubtype !== 'single_member' && (
                        <Button type="button" variant="outline" size="sm" onClick={addMember}>
                          <Plus className="mr-1 h-3 w-3" />
                          Add Member
                        </Button>
                      )}
                    </div>
                    {members.slice(0, oaSubtype === 'single_member' ? 1 : undefined).map((m, i) => (
                      <MemberRow
                        key={i}
                        member={m}
                        index={i}
                        onChange={(updated) => updateMember(i, updated)}
                        onRemove={() => removeMember(i)}
                        removable={oaSubtype !== 'single_member' && members.length > 1}
                      />
                    ))}
                    {oaSubtype !== 'single_member' && (
                      <p className="text-xs text-muted-foreground">
                        Total ownership: {members.reduce((s, m) => s + (m.ownership_percentage || 0), 0)}%
                        {members.reduce((s, m) => s + (m.ownership_percentage || 0), 0) !== 100 && (
                          <span className="text-destructive ml-1">(must equal 100%)</span>
                        )}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Manager-managed: manager names */}
              {!isArticles && oaSubtype === 'manager_managed' && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Managers</p>
                      <Button type="button" variant="outline" size="sm" onClick={addManager}>
                        <Plus className="mr-1 h-3 w-3" />
                        Add Manager
                      </Button>
                    </div>
                    {managers.map((name, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          placeholder={`Manager ${i + 1} name`}
                          value={name}
                          onChange={(e) => updateManager(i, e.target.value)}
                        />
                        {managers.length > 1 && (
                          <Button
                            type="button" variant="ghost" size="icon"
                            onClick={() => removeManager(i)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      Leave blank to use member names as managers.
                    </p>
                  </div>
                </>
              )}

              {/* Replace existing doc */}
              {generatedDocs.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-1.5">
                    <Label>Replace Existing Document (optional)</Label>
                    <Select
                      value={replaceDocId}
                      onValueChange={setReplaceDocId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="— create new document —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">— create new document —</SelectItem>
                        {generatedDocs.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.file_name} ({d.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {replaceDocId && (
                      <p className="text-xs text-destructive">
                        The selected document will be permanently deleted and replaced.
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Success banner */}
              {lastResult && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 space-y-2">
                  <p className="text-sm font-medium text-green-800 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4" />
                    Document generated — status: <strong>draft</strong>
                  </p>
                  <p className="text-xs text-green-700">{lastResult.file_name}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs"
                      onClick={() => {
                        const w = window.open('', '_blank')
                        if (w && lastResult.html) { w.document.write(lastResult.html); w.document.close() }
                      }}>
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Preview Document
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleSetStatus(lastResult.document_id, 'final')}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Mark as Final
                    </Button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)} disabled={generating}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={generating || (isArticles && !supportsState)}>
                  {generating ? (
                    <>
                      <RotateCcw className="mr-1.5 h-4 w-4 animate-spin" />
                      Generating…
                    </>
                  ) : replaceDocId ? (
                    <>
                      <RotateCcw className="mr-1.5 h-4 w-4" />
                      Regenerate
                    </>
                  ) : (
                    <>
                      <FileText className="mr-1.5 h-4 w-4" />
                      Generate Draft
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {generatedDocs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No documents generated yet. Click "Generate" to create the first one.
          </p>
        ) : (
          <div className="space-y-2">
            {generatedDocs.map((doc) => {
              const sb = STATUS_BADGE[doc.status] ?? STATUS_BADGE.uploaded
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{DOC_TYPE_LABELS[doc.type as DocType] ?? doc.type}</p>
                      <p className="text-xs text-muted-foreground truncate">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={sb.variant} className="text-xs">{sb.label}</Badge>
                    {doc.status === 'draft' && (
                      <Button
                        variant="ghost" size="sm" className="h-7 text-xs"
                        onClick={() => handleSetStatus(doc.id, 'final')}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Finalize
                      </Button>
                    )}
                    {doc.status === 'final' && (
                      <Button
                        variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground"
                        onClick={() => handleSetStatus(doc.id, 'draft')}
                      >
                        <RotateCcw className="mr-1 h-3 w-3" />
                        Revert
                      </Button>
                    )}
                    <a href={`/api/documents/download/${doc.id}`} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
