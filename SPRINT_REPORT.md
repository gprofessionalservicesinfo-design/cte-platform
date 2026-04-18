# Sprint Report — B + C + D

## Sprint B — Unified Communications

### What was built
- **`supabase/migrations/20260418_sprint_b.sql`** — Adds `html_body`, `direction`, `channel`, `sent_by` columns to `mail_items`. Safe to re-run.
- **`components/admin/unified-inbox.tsx`** — Single chronological feed merging `mail_items` + `whatsapp_conversations` per company. Channel toggle (Email/WhatsApp), 4 quick-reply templates, send bar.
- **`app/(admin)/admin/clients/[id]/page.tsx`** — Replaced `MailItemsPanel` with `<UnifiedInbox>` component.
- **`app/api/admin/send-client-email/route.ts`** — Now saves `html_body`, `direction: 'outbound'`, `channel: 'email'`, `sent_by: 'admin'` when inserting into `mail_items`.
- **`app/(client)/dashboard/mail/page.tsx`** — Shows channel icons (📧/💬), dates formatted in Spanish, renders `html_body` safely when available, Supabase Realtime live updates.

### SQL to run
```sql
-- supabase/migrations/20260418_sprint_b.sql
```

---

## Sprint C — Additional Services + Compliance

### What was built
- **`supabase/migrations/20260418_sprint_c.sql`** — Creates `addon_services` and `compliance_events` tables with RLS policies.
- **`app/api/admin/addon-services/route.ts`** — GET/POST/PATCH for addon services CRUD.
- **`app/api/admin/compliance-events/route.ts`** — GET (single company or all)/POST/PATCH for compliance events.
- **`components/admin/addon-services-panel.tsx`** — Lists services per company, "Add Service" form, status quick-update dropdown, "Send reminder" WhatsApp button.
- **`components/client/services-panel.tsx`** — Client portal panel showing active services, compliance calendar, upsell cards with WhatsApp advisor link (`wa.me/18669958013`).
- **`components/admin/compliance-calendar.tsx`** — Calendar view of all compliance events across all companies. Color coded (green/yellow/red by days remaining). Mark done button.
- **`app/(admin)/admin/compliance/page.tsx`** — New admin page wrapping `ComplianceCalendar`.
- **`components/admin/sidebar.tsx`** — Added "Compliance" link with CalendarCheck icon.
- **`app/(admin)/admin/clients/[id]/page.tsx`** — Added `<AddonServicesPanel>` to client detail page.
- **`components/admin/status-workflow.tsx`** — Auto-creates "Annual Report Filing" and "Registered Agent Renewal" compliance events 1 year out when company status changes to `completed`.

### SQL to run
```sql
-- supabase/migrations/20260418_sprint_c.sql
```

### Notes
- `services-panel.tsx` should be added to the client dashboard page where appropriate.
- RLS policies require the admin to be logged in as `gprofessionalservices.info@gmail.com` for full access.

---

## Sprint D — Document Editor + Templates

### What was built
- **`supabase/migrations/20260418_sprint_d.sql`** — Adds `doc_data`, `template_state`, `template_type`, `is_editable`, `last_edited_at`, `last_edited_by` to `documents`.
- **`components/admin/document-editor.tsx`** — Inline editor with all formation fields: company info, RA, organizer, addresses, members table (add/edit/remove, ownership %), business purpose, management type, special provisions. "Preview PDF" generates a draft, "Finalize & Send to Client" generates final + sends WhatsApp notification.
- **`lib/document-templates/articles/DE.ts`** — Delaware Certificate of Formation template.
- **`lib/document-templates/articles/NM.ts`** — New Mexico Articles of Organization template.
- **`lib/document-templates/articles/generic.ts`** — Generic fallback for any unsupported state.
- **`lib/document-templates/articles/corp.ts`** — Articles of Incorporation for CORP entity type.
- **`lib/document-templates/dba/index.ts`** — Fictitious Name Registration (DBA) template.
- **`lib/document-templates/articles/index.ts`** — Updated to include DE, NM; falls back to generic instead of throwing for unknown states.
- **`lib/document-generator.ts`** — Added `articles_corp` and `dba` doc_type handling.
- **`app/api/documents/generate/route.ts`** — Auto-routes to `articles_corp` or `dba` based on `entity_type` field.
- **`app/(admin)/admin/documents/page.tsx`** — Now client-side with filters (by doc type, by status), stats (total, pending, approved this month), download links, company links.
- **`app/(client)/dashboard/documents/page.tsx`** — "Request changes" button on pending docs (opens textarea → sends note to admin via `mail_items`). Download button only shown after approval.
- **`app/api/client/request-doc-changes/route.ts`** — POST endpoint: saves change request as `mail_items` inbound record + sets `approval_status: 'changes_requested'` on the document.

### SQL to run
```sql
-- supabase/migrations/20260418_sprint_d.sql
```

---

## Migrations to Run in Supabase SQL Editor

In order (run each file's content in Supabase Dashboard → SQL Editor):

1. `supabase/migrations/20260417_onboarding_fields.sql` ← from prior sprint (if not yet run)
2. `supabase/migrations/20260417_sprint_b_comms.sql` ← from prior sprint (if not yet run)
3. `supabase/migrations/20260418_sprint_b.sql`
4. `supabase/migrations/20260418_sprint_c.sql`
5. `supabase/migrations/20260418_sprint_d.sql`

All migrations are idempotent (`IF NOT EXISTS`, `DROP POLICY IF EXISTS` guards).

---

## Environment Variables Needed

| Variable | Description |
|---|---|
| `ADMIN_PERSONAL_WA` | Admin's personal WhatsApp number (e.g. `+19046248859`) |
| `TWILIO_WELCOME_TEMPLATE_SID` | Approved Twilio WA template SID for welcome messages |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token (**rotate immediately** — was exposed in conversation) |
| `TWILIO_WHATSAPP_FROM` | Twilio WhatsApp sender (e.g. `whatsapp:+14155238886`) |
| `RESEND_API_KEY` | Resend API key for email sending |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

---

## Known Limitations

- `ComplianceCalendar` uses the `createClient()` (anon) Supabase client from the browser — RLS policies must allow admin reads. Consider passing data server-side.
- `DocumentEditor` generates a full new PDF on "Preview" and replaces the existing doc record. The replace is atomic but there's no version history stored.
- `ServicesPanel` (client) should be wired into `/dashboard` or a `/dashboard/services` page — it's built but not yet placed on a page route.
- DBA template instructions are generic — state-specific filing instructions vary significantly.
