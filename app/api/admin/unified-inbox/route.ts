/**
 * GET /api/admin/unified-inbox?companyId=xxx&phone=xxx
 *
 * Returns a merged, chronologically sorted feed of:
 *   - mail_items for the company
 *   - whatsapp_conversations for the company (matched by company_id)
 *
 * Uses service role to bypass RLS on both tables.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export interface UnifiedMessage {
  id:         string
  source:     'email' | 'whatsapp'
  direction:  'inbound' | 'outbound'
  sender:     string
  content:    string
  html_body?: string | null
  title?:     string | null
  created_at: string
}

export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get('companyId')
  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 })

  const supabase = db()

  const [{ data: mailItems }, { data: waMessages }] = await Promise.all([
    supabase
      .from('mail_items')
      .select('id, title, sender, description, html_body, direction, channel, sent_by, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(100),

    supabase
      .from('whatsapp_conversations')
      .select('id, role, content, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  const emailMessages: UnifiedMessage[] = (mailItems ?? []).map(m => ({
    id:         m.id,
    source:     'email',
    direction:  (m.direction ?? 'outbound') as 'inbound' | 'outbound',
    sender:     m.sender ?? m.sent_by ?? 'admin',
    content:    m.description ?? m.title ?? '',
    html_body:  m.html_body ?? null,
    title:      m.title ?? null,
    created_at: m.created_at,
  }))

  const waMessagesNorm: UnifiedMessage[] = (waMessages ?? []).map(m => ({
    id:         m.id,
    source:     'whatsapp',
    direction:  m.role === 'user' ? 'inbound' : 'outbound',
    sender:     m.role === 'user' ? 'Cliente' : 'Admin',
    content:    m.content,
    created_at: m.created_at,
  }))

  const merged = [...emailMessages, ...waMessagesNorm].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  return NextResponse.json({ messages: merged })
}
