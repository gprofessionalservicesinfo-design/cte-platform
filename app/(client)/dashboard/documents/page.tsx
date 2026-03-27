'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, FileX } from 'lucide-react'
import { DOC_LABELS, formatFileSize, formatDate } from '@/lib/utils'

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .order('created_at')
        .limit(1)
        .maybeSingle()

      if (!company) { setLoading(false); return }

      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })

      setDocs(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando documentos...</div>

  if (docs.length === 0) return (
    <div className="text-center py-20">
      <FileX className="mx-auto h-12 w-12 text-gray-300 mb-4" />
      <h2 className="text-xl font-semibold text-gray-800 mb-2">No hay documentos</h2>
      <p className="text-gray-500">Tus documentos aparecerán aquí cuando estén listos.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
      {docs.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">{DOC_LABELS[doc.type] ?? doc.type}</p>
                <p className="text-sm text-gray-500">{doc.file_name} · {formatFileSize(doc.file_size ?? 0)} · {formatDate(doc.created_at)}</p>
              </div>
            </div>
            <Badge variant="outline">{doc.status}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
