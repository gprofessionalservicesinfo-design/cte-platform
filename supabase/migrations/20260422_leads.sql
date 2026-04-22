-- ============================================================
-- CTE Platform — Leads capture table
-- Migration: 20260422_leads.sql
-- Run this in Supabase Dashboard → SQL Editor BEFORE
-- deploying /oferta to production.
-- ============================================================

create table if not exists leads (
  id           uuid        primary key default gen_random_uuid(),
  source       text        not null,          -- e.g. 'oferta', 'landing', 'blog'
  utm_source   text,                          -- e.g. 'meta', 'google', 'instagram'
  utm_medium   text,                          -- e.g. 'cpc', 'social', 'email'
  utm_campaign text,                          -- e.g. 'llc-abril-2026'
  utm_content  text,                          -- e.g. 'video-v1', 'carousel-a'
  clicked_cta  text,                          -- 'hero', 'plan_basico', 'plan_completo', 'final'
  created_at   timestamptz not null default now()
);

-- Indexes for admin reporting queries
create index if not exists idx_leads_source
  on leads (source);

create index if not exists idx_leads_created_at
  on leads (created_at desc);

create index if not exists idx_leads_clicked_cta
  on leads (clicked_cta)
  where clicked_cta is not null;

create index if not exists idx_leads_utm_source
  on leads (utm_source)
  where utm_source is not null;

-- RLS: enabled — service_role bypasses RLS automatically.
-- No anon or authenticated INSERT policy needed.
-- No SELECT policy = zero public read access.
-- Admin queries use service_role client (already pattern in codebase).
alter table leads enable row level security;
