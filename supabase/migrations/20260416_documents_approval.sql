-- Add approval workflow columns to documents table

ALTER TABLE documents ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'draft'
  CHECK (approval_status IN ('draft', 'pending_approval', 'approved', 'rejected'));
ALTER TABLE documents ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS approved_by_client boolean DEFAULT false;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS admin_notes text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS generated_from text; -- 'auto' | 'manual'
