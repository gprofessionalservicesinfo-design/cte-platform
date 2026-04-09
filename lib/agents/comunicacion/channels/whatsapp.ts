import twilio from 'twilio'

// Normalize any phone string to whatsapp:+E.164 format.
// Returns null if the number cannot be parsed to a valid E.164.
export function formatWhatsAppNumber(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  // Strip everything except digits and a leading +
  const digits = trimmed.replace(/[^\d+]/g, '')
  if (!digits) return null

  // Already valid E.164 (starts with + and has at least 11 chars)
  if (digits.startsWith('+') && digits.length >= 11) return `whatsapp:${digits}`

  const bare = digits.replace(/^\+/, '')

  // 10-digit US number (no country code) → prepend +1
  if (bare.length === 10) return `whatsapp:+1${bare}`

  // 11-digit starting with 1 → US/Canada, add +
  if (bare.length === 11 && bare.startsWith('1')) return `whatsapp:+${bare}`

  // Any other 10+ digit string → assume international with country code
  if (bare.length >= 10) return `whatsapp:+${bare}`

  return null
}

export async function sendWhatsAppMessage(
  phone: string,
  body:  string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const to = formatWhatsAppNumber(phone)
  if (!to) {
    console.warn('[comunicacion/whatsapp] SKIP — cannot format phone to E.164:', phone)
    return { success: false, error: `Cannot format phone: ${phone}` }
  }

  const sid  = process.env.TWILIO_ACCOUNT_SID
  const auth = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_WHATSAPP_FROM ?? 'whatsapp:+14155238886'

  if (!sid || !auth) {
    console.warn('[comunicacion/whatsapp] SKIP — TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN missing')
    return { success: false, error: 'Twilio credentials not configured' }
  }

  try {
    const client = twilio(sid, auth)
    const msg    = await client.messages.create({ from, to, body })
    console.log(`[comunicacion/whatsapp] SUCCESS — sid: ${msg.sid} | status: ${msg.status} | to: ${to}`)
    return { success: true, sid: msg.sid }
  } catch (err: any) {
    console.error(`[comunicacion/whatsapp] FAILED — code: ${err?.code} | message: ${err?.message}`)
    return { success: false, error: err?.message ?? 'Unknown Twilio error' }
  }
}
