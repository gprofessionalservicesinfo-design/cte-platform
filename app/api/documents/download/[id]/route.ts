import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Resolve role once so we can gate draft access below.
  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = userRow?.role === 'admin'

  // Fetch document — RLS (documents_client / documents_admin) enforces access.
  // If the user doesn't own this document, Supabase returns null.
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('id, file_url, file_name, status, company_id')
    .eq('id', params.id)
    .single()

  if (docError || !document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Draft documents are admin-only until finalized.
  if (document.status === 'draft' && !isAdmin) {
    return NextResponse.json({ error: 'Document not available' }, { status: 403 })
  }

  // Extract storage path from file_url.
  // file_url can be:
  //   - relative path:  "company_id/filename.pdf"  (new schema)
  //   - absolute URL:   "https://....supabase.co/storage/v1/object/public/documents/..."
  let storagePath: string

  try {
    if (document.file_url.startsWith('http')) {
      const url = new URL(document.file_url)
      const match = url.pathname.match(/\/object\/(?:public|sign)\/documents\/(.+)/)
      if (!match) throw new Error('Unparseable URL')
      storagePath = decodeURIComponent(match[1])
    } else {
      // Relative path stored directly (new schema convention)
      storagePath = document.file_url
    }
  } catch {
    return NextResponse.json({ error: 'Invalid document URL' }, { status: 500 })
  }

  // Generate a signed URL valid for 1 hour
  const { data: signedData, error: signedError } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, 3600)

  if (signedError || !signedData?.signedUrl) {
    return NextResponse.json(
      { error: 'Failed to generate download URL: ' + signedError?.message },
      { status: 500 }
    )
  }

  return NextResponse.redirect(signedData.signedUrl)
}
