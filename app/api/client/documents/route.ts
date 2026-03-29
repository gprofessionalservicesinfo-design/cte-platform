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

export async function GET(_req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createAdminServerClient()

    const { data: clientRow } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!clientRow?.id) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const { data: company, error: companyErr } = await supabase
      .from('companies')
      .select('id, company_name, state, entity_type')
      .eq('client_id', clientRow.id)
      .order('created_at')
      .limit(1)
      .maybeSingle()

    if (companyErr || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const { data: documents, error: docsErr } = await supabase
      .from('documents')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })

    if (docsErr) {
      return NextResponse.json({ error: docsErr.message }, { status: 500 })
    }

    return NextResponse.json({ documents: documents ?? [], company })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { company_id, type, file_name, file_size, mime_type, storage_path, status } = body

    if (!company_id || !type || !storage_path) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminServerClient()

    // Verify the company belongs to this user via clients table
    const { data: clientRow } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!clientRow?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: company, error: companyErr } = await supabase
      .from('companies')
      .select('id')
      .eq('id', company_id)
      .eq('client_id', clientRow.id)
      .single()

    if (companyErr || !company) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: doc, error: insertErr } = await supabase
      .from('documents')
      .insert({
        company_id,
        uploaded_by: user.id,
        type,
        file_name,
        file_size,
        mime_type,
        storage_path,
        file_url: storage_path,
        status: status ?? 'uploaded',
      })
      .select('id')
      .single()

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: doc?.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
