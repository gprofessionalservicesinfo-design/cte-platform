import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient }  from '@/lib/supabase/server'
import { runClasificador }          from '@/lib/agents/clasificador/service'

// Vercel: allow up to 60s — LLM calls require more than the 10s default
export const maxDuration = 60

export async function POST(request: NextRequest) {
  let body: { case_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { case_id } = body
  if (!case_id || typeof case_id !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Missing required field: case_id' },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminServerClient()
    const result   = await runClasificador(case_id, supabase)

    if (result.skipped) {
      return NextResponse.json({ success: true, skipped: true, case_id }, { status: 200 })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[clasificador/process] Unexpected error:', err)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
