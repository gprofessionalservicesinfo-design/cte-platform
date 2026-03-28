'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Upload, Loader2, Download, CheckCircle2, Clock } from 'lucide-react'
import { toast } from 'sonner'

const REQUIRED_DOCS = [
  { id: 'gov_id',     label: 'Pasaporte o ID vigente',              hint: 'Escaneo a color, todas las páginas' },
  { id: 'proof_addr', label: 'Comprobante de domicilio',            hint: 'Recibo de luz, banco o contrato de arrendamiento' },
  { id: 'biz_info',   label: 'Información del negocio',             hint: 'Nombre, actividad principal, descripción' },
  { id: 'members',    label: 'Información de miembros (si aplica)', hint: 'Nombre y % de participación de cada socio' },
]

const DOC_TYPE_LABELS: Record<string, string> = {
  articles:            'Articles of Organization',
  operating_agreement: 'Operating Agreement',
  other:               'Documento',
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([])
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

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
    const supabase = createClient()
    const fileName = `${company.id}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file)
    if (uploadError) {
      toast.error('Error al subir: ' + uploadError.message)
      setUploadingFor(null)
      return
    }
    const res = await fetch('/api/client/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: company.id,
        type: docId,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: fileName,
        status: 'uploaded',
      }),
    })
    if (!res.ok) { toast.error('Error al registrar documento') }
    else { toast.success('Documento subido exitosamente'); await loadDocuments() }
    setUploadingFor(null)
    if (fileRefs.current[docId]) fileRefs.current[docId]!.value = ''
  }

  function handleDownload(doc: any) {
    window.open(`/api/documents/download/${doc.id}`, '_blank')
  }

  if (loading) return (
    <div className="p-8 text-center text-gray-500">
      <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
      Cargando documentos...
    </div>
  )

  const LLC_TYPES = ['articles', 'operating_agreement']
  const llcDocs = docs
    .filter(d => LLC_TYPES.includes(d.type) || d.uploaded_by === '00000000-0000-0000-0000-000000000001')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const clientDocsByType = REQUIRED_DOCS.reduce((acc, req) => {
    acc[req.id] = docs
      .filter(d => d.type === req.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-800">Documentos de tu LLC</h2>
        </div>
        {llcDocs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Clock className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Tus documentos legales aparecerán aquí una vez que sean generados por nuestro equipo.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {llcDocs.map((doc) => (
              <Card key={doc.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-4">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{DOC_TYPE_LABELS[doc.type] ?? doc.type}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(doc.generated_at ?? doc.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${doc.status === 'final' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {doc.status === 'final' ? 'Final' : 'Borrador'}
                      </span>
                      {doc.storage_path && (
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleDownload(doc)}>
                          <Download className="h-3.5 w-3.5 mr-1" />Descargar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Upload className="h-5 w-5 text-gray-600" />
          <h2 className="text-base font-semibold text-gray-800">Mis documentos</h2>
        </div>
        <div className="space-y-3">
          {REQUIRED_DOCS.map((req) => {
            const uploaded = clientDocsByType[req.id] ?? []
            const isUploading = uploadingFor === req.id
            return (
              <Card key={req.id} className={uploaded.length > 0 ? 'border-green-200' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 shrink-0 ${uploaded.length > 0 ? 'text-green-500' : 'text-gray-300'}`}>
                        {uploaded.length > 0
                          ? <CheckCircle2 className="h-5 w-5" />
                          : <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                        }
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${uploaded.length > 0 ? 'text-green-800' : 'text-gray-800'}`}>{req.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{req.hint}</p>
                      </div>
                    </div>
                    <div>
                      <input
                        ref={el => { fileRefs.current[req.id] = el }}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleUpload(e, req.id)}
                      />
                      <Button
                        variant={uploaded.length > 0 ? 'outline' : 'default'}
                        size="sm"
                        className="h-8 text-xs shrink-0"
                        disabled={isUploading || !company}
                        onClick={() => fileRefs.current[req.id]?.click()}
                      >
                        {isUploading
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <><Upload className="h-3.5 w-3.5 mr-1" />{uploaded.length > 0 ? 'Actualizar' : 'Subir'}</>
                        }
                      </Button>
                    </div>
                  </div>
                  {uploaded.length > 0 && (
                    <div className="mt-3 ml-8 space-y-1.5">
                      {uploaded.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-3.5 w-3.5 text-green-600 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-green-800 truncate">{doc.file_name}</p>
                              <p className="text-xs text-green-600">{formatDateTime(doc.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${doc.status === 'approved' ? 'bg-green-200 text-green-800' : doc.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                              {doc.status === 'approved' ? 'Aprobado' : doc.status === 'rejected' ? 'Rechazado' : 'En revisión'}
                            </span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleDownload(doc)}>
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
          })}
        </div>
      </section>
    </div>
  )
}
