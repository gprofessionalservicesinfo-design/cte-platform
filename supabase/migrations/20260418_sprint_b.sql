-- Sprint B: Unified communications — mail_items column additions
-- Safe to re-run (IF NOT EXISTS / DEFAULT guards)

ALTER TABLE mail_items
  ADD COLUMN IF NOT EXISTS html_body  text,
  ADD COLUMN IF NOT EXISTS direction  text DEFAULT 'outbound'
    CHECK (direction IN ('inbound','outbound')),
  ADD COLUMN IF NOT EXISTS channel    text DEFAULT 'email'
    CHECK (channel IN ('email','whatsapp','system')),
  ADD COLUMN IF NOT EXISTS sent_by    text DEFAULT 'admin';

-- created_at already exists on mail_items (standard Supabase column)
-- Only add if genuinely missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mail_items' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE mail_items ADD COLUMN created_at timestamptz DEFAULT NOW();
  END IF;
END $$;

-- Index for unified feed ordering
CREATE INDEX IF NOT EXISTS idx_mail_items_company_created
  ON mail_items (company_id, created_at DESC);
