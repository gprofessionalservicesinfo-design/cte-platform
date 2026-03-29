import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const supabase = createAdminServerClient()

  // Read user from cookie
  let user: any = null
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
        const p = JSON.parse(Buffer.from(d.access_token.split('.')[1], 'base64').toString())
        if (p?.sub) user = { id: p.sub, email: p.email }
      }
    } catch {}
  }

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Resolve role
  const { data: userRow } = await supabase.from('users').select('role').eq('id', user.id).single()
  const isAdmin = userRow?.role === 'admin'

  // Fetch document — RLS (documents_client / documents_admin) enforces access.
  // If the user doesn't own this document, Supabase returns null.
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('id, file_url, storage_path, file_name, status, company_id')
    .eq('id', params.id)
    .single()

  if (docError || !document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Allow clients to view their own documents regardless of status

  // Extract storage path from file_url.
  // file_url can be:
  //   - relative path:  "company_id/filename.pdf"  (new schema)
  //   - absolute URL:   "https://....supabase.co/storage/v1/object/public/documents/..."
  let storagePath: string
  const pathSource = document.storage_path || document.file_url

  if (!pathSource) {
    return NextResponse.json({ error: 'No storage path found' }, { status: 404 })
  }

  try {
    if (pathSource.startsWith('http')) {
      const url = new URL(pathSource)
      const match = url.pathname.match(/\/object\/(?:public|sign)\/documents\/(.+)/)
      if (!match) throw new Error('Unparseable URL')
      storagePath = decodeURIComponent(match[1])
    } else {
      storagePath = pathSource
    }
  } catch {
    return NextResponse.json({ error: 'Invalid document URL' }, { status: 500 })
  }

  const { data: publicData } = supabase.storage
    .from('documents')
    .getPublicUrl(storagePath)

  if (!publicData?.publicUrl) {
    return NextResponse.json({ error: 'Failed to get public URL' }, { status: 500 })
  }

  return NextResponse.redirect(publicData.publicUrl)
}
