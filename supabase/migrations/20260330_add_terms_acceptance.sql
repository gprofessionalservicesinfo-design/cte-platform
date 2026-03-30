-- Add terms acceptance tracking to clients table
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS terms_accepted_at  timestamptz,
  ADD COLUMN IF NOT EXISTS terms_accepted_ip  text;
