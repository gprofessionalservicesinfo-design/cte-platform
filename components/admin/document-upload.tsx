'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DOC_LABELS, formatFileSize, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Upload, Loader2, FileText, X } from 'lucide-react'

const DOC_TYPES = Object.entries(DOC_LABELS).map(([value, label]) => ({ value, label }))

interface UploadedDoc {
  id: string
  type: string
  file_name: string
  file_size: number | null
  created_at: string
}

interface DocumentUploadProps {
  companyId: string
  initialDocs: UploadedDoc[]
}

export function DocumentUpload({ companyId, initialDocs }: DocumentUploadProps) {
  const [docs, setDocs] = useState<UploadedDoc[]>(initialDocs)
  const [docType, setDocType] = useState('articles')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleUpload() {
    if (!file || !docType) {
      toast.error('Please select a file and document type')
      return
    }

    setUploading(true)
    setProgress(0)

    const supabase = createClient()
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const storagePath = `${companyId}/${fileName}`

    // Upload to storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (storageError) {
      toast.error('Upload failed: ' + storageError.message)
      setUploading(false)
      return
    }

    setProgress(50)

    // Get public URL (signed URL path reference)
    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(storagePath)

    // Insert document record
    const { data: newDoc, error: dbError } = await supabase
      .from('documents')
      .insert({
        company_id: companyId,
        type: docType,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
      })
      .select()
      .single()

    if (dbError) {
      toast.error('Failed to save document record: ' + dbError.message)
      setUploading(false)
      return
    }

    setProgress(100)
    setDocs((prev) => [newDoc, ...prev])
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    toast.success('Document uploaded successfully')
    setUploading(false)
    setProgress(0)
  }

  return (
    <div className="space-y-4">
      {/* Upload form */}
      <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
        <div className="space-y-1.5">
          <Label>Document Type</Label>
          <Select value={docType} onValueChange={setDocType} disabled={uploading}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {DOC_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>File</Label>
          <div
            className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-gray-300 transition-colors"
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to choose a file</p>
                <p className="text-xs text-gray-400 mt-0.5">PDF, DOC, DOCX up to 20MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={uploading}
          />
        </div>

        {uploading && (
          <div className="space-y-1.5">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">Uploading… {progress}%</p>
          </div>
        )}

        <Button onClick={handleUpload} disabled={uploading || !file} className="w-full">
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </div>

      {/* Document list */}
      {docs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Uploaded Documents ({docs.length})
          </p>
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-2 p-2.5 rounded-lg border bg-white text-sm"
            >
              <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-800 truncate">
                  {DOC_LABELS[doc.type] ?? doc.type}
                </p>
                <p className="text-xs text-gray-400">
                  {doc.file_name}
                  {doc.file_size ? ` · ${formatFileSize(doc.file_size)}` : ''} ·{' '}
                  {formatDate(doc.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
