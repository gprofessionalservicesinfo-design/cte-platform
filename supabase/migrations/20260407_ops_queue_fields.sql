-- Operations Queue fields
-- Adds: order_status, work_queue_status, next_action, case_owner, operations_checklist
-- Apply in: Supabase SQL Editor

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS order_status         TEXT    DEFAULT 'paid',
  ADD COLUMN IF NOT EXISTS work_queue_status    TEXT    DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS next_action          TEXT,
  ADD COLUMN IF NOT EXISTS case_owner           TEXT,
  ADD COLUMN IF NOT EXISTS operations_checklist JSONB   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_internal_update_at TIMESTAMPTZ;

-- Backfill order_status from existing status column
UPDATE companies
SET order_status = CASE
  WHEN status = 'completed'                        THEN 'completed'
  WHEN status IN ('in_progress', 'active',
                  'ein_obtained', 'name_check',
                  'under_review', 'articles_filed',
                  'ein_processing')               THEN 'in_progress'
  WHEN status = 'on_hold'                          THEN 'on_hold'
  ELSE 'paid'
END
WHERE order_status = 'paid' OR order_status IS NULL;

-- Backfill work_queue_status for completed cases
UPDATE companies
SET work_queue_status = 'done'
WHERE status = 'completed' AND work_queue_status = 'new';

UPDATE companies
SET work_queue_status = 'working'
WHERE status IN ('in_progress', 'active', 'ein_obtained',
                 'name_check', 'under_review', 'articles_filed',
                 'ein_processing')
  AND work_queue_status = 'new';
