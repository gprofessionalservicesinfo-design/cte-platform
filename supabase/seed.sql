-- ═══════════════════════════════════════════════════════════════════════════════
-- CreaTuEmpresaUSA — seed.sql
-- Run AFTER schema.sql.
--
-- STEP 1 — Create users in Supabase Auth first:
--   Dashboard → Authentication → Users → "Add user" (confirm email checked off)
--
--   Email                          Password       Role (in metadata)
--   ─────────────────────────────  ─────────────  ──────────────────
--   admin@creatuempresausa.com     Admin1234!     admin
--   maria.gonzalez@example.com     Client1234!    client
--   carlos.mendoza@example.com     Client1234!    client
--
--   Alternatively via Supabase CLI:
--   supabase auth users create --email admin@creatuempresausa.com ...
--
-- STEP 2 — Copy the generated UUIDs into the three variables below.
--
-- STEP 3 — Run this file in SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── ❶ SET THESE UUIDS (copy from Auth → Users) ───────────────────────────────
do $$
declare
  -- Auth UUIDs (paste from Supabase Dashboard → Authentication → Users)
  v_admin_auth_id   uuid := '00000000-0000-0000-0000-000000000001';
  v_maria_auth_id   uuid := '00000000-0000-0000-0000-000000000002';
  v_carlos_auth_id  uuid := '00000000-0000-0000-0000-000000000003';

  -- Derived IDs (auto-generated — do not touch)
  v_maria_client_id  uuid;
  v_carlos_client_id uuid;
  v_maria_company_id uuid := 'cccccccc-1111-0000-0000-000000000001';
  v_carlos_company_id uuid := 'cccccccc-2222-0000-0000-000000000002';

begin

-- ═══════════════════════════════════════════════════════════════════════════════
-- USERS
-- The trigger handle_new_user() should have already inserted rows when you
-- created the auth users above. This block uses INSERT ... ON CONFLICT to
-- safely set the correct role in case the metadata was not set via the UI.
-- ═══════════════════════════════════════════════════════════════════════════════
insert into public.users (id, email, full_name, role) values
  (v_admin_auth_id,  'admin@creatuempresausa.com',   'Admin CTE',       'admin'),
  (v_maria_auth_id,  'maria.gonzalez@example.com',   'María González',  'client'),
  (v_carlos_auth_id, 'carlos.mendoza@example.com',   'Carlos Mendoza',  'client')
on conflict (id) do update
  set full_name = excluded.full_name,
      role      = excluded.role,
      updated_at = now();

-- ═══════════════════════════════════════════════════════════════════════════════
-- CLIENTS
-- The trigger handle_new_client() should have created client rows automatically.
-- This block uses INSERT ... ON CONFLICT DO NOTHING as a safe fallback.
-- ═══════════════════════════════════════════════════════════════════════════════
insert into public.clients (user_id, phone, whatsapp, country, city, preferred_language, referral_source)
values
  (v_maria_auth_id,  '+57 300 123 4567', '+57 300 123 4567', 'CO', 'Bogotá',      'es', 'Google'),
  (v_carlos_auth_id, '+52 55 1234 5678', '+52 55 1234 5678', 'MX', 'Ciudad de México', 'es', 'Referido')
on conflict (user_id) do update
  set phone    = excluded.phone,
      country  = excluded.country,
      city     = excluded.city,
      updated_at = now();

-- Capture client IDs for use in companies/notes
select id into v_maria_client_id  from public.clients where user_id = v_maria_auth_id;
select id into v_carlos_client_id from public.clients where user_id = v_carlos_auth_id;

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPANIES
-- ═══════════════════════════════════════════════════════════════════════════════
insert into public.companies (
  id, client_id,
  company_name, entity_type, state, state_code,
  registered_agent, formation_date, ein,
  package, order_reference,
  service_fee, state_fee, addons_total, total_paid,
  stripe_customer_id, status
) values
  (
    v_maria_company_id,
    v_maria_client_id,
    'González Ventures LLC',
    'LLC', 'Wyoming', 'WY',
    'CreaTuEmpresaUSA LLC',
    '2025-12-15',
    '87-1234567',
    'professional',
    'CTE-20251215-4821',
    437.00, 62.00, 0.00, 499.00,
    'cus_test_maria001',
    'completed'
  ),
  (
    v_carlos_company_id,
    v_carlos_client_id,
    'Mendoza Digital Corp',
    'LLC', 'Colorado', 'CO',
    'CreaTuEmpresaUSA LLC',
    '2026-01-20',
    null,
    'premium',
    'CTE-20260120-7734',
    737.00, 50.00, 79.00, 866.00,
    'cus_test_carlos002',
    'ein_processing'
  )
on conflict (id) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STATUS HISTORY  (manual seed — trigger only fires on UPDATE, not INSERT)
-- ═══════════════════════════════════════════════════════════════════════════════
insert into public.status_history
  (company_id, old_status, new_status, changed_by, note, created_at)
values
  -- María: full journey (4 transitions)
  (v_maria_company_id, null,             'name_check',     v_admin_auth_id,
   'Orden recibida. Verificando disponibilidad del nombre.',     '2025-12-15 10:00:00+00'),
  (v_maria_company_id, 'name_check',     'articles_filed', v_admin_auth_id,
   'Nombre disponible. Articles of Organization radicados.',    '2025-12-17 14:30:00+00'),
  (v_maria_company_id, 'articles_filed', 'ein_processing', v_admin_auth_id,
   'Estado aprobó documentos. SS-4 enviado al IRS.',            '2025-12-22 09:15:00+00'),
  (v_maria_company_id, 'ein_processing', 'completed',      v_admin_auth_id,
   'EIN 87-1234567 asignado por el IRS. Proceso completado.',   '2026-01-08 16:00:00+00'),

  -- Carlos: in progress (3 transitions)
  (v_carlos_company_id, null,             'name_check',     v_admin_auth_id,
   'Orden recibida. Verificando nombre en Colorado.',            '2026-01-20 11:00:00+00'),
  (v_carlos_company_id, 'name_check',     'articles_filed', v_admin_auth_id,
   'Nombre disponible. Articles radicados en Colorado.',         '2026-01-23 10:00:00+00'),
  (v_carlos_company_id, 'articles_filed', 'ein_processing', v_admin_auth_id,
   'Documentos aprobados. SS-4 enviado al IRS. Espera 2-4 sem.','2026-01-28 15:00:00+00')
on conflict do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- EIN REQUESTS
-- ═══════════════════════════════════════════════════════════════════════════════
insert into public.ein_requests (
  company_id, order_reference,
  responsible_party_name,
  business_address, business_city, business_state, business_zip, business_country,
  principal_activity, reason_for_applying, date_business_started,
  status, ein_issued, submitted_at, approved_at,
  intake_payload
) values
  (
    v_maria_company_id,
    'CTE-20251215-4821',
    'María González',
    '123 Main St Ste 100', 'Cheyenne', 'WY', '82001', 'US',
    'Consultoría digital y marketing',
    'Started new business',
    '2025-12-15',
    'approved',
    '87-1234567',
    '2025-12-22 09:15:00+00',
    '2026-01-08 16:00:00+00',
    '{"source":"ein-intake.html","plan":"professional","state":"Wyoming","version":1}'::jsonb
  ),
  (
    v_carlos_company_id,
    'CTE-20260120-7734',
    'Carlos Mendoza',
    '456 Commerce Blvd', 'Denver', 'CO', '80202', 'US',
    'E-commerce y ventas en línea',
    'Started new business',
    '2026-01-20',
    'submitted',
    null,
    '2026-01-28 15:00:00+00',
    null,
    '{"source":"ein-intake.html","plan":"premium","state":"Colorado","version":1}'::jsonb
  )
on conflict (company_id) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DOCUMENTS  (file_url = path inside Storage bucket "documents")
-- Upload matching placeholder PDFs via Storage dashboard or CLI.
-- ═══════════════════════════════════════════════════════════════════════════════
insert into public.documents
  (company_id, uploaded_by, type, file_name, file_url, file_size, mime_type, created_at)
values
  -- María: complete set
  (v_maria_company_id, v_admin_auth_id,
   'articles',
   'Articles_of_Organization_WY.pdf',
   'cccccccc-1111-0000-0000-000000000001/articles_wy.pdf',
   245120, 'application/pdf', '2025-12-17 14:30:00+00'),

  (v_maria_company_id, v_admin_auth_id,
   'operating_agreement',
   'Operating_Agreement_Gonzalez_Ventures.pdf',
   'cccccccc-1111-0000-0000-000000000001/operating_agreement.pdf',
   312000, 'application/pdf', '2025-12-18 10:00:00+00'),

  (v_maria_company_id, v_admin_auth_id,
   'ein_letter',
   'EIN_Confirmation_Letter_IRS.pdf',
   'cccccccc-1111-0000-0000-000000000001/ein_letter.pdf',
   89600, 'application/pdf', '2026-01-08 16:00:00+00'),

  -- Carlos: in-progress set
  (v_carlos_company_id, v_admin_auth_id,
   'articles',
   'Articles_of_Organization_CO.pdf',
   'cccccccc-2222-0000-0000-000000000002/articles_co.pdf',
   231424, 'application/pdf', '2026-01-23 10:00:00+00'),

  (v_carlos_company_id, v_admin_auth_id,
   'operating_agreement',
   'Operating_Agreement_Mendoza_Digital.pdf',
   'cccccccc-2222-0000-0000-000000000002/operating_agreement.pdf',
   298000, 'application/pdf', '2026-01-24 09:00:00+00')
on conflict do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- MAIL ITEMS
-- ═══════════════════════════════════════════════════════════════════════════════
insert into public.mail_items
  (company_id, title, sender, description, category, is_read, received_at)
values
  (v_maria_company_id,
   '🎉 Tu LLC está activa en Wyoming — próximos pasos',
   'equipo@creatuempresausa.com',
   'Tu empresa González Ventures LLC ha sido formada exitosamente. EIN 87-1234567 asignado. Revisa tus documentos en el portal.',
   'general', true,  '2026-01-08 17:00:00+00'),

  (v_maria_company_id,
   'IRS: CP575 — EIN Assignment Letter',
   'Internal Revenue Service',
   'Your Employer Identification Number (EIN) 87-1234567 has been assigned to González Ventures LLC.',
   'irs', true, '2026-01-09 08:00:00+00'),

  (v_maria_company_id,
   'Recordatorio: Annual Report Wyoming — vence febrero 2027',
   'equipo@creatuempresausa.com',
   'El Annual Report de tu LLC tiene costo $62 y vence en febrero 2027. Te avisaremos 60 días antes.',
   'state', false, '2026-02-01 09:00:00+00'),

  (v_carlos_company_id,
   '✅ Articles of Organization radicados en Colorado',
   'equipo@creatuempresausa.com',
   'Hemos radicado los Articles of Organization para Mendoza Digital Corp en Colorado. Siguiente paso: obtener tu EIN.',
   'general', false, '2026-01-23 11:00:00+00'),

  (v_carlos_company_id,
   '⏳ EIN en proceso — IRS confirmó recepción del SS-4',
   'equipo@creatuempresausa.com',
   'El IRS recibió tu formulario SS-4. Tiempo estimado: 2-4 semanas. Te notificaremos en cuanto tengamos el número.',
   'irs', false, '2026-01-28 16:00:00+00')
on conflict do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- NOTES  (admin-only, never visible to clients)
-- ═══════════════════════════════════════════════════════════════════════════════
insert into public.notes (company_id, admin_id, content, pinned, created_at)
values
  (v_maria_company_id, v_admin_auth_id,
   'Cliente muy activa. Preguntó sobre Mercury Bank. Ofrecer asesoría bancaria si escribe de nuevo.',
   false, '2025-12-18 10:30:00+00'),

  (v_maria_company_id, v_admin_auth_id,
   'EIN confirmado. Carta CP575 enviada por email. Caso cerrado ✓',
   true,  '2026-01-08 16:30:00+00'),

  (v_carlos_company_id, v_admin_auth_id,
   'Cliente de México. Necesita ITIN también — informar sobre servicio ITIN ($149). SS-4 enviado vía fax el 28-ene.',
   true,  '2026-01-28 15:30:00+00'),

  (v_carlos_company_id, v_admin_auth_id,
   'IRS confirmó recepción del SS-4. Referencia de control: SS4-2026-0128-CO.',
   false, '2026-01-30 09:00:00+00')
on conflict do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PAYMENTS  (run AFTER migrations/001_add_payments.sql)
-- Sample paid invoice for María and an open invoice for Carlos.
-- ═══════════════════════════════════════════════════════════════════════════════
insert into public.payments (
  company_id,
  stripe_invoice_id,
  stripe_customer_id,
  amount_paid, amount_due, currency,
  invoice_number, description,
  status, invoice_pdf_url, hosted_invoice_url,
  line_items,
  period_start, period_end,
  paid_at, created_at
) values
  -- María: paid invoice (formation)
  (
    v_maria_company_id,
    'in_test_maria_formation_001',
    'cus_test_maria001',
    49900, 49900, 'usd',
    'CTE-0001',
    'Plan Professional — González Ventures LLC (Wyoming)',
    'paid',
    null, null,
    '[{"description":"Formación LLC + EIN (Plan Professional)","amount":43700,"currency":"usd"},{"description":"State filing fee — Wyoming","amount":6200,"currency":"usd"}]'::jsonb,
    '2025-12-15 00:00:00+00',
    '2025-12-15 23:59:59+00',
    '2025-12-15 12:30:00+00',
    '2025-12-15 12:30:00+00'
  ),
  -- Carlos: open/pending invoice (formation)
  (
    v_carlos_company_id,
    'in_test_carlos_formation_001',
    'cus_test_carlos002',
    0, 86600, 'usd',
    'CTE-0002',
    'Plan Premium — Mendoza Digital Corp (Colorado)',
    'open',
    null, null,
    '[{"description":"Formación LLC + EIN + Banking (Plan Premium)","amount":73700,"currency":"usd"},{"description":"State filing fee — Colorado","amount":5000,"currency":"usd"},{"description":"Asesoría Bancaria (add-on)","amount":7900,"currency":"usd"}]'::jsonb,
    '2026-01-20 00:00:00+00',
    '2026-01-20 23:59:59+00',
    null,
    '2026-01-20 11:00:00+00'
  )
on conflict (stripe_invoice_id) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — verify with the query below
-- ═══════════════════════════════════════════════════════════════════════════════
raise notice '✅ Seed complete. Run the verification query below to confirm.';

end $$;


-- ── VERIFICATION QUERY ────────────────────────────────────────────────────────
-- Run this after the seed to confirm all rows were inserted:
/*
select
  u.email,
  u.role,
  co.company_name,
  co.status,
  co.package,
  count(distinct d.id)   as documents,
  count(distinct m.id)   as mail_items,
  count(distinct n.id)   as notes,
  count(distinct sh.id)  as status_events,
  count(distinct er.id)  as ein_requests
from public.users u
join public.clients cl  on cl.user_id  = u.id
join public.companies co on co.client_id = cl.id
left join public.documents     d  on d.company_id  = co.id
left join public.mail_items    m  on m.company_id  = co.id
left join public.notes         n  on n.company_id  = co.id
left join public.status_history sh on sh.company_id = co.id
left join public.ein_requests  er on er.company_id  = co.id
group by u.email, u.role, co.company_name, co.status, co.package
order by u.email;
*/
