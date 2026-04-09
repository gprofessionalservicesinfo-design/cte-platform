-- Add WhatsApp delivery tracking fields to companies
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS whatsapp_status      TEXT,         -- 'sent' | 'failed' | 'skipped'
  ADD COLUMN IF NOT EXISTS whatsapp_provider     TEXT,         -- 'twilio'
  ADD COLUMN IF NOT EXISTS whatsapp_sent_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_error        TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_phone_used   TEXT;
