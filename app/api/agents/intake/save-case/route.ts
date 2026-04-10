import { NextRequest, NextResponse } from 'next/server'

/**
 * DEPRECATED — this endpoint is no longer called by n8n.
 * Intake (LLM call + normalized_output) is handled entirely inside
 * the Stripe webhook (app/api/stripe/webhook/route.ts) immediately
 * after the client/company/case rows are created.
 *
 * Remove the n8n step that calls this endpoint.
 * Returns 410 Gone so any remaining calls are clearly flagged in logs.
 */
export async function POST(_request: NextRequest) {
  console.warn('[intake/save-case] DEPRECATED — endpoint disabled. Remove n8n step that calls this route.')
  return NextResponse.json(
    {
      success:    false,
      deprecated: true,
      message:    'This endpoint is deprecated. Intake is now handled by the Stripe webhook. Remove this n8n step.',
    },
    { status: 410 }
  )
}
