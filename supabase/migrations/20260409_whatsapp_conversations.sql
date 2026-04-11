-- WhatsApp conversation history for the bidirectional agent
-- Each row is one message (user or assistant) in a phone thread.

CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT        NOT NULL,                                    -- normalized E.164: '+1234567890'
  company_id   UUID        REFERENCES companies(id) ON DELETE SET NULL, -- linked if phone matches a client
  role         TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content      TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Primary access pattern: get thread history ordered by time
CREATE INDEX IF NOT EXISTS idx_wa_conv_phone_time
  ON whatsapp_conversations (phone_number, created_at DESC);

-- Secondary: query all conversations for a company (admin view)
CREATE INDEX IF NOT EXISTS idx_wa_conv_company
  ON whatsapp_conversations (company_id, created_at DESC)
  WHERE company_id IS NOT NULL;

-- Enable RLS — only service-role reads/writes (agent uses service key)
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically; no explicit policy needed.
-- Add a policy here if you want admin users to query through the anon key.
