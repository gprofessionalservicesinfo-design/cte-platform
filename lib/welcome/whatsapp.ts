/**
 * Shared WhatsApp welcome messaging logic.
 * Used by: webhook, admin resend-whatsapp.
 * Single source of truth — do not duplicate in route files.
 */
import twilio from 'twilio'

export interface WhatsAppResult {
  success:        boolean
  send_attempted: boolean
  to:             string | null
  provider:       string
  sid?:           string
  status?:        string
  error_code?:    string | number
  error_message?: string
  skip_reason?:   string
}

/** Convert any phone string to "whatsapp:+E164" or return null if unparseable. */
export function formatWhatsAppNumber(raw: string): string | null {
  if (!raw) return null
  // Already formatted
  if (raw.startsWith('whatsapp:')) {
    const rest = raw.slice(9)
    return rest.startsWith('+') && rest.length >= 11 ? raw : null
  }
  const trimmed = raw.trim()
  if (!trimmed) return null
  const digits = trimmed.replace(/[^\d+]/g, '')
  if (!digits) return null
  if (digits.startsWith('+') && digits.length >= 11) return `whatsapp:${digits}`
  const bare = digits.replace(/^\+/, '')
  if (bare.length === 10)                             return `whatsapp:+1${bare}`
  if (bare.length === 11 && bare.startsWith('1'))     return `whatsapp:+${bare}`
  if (bare.length >= 10)                              return `whatsapp:+${bare}`
  return null
}

/**
 * Send a WhatsApp welcome message via Twilio.
 * Validates credentials, detects sandbox vs production mode,
 * and returns a structured result — never throws.
 */
export async function sendWelcomeWhatsApp(opts: {
  phone:        string
  customerName: string
  companyName:  string
  stateName:    string
}): Promise<WhatsAppResult> {
  const provider = 'twilio'

  console.log('[whatsapp] entering welcome message flow')
  console.log('[whatsapp] resolved_phone (raw):', opts.phone || '(empty)')

  const to = formatWhatsAppNumber(opts.phone)
  console.log('[whatsapp] resolved_phone (E.164):', to ?? 'INVALID — will skip')

  if (!to) {
    const reason = `Phone "${opts.phone}" could not be formatted to E.164`
    console.warn('[whatsapp] skipping —', reason)
    return { success: false, send_attempted: false, to: null, provider, skip_reason: reason }
  }

  const from      = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886'
  const sid       = process.env.TWILIO_ACCOUNT_SID
  const auth      = process.env.TWILIO_AUTH_TOKEN
  const isSandbox = !process.env.TWILIO_WHATSAPP_FROM

  console.log('[whatsapp] provider:       ', provider)
  console.log('[whatsapp] from:           ', from)
  console.log('[whatsapp] mode:           ', isSandbox ? 'SANDBOX (join keyword required)' : 'PRODUCTION')
  console.log('[whatsapp] sid_present:    ', !!sid)
  console.log('[whatsapp] auth_present:   ', !!auth)

  if (!sid || !auth) {
    const reason = 'TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set in environment'
    console.warn('[whatsapp] skipping —', reason)
    return { success: false, send_attempted: false, to, provider, skip_reason: reason }
  }

  if (isSandbox) {
    console.warn('[whatsapp] SANDBOX MODE — recipient must have sent join keyword to +14155238886')
    console.warn('[whatsapp] If message fails with 63016, recipient has not joined the sandbox')
  }

  // Build message — neutral if customerName is missing/default
  const greeting = opts.customerName && opts.customerName !== 'Cliente'
    ? `Hola ${opts.customerName}! 🎉`
    : `¡Hola! 🎉`

  const msgBody =
    `${greeting} Bienvenido a CreaTuEmpresaUSA.\n\n` +
    `Tu orden para *${opts.companyName}*${opts.stateName ? ` en *${opts.stateName}*` : ''} ha sido recibida exitosamente.\n\n` +
    `Nuestro equipo comenzará a procesar tu caso en las próximas 24 horas.\n\n` +
    `Accede a tu portal: https://creatuempresausa.com/dashboard\n\n` +
    `¿Tienes alguna pregunta? Estamos aquí para ayudarte.\n\n` +
    `— Equipo CreaTuEmpresaUSA`

  console.log('[whatsapp] sending...')
  console.log('[whatsapp] to:', to, '| from:', from)

  try {
    const client = twilio(sid, auth)

    const messageOptions: any = {
      from: from,
      to: to,   // already normalized to "whatsapp:+E164" by formatWhatsAppNumber
    }

    const templateSid = process.env.TWILIO_WELCOME_TEMPLATE_SID
    if (templateSid) {
      messageOptions.contentSid = templateSid
      messageOptions.contentVariables = JSON.stringify({
        "1": opts.customerName,
        "2": opts.companyName,
      })
    } else {
      messageOptions.body = msgBody
    }

    const msg = await client.messages.create(messageOptions)

    console.log('[whatsapp] sent successfully')
    console.log('[whatsapp] provider_sid:    ', msg.sid)
    console.log('[whatsapp] provider_status: ', msg.status)

    return { success: true, send_attempted: true, to, provider, sid: msg.sid, status: msg.status }

  } catch (err: any) {
    console.error('[whatsapp] FAILED to send')
    console.error('[whatsapp] error_code:   ', err?.code    ?? 'unknown')
    console.error('[whatsapp] error_message:', err?.message ?? 'unknown')

    if (err?.code === 63016) {
      console.error('[whatsapp] DIAGNOSIS: Sandbox — recipient has not joined. Text "join <keyword>" to +14155238886')
    } else if (err?.code === 63007) {
      console.error('[whatsapp] DIAGNOSIS: No WhatsApp-enabled phone found for the from address')
    } else if (err?.code === 21608) {
      console.error('[whatsapp] DIAGNOSIS: Unverified number in Twilio account')
    } else if (err?.code === 63003) {
      console.error('[whatsapp] DIAGNOSIS: Template required for production business-initiated messages')
    }

    return {
      success: false, send_attempted: true,
      to, provider,
      error_code:    err?.code,
      error_message: err?.message,
    }
  }
}

/**
 * Persist WhatsApp send result to companies table.
 * Safe to call even if columns don't exist yet (try/catch).
 */
export async function persistWhatsAppResult(
  supabase: any,
  companyId: string,
  waResult: WhatsAppResult,
  rawPhone: string,
): Promise<void> {
  const update: Record<string, any> = {
    whatsapp_provider:   waResult.provider,
    whatsapp_phone_used: waResult.to || formatWhatsAppNumber(rawPhone) || rawPhone || null,
  }

  if (waResult.success) {
    update.whatsapp_status  = 'sent'
    update.whatsapp_sent_at = new Date().toISOString()
    update.whatsapp_error   = null
  } else if (!waResult.send_attempted) {
    update.whatsapp_status = 'skipped'
    update.whatsapp_error  = waResult.skip_reason ?? null
  } else {
    update.whatsapp_status = 'failed'
    update.whatsapp_error  = waResult.error_message
      ? `code:${waResult.error_code} — ${waResult.error_message}`
      : (waResult.skip_reason ?? 'unknown error')
  }

  try {
    await supabase.from('companies').update(update).eq('id', companyId)
  } catch {
    // columns not yet migrated — ignore silently
  }
}
