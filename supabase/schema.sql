-- ═══════════════════════════════════════════════════════════════════════════════
-- CreaTuEmpresaUSA — schema.sql
-- Run once in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Safe to re-run: all statements use IF NOT EXISTS / ON CONFLICT guards.
--
-- Table hierarchy:
--   auth.users (Supabase managed)
--       └── users          (role, profile data — one per auth user)
--               └── clients  (CRM record — one per client user)
--                       └── companies   (LLC / Corp formation)
--                                └── documents
--                                └── ein_requests
--                                └── mail_items
--                                └── notes
--                                └── status_history
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";


-- ══════════════════════════════════════════════════════════════════════════════
-- 1. USERS
--    Extends auth.users. Holds role and basic identity.
--    Created automatically by trigger on auth signup.
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  role        text not null default 'client'
                check (role in ('client', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table  public.users        is 'One row per authenticated user. Role controls access throughout the platform.';
comment on column public.users.role   is '"client" sees only their own data. "admin" can read and write everything.';


-- ══════════════════════════════════════════════════════════════════════════════
-- 2. CLIENTS
--    CRM profile for each client user. Holds contact details and preferences.
--    One-to-one with users where role = ''client''.
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.clients (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references public.users(id) on delete cascade,
  phone               text,
  whatsapp            text,
  country             text,                       -- country of residence (ISO-3166-1 alpha-2)
  city                text,
  preferred_language  text not null default 'es' check (preferred_language in ('es','en')),
  referral_source     text,                       -- how they found us
  internal_notes      text,                       -- admin-only free text field on the client CRM card
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.clients is 'CRM profile for every client. Extended contact info beyond what auth.users holds.';


-- ══════════════════════════════════════════════════════════════════════════════
-- 3. COMPANIES
--    Each formation order. A single client may have multiple companies.
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.companies (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null references public.clients(id) on delete cascade,

  -- Formation details
  company_name        text not null,
  entity_type         text not null default 'LLC'
                        check (entity_type in ('LLC','C-Corp','S-Corp')),
  state               text not null,              -- US state of formation (e.g. 'Wyoming')
  state_code          text,                       -- 2-letter code (e.g. 'WY')
  registered_agent    text not null default 'CreaTuEmpresaUSA LLC',
  formation_date      date,
  ein                 text,                       -- IRS Employer Identification Number

  -- Order metadata
  package             text check (package in ('starter','professional','premium')),
  order_reference     text unique,                -- CTE-YYYYMMDD-XXXX from the wizard
  service_fee         numeric(10,2),
  state_fee           numeric(10,2),
  addons_total        numeric(10,2) default 0,
  total_paid          numeric(10,2),
  stripe_customer_id  text,
  stripe_session_id   text,

  -- Formation status
  status              text not null default 'name_check'
                        check (status in (
                          'name_check',       -- Verifying name availability
                          'articles_filed',   -- Articles of Organization filed with state
                          'ein_processing',   -- SS-4 submitted to IRS
                          'completed',        -- All done, documents delivered
                          'on_hold'           -- Waiting on client action
                        )),

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table  public.companies           is 'One row per formation order. A client can have multiple companies.';
comment on column public.companies.status    is 'Formation pipeline stage. Changes are logged automatically to status_history.';
comment on column public.companies.order_reference is 'Unique order ID from the frontend wizard (CTE-YYYYMMDD-XXXX).';


-- ══════════════════════════════════════════════════════════════════════════════
-- 4. EIN_REQUESTS
--    IRS Form SS-4 data collected from ein-intake.html.
--    One-to-one with companies (one EIN per company).
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.ein_requests (
  id                        uuid primary key default gen_random_uuid(),
  company_id                uuid not null unique references public.companies(id) on delete cascade,
  order_reference           text,

  -- IRS SS-4 fields
  responsible_party_name    text not null,
  responsible_party_itin    text,               -- store only last 4 digits in prod; hash/encrypt full value
  business_address          text,
  business_city             text,
  business_state            text,
  business_zip              text,
  business_country          text not null default 'US',
  principal_activity        text,               -- e.g. "Consultoría digital"
  reason_for_applying       text not null default 'Started new business',
  date_business_started     date,
  fiscal_year_end_month     smallint default 12 check (fiscal_year_end_month between 1 and 12),

  -- Processing status
  status                    text not null default 'pending'
                              check (status in ('pending','submitted','approved','rejected')),
  ein_issued                text,               -- the actual EIN once approved (XX-XXXXXXX)
  rejection_reason          text,
  submitted_at              timestamptz,
  approved_at               timestamptz,

  -- Raw JSON from ein-intake.html (preserves full intake for audit)
  intake_payload            jsonb,

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

comment on table  public.ein_requests               is 'IRS SS-4 intake data per company. One EIN request per company.';
comment on column public.ein_requests.ein_issued    is 'Format: XX-XXXXXXX. Populated by admin when IRS confirms.';


-- ══════════════════════════════════════════════════════════════════════════════
-- 5. DOCUMENTS
--    Files stored in Supabase Storage bucket "documents".
--    file_url = storage object path (use signed URL to serve).
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references public.companies(id) on delete cascade,
  uploaded_by   uuid references public.users(id) on delete set null,

  type          text not null
                  check (type in (
                    'articles',             -- Articles of Organization
                    'operating_agreement',  -- LLC Operating Agreement
                    'ein_letter',           -- IRS EIN confirmation letter
                    'formation_certificate',-- State certificate of formation
                    'annual_report',        -- Annual / biennial report
                    'other',
                    'gov_id',              -- Client: government ID / passport
                    'proof_addr',          -- Client: proof of address
                    'biz_info',            -- Client: business information
                    'members'              -- Client: member information
                  )),
  file_name     text not null,
  file_url      text not null,              -- Storage path: documents/{company_id}/{filename}
  file_size     bigint,                     -- bytes
  mime_type     text,

  created_at    timestamptz not null default now()
);

comment on table  public.documents          is 'Formation documents linked to a company. Files live in Storage bucket "documents".';
comment on column public.documents.file_url is 'Relative path inside the "documents" storage bucket. Generate signed URL on read.';


-- ══════════════════════════════════════════════════════════════════════════════
-- 6. MAIL_ITEMS
--    Forwarded physical or digital mail scanned by the registered agent.
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.mail_items (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references public.companies(id) on delete cascade,

  title         text not null,
  sender        text,
  description   text,
  category      text default 'general'
                  check (category in ('irs','state','bank','legal','general')),
  is_read       boolean not null default false,
  attachment_url text,                      -- optional scan in Storage

  received_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

comment on table public.mail_items is 'Physical or digital mail received on behalf of the company.';


-- ══════════════════════════════════════════════════════════════════════════════
-- 7. NOTES
--    Internal admin notes. Never visible to clients.
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  admin_id    uuid not null references public.users(id) on delete cascade,
  content     text not null,
  pinned      boolean not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.notes is 'Internal admin-only notes on a company/client. Hidden from clients via RLS.';


-- ══════════════════════════════════════════════════════════════════════════════
-- 8. STATUS_HISTORY
--    Immutable audit log. Auto-populated by trigger on companies.status change.
-- ══════════════════════════════════════════════════════════════════════════════
create table if not exists public.status_history (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  old_status  text,
  new_status  text not null,
  changed_by  uuid references public.users(id) on delete set null,
  note        text,                         -- optional context admin can add
  created_at  timestamptz not null default now()
);

comment on table public.status_history is 'Append-only audit trail of every formation status change.';


-- ══════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════════════════════════════
create index if not exists idx_clients_user_id         on public.clients(user_id);
create index if not exists idx_companies_client_id     on public.companies(client_id);
create index if not exists idx_companies_status        on public.companies(status);
create index if not exists idx_companies_order_ref     on public.companies(order_reference);
create index if not exists idx_ein_requests_company    on public.ein_requests(company_id);
create index if not exists idx_documents_company       on public.documents(company_id);
create index if not exists idx_mail_items_company      on public.mail_items(company_id);
create index if not exists idx_mail_items_is_read      on public.mail_items(company_id, is_read);
create index if not exists idx_notes_company           on public.notes(company_id);
create index if not exists idx_status_history_company  on public.status_history(company_id);


-- ══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════════════
alter table public.users          enable row level security;
alter table public.clients        enable row level security;
alter table public.companies      enable row level security;
alter table public.ein_requests   enable row level security;
alter table public.documents      enable row level security;
alter table public.mail_items     enable row level security;
alter table public.notes          enable row level security;
alter table public.status_history enable row level security;


-- ── RLS Helpers ───────────────────────────────────────────────────────────────

-- Returns true if the calling user has role = 'admin'
create or replace function public.is_admin()
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Returns the clients.id for the calling user (null if admin / no client row)
create or replace function public.current_client_id()
returns uuid
language sql security definer stable
as $$
  select id from public.clients where user_id = auth.uid() limit 1;
$$;

-- Returns true if the given company_id belongs to the calling client
create or replace function public.owns_company(p_company_id uuid)
returns boolean
language sql security definer stable
as $$
  select exists (
    select 1 from public.companies
    where id = p_company_id
      and client_id = public.current_client_id()
  );
$$;


-- ── 1. USERS policies ─────────────────────────────────────────────────────────
-- Clients read and update only their own row.
-- Admins read and write all rows.
create policy "users: own read"
  on public.users for select
  using (auth.uid() = id or public.is_admin());

create policy "users: own update"
  on public.users for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Prevent clients from promoting themselves to admin
    and (role = (select role from public.users where id = auth.uid()))
  );

create policy "users: admin all"
  on public.users for all
  using (public.is_admin());


-- ── 2. CLIENTS policies ───────────────────────────────────────────────────────
-- Clients read and update only their own row.
-- Admins full access.
create policy "clients: own read"
  on public.clients for select
  using (user_id = auth.uid() or public.is_admin());

create policy "clients: own update"
  on public.clients for update
  using (user_id = auth.uid());

create policy "clients: admin all"
  on public.clients for all
  using (public.is_admin());


-- ── 3. COMPANIES policies ─────────────────────────────────────────────────────
-- Clients read their own companies (via clients.user_id).
-- Clients insert companies only for themselves.
-- Admins full access.
create policy "companies: client read"
  on public.companies for select
  using (client_id = public.current_client_id() or public.is_admin());

create policy "companies: client insert"
  on public.companies for insert
  with check (client_id = public.current_client_id());

create policy "companies: admin all"
  on public.companies for all
  using (public.is_admin());


-- ── 4. EIN_REQUESTS policies ──────────────────────────────────────────────────
-- Clients read and insert their own company's EIN request.
-- Clients cannot update/delete (admin-only after submission).
-- Admins full access.
create policy "ein_requests: client read"
  on public.ein_requests for select
  using (public.owns_company(company_id) or public.is_admin());

create policy "ein_requests: client insert"
  on public.ein_requests for insert
  with check (public.owns_company(company_id));

create policy "ein_requests: admin all"
  on public.ein_requests for all
  using (public.is_admin());


-- ── 5. DOCUMENTS policies ─────────────────────────────────────────────────────
-- Clients read their own company's documents.
-- Only admins upload / delete documents.
create policy "documents: client read"
  on public.documents for select
  using (public.owns_company(company_id) or public.is_admin());

create policy "documents: admin all"
  on public.documents for all
  using (public.is_admin());


-- ── 6. MAIL_ITEMS policies ────────────────────────────────────────────────────
-- Clients read and mark-as-read their own mail.
-- Admins full access (create, delete, update).
create policy "mail_items: client read"
  on public.mail_items for select
  using (public.owns_company(company_id) or public.is_admin());

create policy "mail_items: client mark read"
  on public.mail_items for update
  using (public.owns_company(company_id))
  with check (public.owns_company(company_id));

create policy "mail_items: admin all"
  on public.mail_items for all
  using (public.is_admin());


-- ── 7. NOTES policies ─────────────────────────────────────────────────────────
-- Admins only. Clients never see notes.
create policy "notes: admin only"
  on public.notes for all
  using (public.is_admin());


-- ── 8. STATUS_HISTORY policies ────────────────────────────────────────────────
-- Clients read their own company's history (for the progress timeline).
-- Admins full access. Nobody can update or delete (append-only).
create policy "status_history: client read"
  on public.status_history for select
  using (public.owns_company(company_id) or public.is_admin());

create policy "status_history: admin insert"
  on public.status_history for insert
  with check (public.is_admin());


-- ══════════════════════════════════════════════════════════════════════════════
-- STORAGE
-- ══════════════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  52428800,   -- 50 MB per file
  array['application/pdf','image/jpeg','image/png','image/webp']
)
on conflict (id) do nothing;

-- Clients download their own company documents
create policy "storage: client read"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and (
      public.is_admin()
      or exists (
        select 1
        from public.documents d
        join public.companies c on c.id = d.company_id
        where c.client_id = public.current_client_id()
          and d.file_url = name
      )
    )
  );

-- Only admins upload documents
create policy "storage: admin insert"
  on storage.objects for insert
  with check (bucket_id = 'documents' and public.is_admin());

-- Only admins delete/update documents
create policy "storage: admin modify"
  on storage.objects for all
  using (bucket_id = 'documents' and public.is_admin());


-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ══════════════════════════════════════════════════════════════════════════════

-- ── A: Auto-create users row on auth signup ────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ── B: Auto-create clients row for new client users ───────────────────────
create or replace function public.handle_new_client()
returns trigger
language plpgsql security definer
as $$
begin
  if new.role = 'client' then
    insert into public.clients (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_user_created_client on public.users;
create trigger on_user_created_client
  after insert on public.users
  for each row execute function public.handle_new_client();


-- ── C: updated_at auto-maintenance ────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_updated_at    on public.users;
drop trigger if exists clients_updated_at  on public.clients;
drop trigger if exists companies_updated_at on public.companies;
drop trigger if exists ein_updated_at      on public.ein_requests;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

create trigger companies_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

create trigger ein_updated_at
  before update on public.ein_requests
  for
 each row execute function public.set_updated_at();


-- ── D: Auto-append to status_history on companies.status change ───────────
create or replace function public.log_status_change()
returns trigger
language plpgsql security definer
as $$
begin
  if old.status is distinct from new.status then
    insert into public.status_history (
      company_id, old_status, new_status, changed_by
    ) values (
      new.id, old.status, new.status, auth.uid()
    );
  end if;
  return new;
end;
$$;

drop trigger if exists companies_log_status on public.companies;
create trigger companies_log_status
  after update of status on public.companies
  for each row execute function public.log_status_change();


-- ══════════════════════════════════════════════════════════════════════════════
-- VIEWS  (convenience — respect RLS of underlying tables)
-- ══════════════════════════════════════════════════════════════════════════════

-- Admin dashboard: one row per company with client name and unread mail count
create or replace view public.admin_companies_view
with (security_invoker = true)
as
select
  co.id,
  co.company_name,
  co.entity_type,
  co.state,
  co.status,
  co.package,
  co.order_reference,
  co.formation_date,
  co.ein,
  co.created_at,
  co.updated_at,
  u.full_name  as client_name,
  u.email      as client_email,
  cl.phone     as client_phone,
  cl.country   as client_country,
  (
    select count(*) from public.mail_items m
    where m.company_id = co.id and m.is_read = false
  ) as unread_mail_count,
  (
    select count(*) from public.documents d
    where d.company_id = co.id
  ) as document_count
from public.companies co
join public.clients cl on cl.id = co.client_id
join public.users   u  on u.id  = cl.user_id;

comment on view public.admin_companies_view is
  'Denormalized company list for admin dashboard. Security invoker — respects RLS.';