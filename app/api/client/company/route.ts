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
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data: company, error: companyErr } = await supabase
      .from('companies')
      .select('*')
      .eq('client_id', clientRow.id)
      .order('created_at')
      .limit(1)
      .maybeSingle()

    if (companyErr || !company) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ company })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
