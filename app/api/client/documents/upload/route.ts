import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

async function getUser() {
  const cookieStore = cookies()
  const t  = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token')
  const t0 = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token.0')
  const t1 = cookieStore.get('sb-rhprcuqhuesorrncswjs-auth-token.1')
  const raw = t?.value || (t0?.value ? t0.value + (t1?.value ?? '') : null)
  if (!raw) return null
  try {
    const d = JSON.parse(decodeURIComponent(raw))
    if (d?.user) return d.user
    if (d?.access_token) {
      const p = JSON.parse(Buffer.from(d.access_token.split('.')[1], 'base64').toString())
      if (p?.sub) return { id: p.sub, email: p.email }
    }
  } catch {}
  return null
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createAdminServerClient()

    // Verify client → company chain
    const { data: clientRow } = await supabase
      .from('clients').select('id').eq('user_id', user.id).single()
    if (!clientRow?.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const docType = formData.get('type') as string | null
    const companyId = formData.get('company_id') as string | null

    if (!file || !docType || !companyId) {
      return NextResponse.json({ error: 'Missing file, type or company_id' }, { status: 400 })
    }

    // Verify company belongs to this client
    const { data: company } = await supabase
      .from('companies').select('id').eq('id', companyId).eq('client_id', clientRow.id).single()
    if (!company) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const storagePath = `${companyId}/${Date.now()}_${file.name}`
    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, arrayBuffer, { contentType: file.type, upsert: false })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Storage upload failed: ' + uploadError.message },
        { status: 500 }
      )
    }

    const { data: doc, error: insertErr } = await supabase
      .from('documents')
      .insert({
        company_id: companyId,
        uploaded_by: user.id,
        type: docType,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        file_url: storagePath,
        status: 'uploaded',
      })
      .select('id')
      .single()

    if (insertErr) {
      return NextResponse.json({ error: 'DB insert failed: ' + insertErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: doc?.id, storage_path: storagePath })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
