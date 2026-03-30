import { NextResponse } from 'next/server'
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

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ accepted: false }, { status: 200 })

  const supabase = createAdminServerClient()
  const { data } = await supabase
    .from('clients')
    .select('terms_accepted_at')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ accepted: !!data?.terms_accepted_at })
}
