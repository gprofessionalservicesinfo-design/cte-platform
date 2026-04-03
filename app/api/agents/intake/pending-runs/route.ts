import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'

// Reconciliation endpoint for n8n cron.
// Returns agent_runs that are failed, pending, or stuck in 'running'
// for more than 10 minutes — safe to retry.
// n8n polls this and re-triggers the intake flow for each result.

export async function GET(request: NextRequest) {
  const supabase = createAdminServerClient()

  // Stuck threshold: runs marked 'running' for over 10 minutes are considered hung
  const stuckThreshold = new Date(Date.now() - 10 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('agent_runs')
    .select('id, agent_id, source_ref_id, status, retry_count, started_at, error_message')
    .eq('agent_id', 'intake')
    .or(`status.in.(failed,pending),and(status.eq.running,started_at.lt.${stuckThreshold})`)
    .order('started_at', { ascending: true })

  if (error) {
    console.error('[intake/pending-runs] Query error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    count:   data.length,
    runs:    data,
  })
}
