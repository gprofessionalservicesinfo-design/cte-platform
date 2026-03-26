-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 002 — document generation support
-- Run after schema.sql in Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add generation metadata columns to documents table
alter table public.documents
  add column if not exists status text
    not null default 'uploaded'
    check (status in ('draft','final','uploaded')),
  add column if not exists template_id text,           -- e.g. 'articles_CO', 'oa_single_member'
  add column if not exists generation_params jsonb,    -- snapshot of params used to generate
  add column if not exists generated_at timestamptz,   -- when it was auto-generated
  add column if not exists generated_by uuid references public.users(id) on delete set null;

comment on column public.documents.status is
  'draft = AI/admin generated, needs review; final = approved; uploaded = manually uploaded';
comment on column public.documents.template_id is
  'Identifies which template produced this document (e.g. articles_CO, oa_single_member_WY).';
comment on column public.documents.generation_params is
  'JSONB snapshot of params used at generation time, for regeneration.';

-- Index for finding generated docs by template
create index if not exists idx_documents_template_id on public.documents(company_id, template_id);
create index if not exists idx_documents_status      on public.documents(company_id, status);
