'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Upload, Loader2, FileX, Download } from 'lucide-react'
import { DOC_LABELS, formatFileSize, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([])
  const [company, setCompany] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      setUser(user)

      const { data: co } = await supabase
        .from('companies')
        .select('id, company_name')
        .order('created_at')
        .limit(1)
        .maybeSingle()

      setCompany(co)

      if (co?.id) {
        const { data } = await supabase
          .from('documents')
          .select('*')
          .eq('company_id', co.id)
          .order('created_at', { ascending: false })
        setDocs(data ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !company || !user) return

    setUploading(true)
    const supabase = createClient()
    const fileName = `${company.id}/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file)

    if (uploadError) {
      toast.error('Error al subir: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        company_id: company.id,
        type: 'client_upload',
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: fileName,
        status: 'pending_review',
      })

    if (dbError) {
      toast.error('Error al registrar: ' + dbError.message)
    } else {
      toast.success('Documento subido exitosamente')
      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
      setDocs(data ?? [])
    }

    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDownload(doc: any) {
    const supabase = createClient()
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.storage_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando documentos...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
        <div>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleUpload}
          />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading || !company}
          >
            {uploading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Subiendo...</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" />Subir documento</>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documentos requeridos</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>📄 Pasaporte o ID vigente</li>
            <li>📄 Comprobante de domicilio</li>
            <li>📄 Información del negocio (nombre, actividad)</li>
            <li>📄 Información de miembros (si aplica)</li>
          </ul>
        </CardContent>
      </Card>

      {docs.length === 0 ? (
        <div className="text-center py-12">
          <FileX className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">No has subido documentos aún.</p>
          <p className="text-sm text-gray-400 mt-1">Sube tus documentos para que podamos procesar tu LLC.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{doc.file_name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(doc.file_size ?? 0)} · {formatDate(doc.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                    doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {doc.status === 'approved' ? 'Aprobado' :
                     doc.status === 'rejected' ? 'Rechazado' : 'En revisión'}
                  </span>
                  {doc.storage_path && (
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
