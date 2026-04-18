-- Sprint B: unified communications improvements to mail_items

ALTER TABLE mail_items
  ADD COLUMN IF NOT EXISTS html_body  text,
  ADD COLUMN IF NOT EXISTS direction  text DEFAULT 'outbound'
    CHECK (direction IN ('inbound', 'outbound')),
  ADD COLUMN IF NOT EXISTS channel    text DEFAULT 'email'
    CHECK (channel IN ('email', 'whatsapp', 'system')),
  ADD COLUMN IF NOT EXISTS read_at    timestamptz,
  ADD COLUMN IF NOT EXISTS sent_by    text DEFAULT 'admin';

-- Index for unified feed ordering
CREATE INDEX IF NOT EXISTS idx_mail_items_company_created
  ON mail_items (company_id, created_at DESC);
