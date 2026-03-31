-- Sprint 3: Add wizard data columns to companies + pending_orders table
-- Run this in Supabase Dashboard → SQL Editor

-- 1. Add wizard fields to companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS alternate_name_1  text,
  ADD COLUMN IF NOT EXISTS alternate_name_2  text,
  ADD COLUMN IF NOT EXISTS members_count     text,
  ADD COLUMN IF NOT EXISTS business_activity text,
  ADD COLUMN IF NOT EXISTS notes_from_wizard text;

-- 2. Add terms_accepted columns to clients (if not already added)
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS terms_accepted_at   timestamptz,
  ADD COLUMN IF NOT EXISTS terms_accepted_ip   text;

-- 3. Create pending_orders table for wizard-to-webhook data relay
CREATE TABLE IF NOT EXISTS public.pending_orders (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
  payload    jsonb NOT NULL,
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pending_orders_email_key UNIQUE (email)
);

-- Index for fast lookup by email
CREATE INDEX IF NOT EXISTS pending_orders_email_idx ON public.pending_orders (email);

-- RLS: only service role can read/write (webhook uses service role key)
ALTER TABLE public.pending_orders ENABLE ROW LEVEL SECURITY;

-- No public access — service role bypasses RLS automatically
