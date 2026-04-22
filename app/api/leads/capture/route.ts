/*
  Migration — run once in Supabase SQL Editor:

  create table if not exists leads (
    id           uuid primary key default gen_random_uuid(),
    source       text not null,
    utm_source   text,
    utm_medium   text,
    utm_campaign text,
    utm_content  text,
    clicked_cta  text,
    created_at   timestamptz default now()
  );

  alter table leads enable row level security;
  -- No RLS select policy needed — only service role writes.
*/

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { source, utm_source, utm_medium, utm_campaign, utm_content, clicked_cta } = body

  if (!source) {
    return NextResponse.json({ error: 'Missing source' }, { status: 400 })
  }

  const { error } = await adminClient().from('leads').insert({
    source:      String(source),
    utm_source:  utm_source  ? String(utm_source)  : null,
    utm_medium:  utm_medium  ? String(utm_medium)  : null,
    utm_campaign: utm_campaign ? String(utm_campaign) : null,
    utm_content: utm_content ? String(utm_content) : null,
    clicked_cta: clicked_cta ? String(clicked_cta) : null,
  })

  if (error) {
    console.error('[leads/capture]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
