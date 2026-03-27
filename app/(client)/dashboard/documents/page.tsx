import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download, FileX } from 'lucide-react'
import { DOC_LABELS, formatFileSize, formatDate } from '@/lib/utils'

export default async function DocumentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const authUser = user

  // Production cookie fix
  let user: any = authUser
  if (!user) {
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    const t = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token')
    const t0 = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token.0')
    const t1 = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token.1')
    let raw = t?.value || (t0?.value ? t0.value + (t1?.value ?? '') : null)
    if (raw) {
      try {
        const d = JSON.parse(decodeURIComponent(raw))
        if (d?.user) user = d.user
        else if (d?.access_token) {
          const p = JSON.parse(atob(d.access_token.split('.')[1]))
          if (p?.sub) user = { id: p.sub, email: p.email }
        }
      } catch {}
    }
  }

  if (!user) redirect('/login')

  // RLS ensures this returns only the current client's company
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .order('created_at')
    .limit(1)
    .maybeSingle()

  if (!company) {
    return (
      <div className="text-center py-20">
        <FileX className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700">No company found</h2>
        <p className="text-gray-500 text-sm mt-1">Contact support to get set up.</p>
      </div>
    )
  }

  // Clients only see finalized documents (final + manually uploaded).
  // Drafts are admin-only until approved.
  const { data: documents } = await supabase
    .from('documents')
    .select('id, type, file_name, file_size, status, template_id, created_at')
    .eq('company_id', company.id)
    .in('status', ['final', 'uploaded'])
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500 mt-1">Your company formation documents.</p>
      </div>

      {!documents || documents.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">No documents yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Your documents will appear here once your formation is in progress.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-blue-50 p-2.5 rounded-lg flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">
                          {DOC_LABELS[doc.type] ?? doc.type}
                        </p>
                        {doc.template_id && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            Auto-generated
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <span>{formatDate(doc.created_at)}</span>
                        {doc.file_size && (
                          <>
                            <span>·</span>
                            <span>{formatFileSize(doc.file_size)}</span>
                          </>
                        )}
                        <span>·</span>
                        <span className="truncate">{doc.file_name}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="flex-shrink-0">
                    <Link href={`/api/documents/download/${doc.id}`} target="_blank">
                      <Download className="h-4 w-4 mr-1.5" />
                      Download
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
