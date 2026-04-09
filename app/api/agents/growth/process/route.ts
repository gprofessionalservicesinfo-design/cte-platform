import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient }   from '@/lib/supabase/server'
import { runGrowth }                 from '@/lib/agents/growth/service'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  let body: { week_start?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { week_start } = body

  if (!week_start) {
    return NextResponse.json(
      { success: false, error: 'Missing required field: week_start' },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminServerClient()
    const result   = await runGrowth(week_start, supabase)

    if (result.skipped) {
      return NextResponse.json({ success: true, skipped: true, week_start: result.week_start })
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[growth/process] Unexpected error:', err)
    return NextResponse.json(
      { success: false, error: err?.message ?? 'Unknown error' },
      { status: 500 }
    )
  }
}
