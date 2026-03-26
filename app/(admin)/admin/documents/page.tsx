import { createAdminServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FileText } from 'lucide-react'
import { DOC_LABELS, formatDate, formatFileSize } from '@/lib/utils'

export default async function AdminDocumentsPage() {
  const supabase = createAdminServerClient()

  const { data: documents } = await supabase
    .from('documents')
    .select(`
      id,
      type,
      file_name,
      file_size,
      created_at,
      companies (
        company_name
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Documents</h1>
        <p className="text-gray-500 mt-1">{documents?.length ?? 0} total documents</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Type</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!documents || documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                    <FileText className="mx-auto h-8 w-8 mb-2 opacity-40" />
                    No documents uploaded yet.
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      {DOC_LABELS[doc.type] ?? doc.type}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {(doc.companies as any)?.company_name ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-gray-600">
                      {doc.file_name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {doc.file_size ? formatFileSize(doc.file_size) : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(doc.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
