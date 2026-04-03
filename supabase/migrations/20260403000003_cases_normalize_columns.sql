-- ============================================================
-- CTE Platform — Cases: normalized output columns
-- Migration: 20260403000003_cases_normalize_columns.sql
-- Points 6, 8: store LLM normalized output in cases table
-- ============================================================
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS normalized_output      jsonb,
  ADD COLUMN IF NOT EXISTS confidence_score       float8,
  ADD COLUMN IF NOT EXISTS requires_human_review  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS normalization_applied  boolean NOT NULL DEFAULT false;
