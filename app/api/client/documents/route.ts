import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminServerClient } from '@/lib/supabase/server'

function getUserIdFromCookies(): string | null {
  const cookieStore = cookies()
  const names = [
    'sb-rhprcuqhuesorrncswjs-auth-token.0',
    'sb-rhprcuqhuesorrncswjs-auth-token',
    'sb-rhprcuqhuesorrncswjs-auth-token.1',
  ]
  for (const name of names) {
    const val = cookieStore.get(name)?.value
    if (!val) continue
    try {
      const parsed = JSON.parse(val)
      const id = parsed?.user?.id ?? parsed?.sub ?? null
      if (id) return id
    } catch {}
  }
  return null
}

export async function GET() {
  try {
    const userId = getUserIdFromCookies()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminServerClient()

    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (!client) {
      return NextResponse.json({ documents: [], company: null })
    }

    const { data: company } = await supabase
      .from('companies')
      .select('id, company_name')
      .eq('client_id', client.id)
      .order('created_at')
      .limit(1)
      .maybeSingle()

    if (!company) {
      return NextResponse.json({ documents: [], company: null })
    }

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ documents: documents ?? [], company })
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromCookies()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = createAdminServerClient()

    const { error } = await supabase.from('documents').insert({
      ...body,
      uploaded_by: userId,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
