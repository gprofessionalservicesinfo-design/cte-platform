-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 001 — payments table
-- Run after schema.sql in Supabase SQL Editor.
-- Caches Stripe invoice data so admin dashboard never needs live Stripe calls.
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists public.payments (
  id                      uuid primary key default gen_random_uuid(),
  company_id              uuid not null references public.companies(id) on delete cascade,

  -- Stripe identifiers
  stripe_invoice_id       text unique,
  stripe_payment_intent   text,
  stripe_charge_id        text,
  stripe_customer_id      text,

  -- Amount (Stripe stores in cents)
  amount_paid             integer not null default 0,   -- cents
  amount_due              integer not null default 0,   -- cents
  currency                text not null default 'usd',

  -- Invoice metadata
  invoice_number          text,
  description             text,
  status                  text not null default 'open'
                            check (status in ('draft','open','paid','void','uncollectible')),
  invoice_pdf_url         text,
  hosted_invoice_url      text,

  -- Line items snapshot (JSONB array of {description, amount})
  line_items              jsonb,

  -- Dates
  period_start            timestamptz,
  period_end              timestamptz,
  due_date                timestamptz,
  paid_at                 timestamptz,
  created_at              timestamptz not null default now()
);

comment on table public.payments is
  'Stripe invoice records cached by the webhook handler. Source of truth for billing history.';

create index if not exists idx_payments_company     on public.payments(company_id);
create index if not exists idx_payments_stripe_inv  on public.payments(stripe_invoice_id);
create index if not exists idx_payments_status      on public.payments(company_id, status);

-- RLS
alter table public.payments enable row level security;

create policy "payments: client read"
  on public.payments for select
  using (public.owns_company(company_id) or public.is_admin());

create policy "payments: admin all"
  on public.payments for all
  using (public.is_admin());
