'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Plus, RotateCcw, Download, MessageCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
import type { DocType, OASubtype } from '@/lib/document-templates/types'

// ─── Types ─────────────────────────────────────────────────────────────────

interface Company {
  id:               string
  name:             string
  state:            string
  state_code:       string
  entity_type?:     string | null
  registered_agent?: string | null
}

interface ExistingDocument {
  id:               string
  type:             string
  file_name:        string
  status:           string
  approval_status?: string | null
  template_id?:     string | null
  generated_at?:    string | null
  created_at:       string
}

interface DocumentGeneratorPanelProps {
  company:              Company
  existingDocs:         ExistingDocument[]
  clientName?:          string | null
  clientPhone?:         string | null
  onDocumentGenerated?: () => void
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const DOC_TYPE_LABELS: Record<string, string> = {
  articles:            'Articles of Organization',
  operating_agreement: 'Operating Agreement',
}

const APPROVAL_BADGE: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  draft:             { label: 'Borrador',                      icon: <Clock className="h-3 w-3" />,       cls: 'bg-gray-100 text-gray-600' },
  pending_approval:  { label: 'Esperando aprobación cliente',  icon: <Clock className="h-3 w-3" />,       cls: 'bg-yellow-100 text-yellow-700' },
  approved:          { label: 'Aprobado por cliente',          icon: <CheckCircle className="h-3 w-3" />, cls: 'bg-green-100 text-green-700' },
  rejected:          { label: 'Rechazado',                     icon: <XCircle className="h-3 w-3" />,     cls: 'bg-red-100 text-red-700' },
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ─── Main component ─────────────────────────────────────────────────────────

export function DocumentGeneratorPanel({
  company,
  existingDocs,
  clientName,
  clientPhone,
  onDocumentGenerated,
}: DocumentGeneratorPanelProps) {
  const router = useRouter()
  const [generating, setGenerating] = useState<string | null>(null) // doc_type being generated
  const [notifying,  setNotifying]  = useState(false)

  const generatedDocs = existingDocs.filter((d) => d.template_id)

  async function handleGenerate(doc_type: DocType, subtype?: OASubtype, replaceId?: string) {
    setGenerating(doc_type)
    try {
      const body: Record<string, unknown> = {
        company_id: company.id,
        doc_type,
        subtype: subtype ?? (doc_type === 'operating_agreement' ? 'single_member' : undefined),
        replace_doc_id: replaceId,
        params: {
          management_type: 'member_managed',
        },
      }

      const res  = await fetch('/api/documents/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Generation failed')

      toast.success(`${DOC_TYPE_LABELS[doc_type]} generado correctamente`)
      router.refresh()
      onDocumentGenerated?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al generar')
    } finally {
      setGenerating(null)
    }
  }

  async function handleNotify() {
    if (!clientPhone) {
      toast.error('El cliente no tiene teléfono registrado')
      return
    }
    setNotifying(true)
    try {
      const nombre    = clientName ?? 'Cliente'
      const msgBody   =
        `Hola ${nombre}, tus documentos de *${company.name}* están listos para revisar en tu portal: ` +
        `https://creatuempresausa.com/dashboard/documents 📄`

      const res = await fetch('/api/whatsapp/send', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ to: clientPhone, body: msgBody }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Send failed')
      toast.success('Notificación enviada por WhatsApp')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al enviar WhatsApp')
    } finally {
      setNotifying(false)
    }
  }

  const hasPending = generatedDocs.some(
    (d) => !d.approval_status || d.approval_status === 'pending_approval'
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">Document Generator</CardTitle>
          <CardDescription>Generate formation documents for {company.name}</CardDescription>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {hasPending && clientPhone && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleNotify}
              disabled={notifying}
              className="border-green-500 text-green-700 hover:bg-green-50"
            >
              {notifying
                ? <RotateCcw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                : <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
              }
              Notificar cliente
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => handleGenerate('articles')}
            disabled={generating !== null}
            variant="outline"
          >
            {generating === 'articles'
              ? <RotateCcw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              : <Plus className="mr-1.5 h-3.5 w-3.5" />
            }
            Articles
          </Button>
          <Button
            size="sm"
            onClick={() => handleGenerate('operating_agreement', 'single_member')}
            disabled={generating !== null}
          >
            {generating === 'operating_agreement'
              ? <RotateCcw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              : <Plus className="mr-1.5 h-3.5 w-3.5" />
            }
            Op. Agreement
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {generatedDocs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay documentos generados. Usa los botones de arriba para generar.
          </p>
        ) : (
          <div className="space-y-2">
            {generatedDocs.map((doc) => {
              const approvalKey = doc.approval_status ?? 'draft'
              const badge       = APPROVAL_BADGE[approvalKey] ?? APPROVAL_BADGE.draft
              const isGeneratingThis = generating !== null

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2.5 gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(doc.generated_at ?? doc.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>
                      {badge.icon}
                      {badge.label}
                    </span>

                    {/* Regenerar */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={isGeneratingThis}
                      onClick={() => handleGenerate(
                        doc.type as DocType,
                        doc.type === 'operating_agreement' ? 'single_member' : undefined,
                        doc.id,
                      )}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Regenerar
                    </Button>

                    {/* Download */}
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
