import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

function getUserFromCookies() {
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

export async function GET() {
  const user = getUserFromCookies()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Resolve client → company
  const { data: clientRow } = await db
    .from('clients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clientRow) return NextResponse.json({ renewals: [] })

  const { data: company } = await db
    .from('companies')
    .select('id, company_name, state, entity_type, formation_date, package')
    .eq('client_id', clientRow.id)
    .order('created_at')
    .limit(1)
    .maybeSingle()

  if (!company) return NextResponse.json({ renewals: [] })

  const { data: renewals, error } = await db
    .from('renewals')
    .select('*')
    .eq('company_id', company.id)
    .order('due_date', { ascending: true })

  if (error) {
    console.error('[client/renewals]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ renewals: renewals ?? [], company })
}
