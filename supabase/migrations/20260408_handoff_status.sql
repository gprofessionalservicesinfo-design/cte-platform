-- customer_handoff_status
-- Tracks where each case stands in the post-payment handoff flow
-- Apply in: Supabase SQL Editor

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS customer_handoff_status TEXT DEFAULT 'confirmation_sent';

-- Backfill completed cases
UPDATE companies
SET customer_handoff_status = 'active_processing'
WHERE status IN ('in_progress', 'active', 'ein_obtained',
                 'name_check', 'under_review', 'articles_filed',
                 'ein_processing')
  AND customer_handoff_status = 'confirmation_sent';

UPDATE companies
SET customer_handoff_status = 'portal_ready'
WHERE status = 'completed'
  AND customer_handoff_status = 'confirmation_sent';
