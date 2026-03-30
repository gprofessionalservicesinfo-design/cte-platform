import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Future: connect to state business registries (e.g. Wyoming SOS API, Delaware API)
  // For now, always return null (manual review) — never show "unavailable" to avoid scaring clients
  return NextResponse.json({
    available: null,
    message: 'Lo verificamos manualmente en las próximas 24h y te confirmamos por email.',
  })
}
