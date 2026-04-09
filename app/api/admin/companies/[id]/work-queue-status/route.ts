import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const VALID = ['new', 'assigned', 'working', 'blocked', 'done'] as const

function db() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json()
  const status = body?.work_queue_status

  if (!VALID.includes(status)) {
    return NextResponse.json({ error: 'Invalid work_queue_status' }, { status: 400 })
  }

  const { error } = await db()
    .from('companies')
    .update({ work_queue_status: status, last_internal_update_at: new Date().toISOString() })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
