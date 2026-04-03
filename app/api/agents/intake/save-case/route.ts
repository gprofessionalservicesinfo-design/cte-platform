import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  let body: { agent_id?: string; status?: string; raw_response?: string; case_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { agent_id, status, raw_response } = body

  if (!agent_id) {
    return NextResponse.json(
      { success: false, error: 'Missing required field: agent_id' },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminServerClient()

    const { data, error } = await supabase
      .from('cases')
      .insert({ case_id: body.case_id ?? randomUUID(), agent_id, status, raw_response })
      .select('id')
      .single()

    if (error) {
      console.error('[intake/save-case] Supabase insert error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err: any) {
    console.error('[intake/save-case] Unexpected error:', err)
    return NextResponse.json({ success: false, error: err?.message ?? 'Unknown error' }, { status: 500 })
  }
}
