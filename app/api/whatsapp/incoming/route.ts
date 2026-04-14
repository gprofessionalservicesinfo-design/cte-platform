/**
 * app/api/whatsapp/incoming/route.ts
 *
 * Bidirectional WhatsApp agent powered by Claude.
 * Twilio → POST here → Claude → TwiML reply back through Twilio.
 *
 * Required env vars:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_FROM        (e.g. whatsapp:+14155238886)
 *   ANTHROPIC_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_APP_URL         (e.g. https://creatuempresausa.com)
 */

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'
import axios from 'axios'

// ── Constants ─────────────────────────────────────────────────────────────────

const CLAUDE_MODEL   = 'claude-sonnet-4-6'
const MAX_TOKENS     = 600   // concise for WhatsApp
const HISTORY_LIMIT  = 10    // past messages to include in context

const SYSTEM_PROMPT = `Eres el asesor comercial de CreaTuEmpresaUSA. Tu trabajo es cerrar ventas. NUNCA mandes al cliente a la web ni al email para ver precios. NUNCA uses emojis. Responde en español. Mensajes cortos y directos.

PRECIOS EXACTOS:
Starter: $499 + state fee
Pro: $799 + state fee
Premium: $1200 + state fee

STATE FEES:
Wyoming $100
Florida $125
Colorado $50
Delaware $90
Texas $300
New Mexico $50

TOTALES:
Wyoming Starter $599
Wyoming Pro $899
Wyoming Premium $1300
Florida Starter $624
Florida Pro $924
Florida Premium $1325
Texas Starter $799
Texas Pro $1099
Texas Premium $1500
Delaware Starter $589
Delaware Pro $889
Colorado Starter $549
Colorado Pro $849

PLANES:
Starter incluye: formacion LLC, filing, Registered Agent 1 ano.
Pro incluye todo lo anterior mas Operating Agreement, guia bancaria, soporte prioritario.
Premium incluye todo lo anterior mas fast-track, Business Address, sesion fiscal inicial.

SERVICIOS EXTRA:
Operating Agreement: $99
ITIN Evaluation: $149
Banking Setup Standard: $99
Banking Setup VIP: $249
Business Address Standard: $39/mes o $390/ano
Business Address VIP: $99/mes o $990/ano
Tax Ready System: $199
Compliance Plan: $99/ano

REGLA DE ORO: cuando el cliente pregunte precio, da el total exacto de inmediato.

RECOMENDACION POR PERFIL:
Freelance o servicios digitales: Wyoming Pro $899 total.
Ecommerce o Amazon: Wyoming o Texas Pro o Premium.
Negocio fisico: estado donde opera, Pro o Premium.
Cliente que quiere lo mas economico: Wyoming Starter $599.

CUANDO EL CLIENTE ESTE LISTO PARA COMPRAR:
1. Recomendacion clara
2. Plan y precio
3. Tarifa estatal
4. Total
5. Que incluye
6. CTA: "Puedes comenzar en creatuempresausa.com"

MANEJO DE OBJECIONES:
No vivo en EEUU: no necesitas vivir ahi para abrir tu empresa.
Por que cuesta mas que el state fee: el state fee es solo el cobro del estado, nuestro servicio cubre la gestion y estructura completa.
Quiero lo mas barato: Wyoming Starter $599 total es la opcion mas economica.
Quiero cobrar en dolares: recomiendo minimo Pro para tener mejor estructura.

NO uses emojis. NO mandes al email para precios. NO prometas tiempos exactos de gobierno. NO des asesoria legal ni fiscal.`

// ── Helpers ───────────────────────────────────────────────────────────────────

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/** Strip 'whatsapp:' prefix → normalized E.164 phone number. */
function normalizePhone(raw: string): string {
  return raw.startsWith('whatsapp:') ? raw.slice(9) : raw
}

/** Escape characters that are invalid inside XML text nodes. */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Return a TwiML <Response><Message> payload. */
function twiml(message: string): Response {
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<Response><Message>${escapeXml(message)}</Message></Response>`
  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  })
}

/** Call Claude via Anthropic API. Uses axios — same as existing codebase. */
async function askClaude(
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemOverride?: string,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

  const res = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model:      CLAUDE_MODEL,
      max_tokens: MAX_TOKENS,
      system:     systemOverride ?? SYSTEM_PROMPT,
      messages,
    },
    {
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      timeout: 12_000, // stay inside Twilio's 15s webhook timeout
    },
  )

  return (res.data?.content?.[0]?.text as string) ?? ''
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Parse Twilio webhook (application/x-www-form-urlencoded) ────────────
  const rawBody = await req.text()
  const params  = new URLSearchParams(rawBody)

  const fromRaw = params.get('From') ?? '' // 'whatsapp:+1234567890'
  const msgBody = (params.get('Body') ?? '').trim()
  const toRaw   = params.get('To')   ?? ''

  if (!fromRaw || !msgBody) {
    console.warn('[wa/incoming] Empty From or Body — ignoring')
    return twiml('') // empty TwiML = no reply
  }

  // ── 2. Validate Twilio signature ───────────────────────────────────────────
  const authToken  = process.env.TWILIO_AUTH_TOKEN ?? ''
  const signature  = req.headers.get('x-twilio-signature') ?? ''
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://creatuempresausa.com'}/api/whatsapp/incoming`

  if (authToken && signature) {
    const paramMap: Record<string, string> = {}
    params.forEach((v, k) => { paramMap[k] = v })

    const valid = twilio.validateRequest(authToken, signature, webhookUrl, paramMap)
    if (!valid) {
      console.error('[wa/incoming] Invalid Twilio signature — rejecting request')
      return new Response('Forbidden', { status: 403 })
    }
  } else {
    console.warn('[wa/incoming] Signature validation skipped — missing authToken or signature header')
  }

  const phone = normalizePhone(fromRaw)
  console.log('[wa/incoming] message from:', phone, '| chars:', msgBody.length)

  const db = adminDb()

  // ── 3. Look up existing client by phone ────────────────────────────────────
  // whatsapp_phone_used is stored in E.164 with 'whatsapp:' prefix by persistWhatsAppResult
  const { data: company } = await db
    .from('companies')
    .select('id, company_name, state, status, package')
    .or(`whatsapp_phone_used.eq.${fromRaw},whatsapp_phone_used.eq.${phone}`)
    .maybeSingle()

  // ── 4. Fetch conversation history (excluding current message) ──────────────
  let pastMessages: { role: 'user' | 'assistant'; content: string }[] = []
  try {
    const { data: history } = await db
      .from('whatsapp_conversations')
      .select('role, content')
      .eq('phone_number', phone)
      .order('created_at', { ascending: false })
      .limit(HISTORY_LIMIT)

    pastMessages = (history ?? [])
      .reverse()
      .map(r => ({ role: r.role as 'user' | 'assistant', content: r.content }))
  } catch (err) {
    // Table may not exist yet — non-fatal, agent still responds without history
    console.warn('[wa/incoming] Could not fetch history (migration not applied?):', err)
  }

  // Current message appended — Claude sees the full thread
  const messages: { role: 'user' | 'assistant'; content: string }[] = [
    ...pastMessages,
    { role: 'user', content: msgBody },
  ]

  // ── 5. Build context-aware system prompt ──────────────────────────────────
  let systemPrompt = SYSTEM_PROMPT
  if (company) {
    const pkgLabel: Record<string, string> = {
      starter: 'Plan Starter', professional: 'Plan Pro', premium: 'Plan Premium',
    }
    systemPrompt +=
      `\n\nINFO DEL CLIENTE IDENTIFICADO:\n` +
      `- Empresa: ${company.company_name}\n` +
      `- Estado de formación: ${company.state || 'no especificado'}\n` +
      `- Plan: ${pkgLabel[company.package ?? ''] ?? company.package ?? 'no especificado'}\n` +
      `- Estado del proceso: ${company.status || 'pendiente'}\n` +
      `Puedes referirte al cliente por el nombre de su empresa y dar contexto específico sobre su proceso.`
    console.log('[wa/incoming] matched client company_id:', company.id)
  }

  // ── 6. Call Claude ─────────────────────────────────────────────────────────
  const fallbackReply =
    'Lo siento, estoy teniendo dificultades técnicas en este momento. ' +
    'Por favor escribe a soporte@creatuempresausa.com y te atenderemos a la brevedad. 🙏'

  let reply = fallbackReply
  try {
    const raw = await askClaude(messages, systemPrompt)
    if (raw.trim()) reply = raw.trim()
  } catch (err: any) {
    console.error('[wa/incoming] Claude error:', err?.message ?? err)
  }

  // ── 7. Persist both messages ───────────────────────────────────────────────
  try {
    await db.from('whatsapp_conversations').insert([
      {
        phone_number: phone,
        company_id:  company?.id ?? null,
        role:        'user',
        content:     msgBody,
      },
      {
        phone_number: phone,
        company_id:  company?.id ?? null,
        role:        'assistant',
        content:     reply,
      },
    ])
  } catch (err) {
    console.warn('[wa/incoming] Could not persist messages:', err)
  }

  console.log('[wa/incoming] replied to:', phone, '| reply chars:', reply.length)

  // ── 8. Return TwiML ────────────────────────────────────────────────────────
  return twiml(reply)
}

// Twilio sends GET to verify the webhook URL is reachable during setup
export async function GET() {
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    { status: 200, headers: { 'Content-Type': 'text/xml' } },
  )
}
