'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileText, Upload, Loader2, Download, CheckCircle2,
  Clock, Plus, ChevronDown, ChevronUp, ThumbsUp,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Document catalog ────────────────────────────────────────────────────────

const BASE_DOCS = [
  { id: 'gov_id',     label: 'Pasaporte o ID vigente',         hint: 'Escaneo a color — ambos lados si es ID local',                                            required: true },
  { id: 'proof_addr', label: 'Comprobante de domicilio',       hint: 'Recibo de servicios, estado de cuenta o contrato — menos de 3 meses',                     required: true },
  { id: 'biz_info',   label: 'Información del negocio',        hint: 'Nombre deseado, actividad principal y estado de formación',                               required: true },
  { id: 'members',    label: 'Información de miembros / socios', hint: 'Nombre completo, % de participación y dirección de cada socio',                         required: true },
]

const ADDITIONAL_DOCS = [
  { id: 'itin_status',  label: 'ITIN o estatus de aplicación',   hint: 'Número ITIN si ya lo tienes, o carta de solicitud al IRS',            group: 'Clientes extranjeros' },
  { id: 'source_funds', label: 'Fuente de fondos',               hint: 'Carta bancaria o carta de contador indicando origen de fondos',       group: 'Clientes extranjeros' },
  { id: 'wire_info',    label: 'Información bancaria preferida', hint: 'Banco preferido (Mercury, Relay, etc.) y datos para transferencia',   group: 'Clientes extranjeros' },
  { id: 'ein_auth',     label: 'Formulario SS-4 firmado',        hint: 'Formulario SS-4 completo y firmado para obtención de EIN',            group: 'EIN' },
  { id: 'oa_signature', label: 'Operating Agreement firmado',    hint: 'Documento Operating Agreement con la(s) firma(s) de los miembros',   group: 'Operating Agreement' },
  { id: 'annual_report',label: 'Documentos para reporte anual', hint: 'Información actualizada de miembros, dirección registrada y actividad', group: 'Compliance' },
]

const LLC_DOC_LABELS: Record<string, string> = {
  articles:              'Articles of Organization',
  operating_agreement:   'Operating Agreement',
  ein_letter:            'EIN Confirmation Letter',
  formation_certificate: 'Certificate of Formation',
  annual_report:         'Annual Report',
  other:                 'Documento',
}

const STATUS_BADGE: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100   text-red-700',
  uploaded: 'bg-amber-100 text-amber-700',
}
const STATUS_LABEL: Record<string, string> = {
  approved: 'Aprobado',
  rejected: 'Rechazado',
  uploaded: 'En revisión',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ─── Upload card ─────────────────────────────────────────────────────────────

function DocUploadCard({
  id, label, hint, required, files, uploading, disabled, onUpload, onDownload,
}: {
  id: string; label: string; hint: string; required?: boolean
  files: any[]; uploading: boolean; disabled: boolean
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDownload: (doc: any) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const hasFiles = files.length > 0

  return (
    <Card className={`transition-colors ${hasFiles ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 shrink-0 ${hasFiles ? 'text-green-500' : 'text-gray-300'}`}>
            {hasFiles
              ? <CheckCircle2 className="h-5 w-5" />
              : <div className="h-5 w-5 rounded-full border-2 border-current" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className={`text-sm font-semibold leading-tight ${hasFiles ? 'text-green-800' : 'text-gray-800'}`}>
                {label}
              </p>
              {required && !hasFiles && <span className="text-xs text-red-500 font-medium">Requerido</span>}
              {hasFiles && files.length > 1 && (
                <span className="text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full font-medium">
                  {files.length} archivos
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5 leading-snug">{hint}</p>
          </div>
          <div className="shrink-0">
            <input
              ref={inputRef} type="file" className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,image/*"
              onChange={onUpload}
            />
            <Button
              variant={hasFiles ? 'outline' : 'default'} size="sm"
              className="h-8 text-xs gap-1 whitespace-nowrap"
              disabled={uploading || disabled}
              onClick={() => inputRef.current?.click()}
            >
              {uploading
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : hasFiles
                  ? <><Plus className="h-3.5 w-3.5" />Agregar</>
                  : <><Upload className="h-3.5 w-3.5" />Subir</>
              }
            </Button>
          </div>
        </div>
        {hasFiles && (
          <div className="mt-3 ml-8 space-y-1.5">
            {files.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between bg-white border border-green-100 rounded-lg px-3 py-2 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate leading-tight">{doc.file_name}</p>
                    <p className="text-xs text-gray-400">{formatDate(doc.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${STATUS_BADGE[doc.status] ?? STATUS_BADGE.uploaded}`}>
                    {STATUS_LABEL[doc.status] ?? 'En revisión'}
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-700"
                    onClick={() => onDownload(doc)}>
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── LLC Document card ────────────────────────────────────────────────────────

function LlcDocCard({ doc, versionCount, onApprove, onRequestChanges }: {
  doc: any;
  versionCount: number;
  onApprove: (id: string) => Promise<void>;
  onRequestChanges: (id: string, note: string) => Promise<void>;
}) {
  const [approving,       setApproving]      = useState(false)
  const [showChangesForm, setShowChangesForm] = useState(false)
  const [changeNote,      setChangeNote]      = useState('')
  const [sendingNote,     setSendingNote]     = useState(false)

  // Explicit three-state logic — no implicit fallthrough
  const approvalStatus = doc.approval_status ?? null
  const isApproved = approvalStatus === 'approved'
  const isPending  = approvalStatus === 'pending_approval'
  // NULL / 'draft' / 'changes_requested' → isDraft (download only, no approve btn)
  const isDraft    = !isApproved && !isPending

  async function handleApprove() {
    setApproving(true)
    await onApprove(doc.id)
    setApproving(false)
  }

  async function handleSendChanges() {
    if (!changeNote.trim()) return
    setSendingNote(true)
    await onRequestChanges(doc.id, changeNote)
    setChangeNote('')
    setShowChangesForm(false)
    setSendingNote(false)
  }

  const borderClass = isApproved ? 'border-green-200' : isPending ? 'border-yellow-200' : 'border-gray-200'

  return (
    <Card className={borderClass}>
      <CardContent className="p-0">
        <div className="flex items-center gap-3 p-4">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${isApproved ? 'bg-green-50' : 'bg-blue-50'}`}>
            <FileText className={`h-4 w-4 ${isApproved ? 'text-green-600' : 'text-blue-600'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-gray-900 text-sm leading-tight">
                {LLC_DOC_LABELS[doc.type] ?? doc.type}
              </p>
              {versionCount > 1 && (
                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                  {versionCount} versiones
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDate(doc.generated_at ?? doc.created_at)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* Status badge */}
            {isApproved && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                <CheckCircle2 className="h-3 w-3" />
                Aprobado ✅
              </span>
            )}
            {isPending && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">
                <Clock className="h-3 w-3" />
                Requiere tu aprobación
              </span>
            )}

            {/* Action buttons */}
            <div className="flex gap-1.5 flex-wrap justify-end">
              {isApproved && (
                <a href={`/api/documents/download/${doc.id}`} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    <Download className="h-3 w-3" />
                    Descargar
                  </Button>
                </a>
              )}

              {isPending && (
                <>
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                    onClick={handleApprove}
                    disabled={approving}
                  >
                    {approving ? <Loader2 className="h-3 w-3 animate-spin" /> : <ThumbsUp className="h-3 w-3" />}
                    Aprobar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs text-orange-600 border-orange-200 hover:bg-orange-50"
                    onClick={() => setShowChangesForm(v => !v)}
                  >
                    Solicitar cambios
                  </Button>
                </>
              )}

              {/* Draft / null / changes_requested — always show download */}
              {isDraft && (
                <a href={`/api/documents/download/${doc.id}`} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    <Download className="h-3 w-3" />
                    Descargar
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Request changes form */}
        {showChangesForm && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-600 mb-2 font-medium">Describe los cambios que necesitas:</p>
            <textarea
              rows={3}
              value={changeNote}
              onChange={e => setChangeNote(e.target.value)}
              placeholder="Ej: El nombre de la empresa está incorrecto, debe ser..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
            <div className="flex gap-2 mt-2 justify-end">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowChangesForm(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleSendChanges}
                disabled={sendingNote || !changeNote.trim()}
              >
                {sendingNote ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Enviar nota'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [docs,          setDocs]          = useState<any[]>([])
  const [company,       setCompany]       = useState<any>(null)
  const [loading,       setLoading]       = useState(true)
  const [uploadingFor,  setUploadingFor]  = useState<string | null>(null)
  const [showAdditional, setShowAdditional] = useState(false)

  async function loadDocuments() {
    const res = await fetch('/api/client/documents')
    if (!res.ok) {
      if (res.status === 401) { window.location.href = '/login'; return }
      toast.error('Error al cargar documentos')
      setLoading(false)
      return
    }
    const { documents, company } = await res.json()
    setCompany(company)
    setDocs(documents ?? [])
    setLoading(false)
  }

  useEffect(() => { loadDocuments() }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, docId: string) {
    const file = e.target.files?.[0]
    if (!file || !company) return
    setUploadingFor(docId)
    e.target.value = ''
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', docId)
      formData.append('company_id', company.id)
      const res  = await fetch('/api/client/documents/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) toast.error(data.error ?? 'Error al subir documento')
      else { toast.success(`${file.name} subido correctamente`); await loadDocuments() }
    } catch (err) {
      toast.error('Error de red: ' + (err instanceof Error ? err.message : String(err)))
    }
    setUploadingFor(null)
  }

  async function handleApprove(docId: string) {
    const res  = await fetch(`/api/documents/approve/${docId}`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Error al aprobar')
    } else {
      toast.success('Documento aprobado')
      await loadDocuments()
    }
  }

  async function handleRequestChanges(docId: string, note: string) {
    if (!company) return
    // Save to mail_items so admin sees the request
    const res = await fetch('/api/client/request-doc-changes', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id: company.id, doc_id: docId, note }),
    })
    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error ?? 'Error al enviar solicitud')
    } else {
      toast.success('Solicitud enviada al equipo')
    }
  }

  function handleDownload(doc: any) {
    window.open(`/api/documents/download/${doc.id}`, '_blank')
  }

  if (loading) return (
    <div className="py-16 text-center text-gray-400">
      <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
      <p className="text-sm">Cargando documentos...</p>
    </div>
  )

  // LLC docs (generated by admin) vs client uploads
  const LLC_TYPES    = new Set(['articles', 'operating_agreement', 'ein_letter', 'formation_certificate', 'annual_report', 'other'])
  const CLIENT_TYPES = new Set([...BASE_DOCS, ...ADDITIONAL_DOCS].map(d => d.id))

  // Sort all LLC-type docs newest-first, then deduplicate: one card per type
  // (most recent). Track total count per type for the version badge.
  const allLlcDocs = docs
    .filter(d => LLC_TYPES.has(d.type) || (!CLIENT_TYPES.has(d.type) && d.template_id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const llcVersionCounts: Record<string, number> = {}
  allLlcDocs.forEach(d => { llcVersionCounts[d.type] = (llcVersionCounts[d.type] ?? 0) + 1 })

  // Keep only the newest per type
  const seenTypes = new Set<string>()
  const llcDocs   = allLlcDocs.filter(d => {
    if (seenTypes.has(d.type)) return false
    seenTypes.add(d.type)
    return true
  })

  const filesByType = docs.reduce((acc, d) => {
    if (!acc[d.type]) acc[d.type] = []
    acc[d.type].push(d)
    return acc
  }, {} as Record<string, any[]>)
  Object.values(filesByType).forEach(arr =>
    arr.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  )

  const baseComplete = BASE_DOCS.filter(d => (filesByType[d.id]?.length ?? 0) > 0).length
  const additionalGroups = ADDITIONAL_DOCS.reduce((acc, d) => {
    if (!acc[d.group]) acc[d.group] = []
    acc[d.group].push(d)
    return acc
  }, {} as Record<string, typeof ADDITIONAL_DOCS>)
  const hasAnyAdditional = ADDITIONAL_DOCS.some(d => (filesByType[d.id]?.length ?? 0) > 0)

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>

      {/* ── LLC docs ─────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-800">Documentos de tu LLC</h2>
        </div>
        {llcDocs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Clock className="mx-auto h-8 w-8 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">Tus documentos de formación serán cargados aquí pronto.</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Te notificaremos por WhatsApp cuando estén listos para que los revises y apruebes.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {llcDocs.map((doc) => (
              <LlcDocCard
                key={doc.id}
                doc={doc}
                versionCount={llcVersionCounts[doc.type] ?? 1}
                onApprove={handleApprove}
                onRequestChanges={handleRequestChanges}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Base docs ────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-gray-600" />
            <h2 className="text-base font-semibold text-gray-800">Mis documentos</h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">{baseComplete}/{BASE_DOCS.length} completados</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${(baseComplete / BASE_DOCS.length) * 100}%` }} />
        </div>
        <div className="space-y-3">
          {BASE_DOCS.map((req) => (
            <DocUploadCard
              key={req.id} id={req.id} label={req.label} hint={req.hint} required={req.required}
              files={filesByType[req.id] ?? []} uploading={uploadingFor === req.id}
              disabled={!company}
              onUpload={(e) => handleUpload(e, req.id)} onDownload={handleDownload}
            />
          ))}
        </div>
      </section>

      {/* ── Additional docs ──────────────────────────────────────────────── */}
      <section>
        <button className="flex items-center gap-2 w-full text-left mb-3 group"
          onClick={() => setShowAdditional(v => !v)}>
          <div className="flex items-center gap-2 flex-1">
            <Plus className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            <h2 className="text-base font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
              Documentos adicionales
            </h2>
            {hasAnyAdditional && <span className="h-2 w-2 rounded-full bg-blue-500" />}
          </div>
          {showAdditional ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>
        {(showAdditional || hasAnyAdditional) && (
          <div className="space-y-6">
            {Object.entries(additionalGroups).map(([group, items]) => (
              <div key={group}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">{group}</p>
                <div className="space-y-2">
                  {items.map((req) => (
                    <DocUploadCard
                      key={req.id} id={req.id} label={req.label} hint={req.hint}
                      files={filesByType[req.id] ?? []} uploading={uploadingFor === req.id}
                      disabled={!company}
                      onUpload={(e) => handleUpload(e, req.id)} onDownload={handleDownload}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
