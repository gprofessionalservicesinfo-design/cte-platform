import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY

export async function POST(request: NextRequest) {
  // Verificar API key interna de n8n
  const apiKey = request.headers.get('x-api-key')
  if (!INTERNAL_API_KEY || apiKey !== INTERNAL_API_KEY) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { agent_id?: string; status?: string; raw_response?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { agent_id, status, raw_response } = body

  if (!agent_id || !status || !raw_response) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields: agent_id, status, raw_response' },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminServerClient()

    const { data, error } = await supabase
      .from('cases')
      .insert({ agent_id, status, raw_response })
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
