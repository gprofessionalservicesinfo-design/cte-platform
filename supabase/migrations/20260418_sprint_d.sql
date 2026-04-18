-- Sprint D: Document editor + template metadata

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS doc_data        jsonb,
  ADD COLUMN IF NOT EXISTS template_state  text DEFAULT 'WY',
  ADD COLUMN IF NOT EXISTS template_type   text DEFAULT 'llc',
  ADD COLUMN IF NOT EXISTS is_editable     boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_edited_at  timestamptz,
  ADD COLUMN IF NOT EXISTS last_edited_by  text;

-- approval_status already added in prior migration; guard with IF NOT EXISTS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE documents ADD COLUMN approval_status text DEFAULT 'pending_approval';
  END IF;
END $$;

-- Index for admin document browser
CREATE INDEX IF NOT EXISTS idx_documents_type_created
  ON documents (type, created_at DESC);
