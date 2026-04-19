# MASTER AUDIT — CTE Platform
**Date:** 2026-04-18  
**Branch:** main  
**Last commit:** 741fb160

---

## 1. BRAND ISSUES

### CSS Variable Color Mismatch
**File:** `public/index.html` **Line 18**  
`--red: #2CB98A;` — This is **teal/green**, not red. Any element using `var(--red)` will render incorrectly.  
`--red-hover: #24a87c;` — same issue.  
**Fix:** Change to `--red: #ef4444; --red-hover: #dc2626;`

---

### Spanish Grammar & Accent Errors
**File:** `app/(client)/dashboard/page.tsx`

| Line | Current | Fix |
|------|---------|-----|
| 48 | "Tu caso esta siendo configurado" | **está** |
| 49 | "Tu empresa aparecera aqui en breve" | **aparecerá aquí** |
| 61 | "Tu empresa esta siendo configurada" | **está** |
| 62 | "Aparecera aqui en breve" | **Aparecerá aquí** |
| 108 | "en proceso de formacion" | **formación** |
| 109 | "Nuestro equipo esta trabajando" | **está** |
| 121 | "Estado de formacion" | **formación** |
| 130 | "Fecha de formacion" | **formación** |
| 133 | "Progreso de formacion" | **formación** |
| 188 | "las proximas 24–48 horas hables" | **próximas** + remove "hables" (typo) |
| 260 | "Este servicio estara disponible" | **estará** |
| 297 | "Tu direccion comercial estara disponible" | **dirección**, **estará** |
| 310 | "Nuestro equipo esta disponible" | **está** |

---

### Contact Email Inconsistency
- **Dashboard** `app/(client)/dashboard/page.tsx` line 313: uses `info@creatuempresausa.com`
- **API routes / send-email**: uses `soporte@creatuempresausa.com`  
**Fix:** Standardize to one address across the entire codebase.

---

## 2. MOBILE RESPONSIVE ISSUES

### Tables — Status
- `components/admin/client-table.tsx` line 202: wraps in `overflow-hidden` — OK
- `components/admin/ops-queue-table.tsx` line 471: `overflow-x-auto` wrapping `min-w-[1250px]` table — OK

### Potential Issues to Verify
- `components/admin/compliance-calendar.tsx`: no overflow wrapper observed — verify renders on mobile without horizontal bleed
- `components/admin/addon-services-panel.tsx`: table-like layout, verify on small screens
- `components/admin/unified-inbox.tsx`: dual-panel layout (thread list + conversation) — verify collapses correctly on mobile (< 640px)

---

## 3. VISUAL / UX IMPROVEMENTS

### Orphaned Components (Built but Not Imported)

| Component | File | Status |
|-----------|------|--------|
| `DocumentEditor` | `components/admin/document-editor.tsx` | Not imported anywhere — unreachable in UI |
| `ProcessSteps` | `components/blog/ProcessSteps.tsx` | Not imported anywhere — dead code |
| `AddonGrid` | `components/billing/addon-grid.tsx` | Not imported anywhere — dead code |

### ComplianceCalendar Only at Global Level
`ComplianceCalendar` is only rendered at `/admin/compliance` (all companies).  
It is **not** embedded in `app/(admin)/admin/clients/[id]/page.tsx` (individual client view).  
**Fix:** Add a per-company filtered compliance events section to the client detail page.

### DocumentEditor Not Wired to Any Flow
`DocumentEditor` component exists in `components/admin/document-editor.tsx` but no admin page imports or renders it. It was built in Sprint D but never integrated.  
**Fix:** Import into `app/(admin)/admin/clients/[id]/page.tsx` or create a `/admin/documents/[id]/edit` route.

---

## 4. AUTOMATION GAPS

### Cron Jobs — Only 1 Exists
**Directory:** `app/api/cron/`
- `renewals-check/route.ts` — checks renewal statuses, sends reminder emails at scheduled intervals, protected by `x-cron-secret`

**Missing cron jobs:**
- Addon service expiration reminders (no reminder when `addon_services.expires_at` approaches)
- Compliance event reminders (no automated reminders for `compliance_events.due_date`)
- Welcome email retry (no retry logic if Resend API fails on initial send)

### Addon Expiration — No Automation
`addon_services` table has `expires_at` and `status` columns but no background job monitors them.  
Clients can have services expire silently.  
**Fix:** Add `app/api/cron/addons-check/route.ts` that:
1. Queries `addon_services` where `expires_at < NOW() + 30 days` and `status = 'active'`
2. Sends WhatsApp/email reminder
3. Sets `status = 'expired'` when `expires_at < NOW()`

### Compliance Event Reminders — No Automation
`compliance_events` table has `due_date` and `reminder_sent_at` but no cron job sends reminders.  
**Fix:** Add cron logic (or extend `renewals-check`) to query upcoming compliance events and send reminders.

### State-Specific Compliance Auto-Generation — Partial
`status-workflow.tsx` auto-creates "Annual Report Filing" and "Registered Agent Renewal" events for all states with the same 1-year offset.  
`lib/renewals/state-obligations.ts` contains state-specific schedules but these are NOT used when auto-creating compliance events.  
**Fix:** When auto-creating compliance events on company `completed`, use `state-obligations.ts` to set the correct due date per state.

### ComplianceCalendar Uses Anon Client (RLS Risk)
`components/admin/compliance-calendar.tsx` uses `createClient()` (anon browser client).  
If RLS is strict, admins may not see all compliance events.  
**Fix:** Fetch compliance events server-side via service role in the page and pass as props, or use the admin API route.

---

## 5. MISSING / DISCONNECTED FEATURES

### Admin Navigation — Complete
**File:** `components/admin/sidebar.tsx`

All 11 admin pages have nav links:
`/admin`, `/admin/clients`, `/admin/orders`, `/admin/renewals`, `/admin/documents`, `/admin/addresses`, `/admin/operations`, `/admin/whatsapp`, `/admin/compliance`, `/admin/status`, `/admin/billing`

### Client Navigation — Complete
**File:** `components/client/sidebar.tsx`

All 6 client pages have nav links:
`/dashboard`, `/dashboard/documents`, `/dashboard/mail`, `/dashboard/company`, `/dashboard/billing`, `/dashboard/renovaciones`

### API Routes Without Frontend Entry Points
- `app/api/admin/resend-whatsapp/` — exists but not exposed in any UI button (verify `UnifiedInbox` or `AddonServicesPanel` calls it)
- `app/api/admin/companies/` — verify wired to admin client CRUD
- `app/api/client/renewals/` — verify accessible from `/dashboard/renovaciones`

### Missing Features to Consider
- No in-app notification system (new mail, new document — client must check manually)
- No admin bulk-action on clients table (e.g., bulk status update)
- No document version history view (Sprint D overwrites the PDF record on "Preview")
- No payment receipt download for clients in `/dashboard/billing`
- No "mark all as read" for mail items in `/dashboard/mail`

---

## PRIORITY RECOMMENDATIONS

| Priority | Item | File | Action |
|----------|------|------|--------|
| CRITICAL | Fix `--red` CSS variable | `public/index.html:18` | Change to `#ef4444` |
| HIGH | Addon expiration cron job | Missing | Create `app/api/cron/addons-check/route.ts` |
| HIGH | Compliance event reminders cron | Missing | Extend renewals-check or create new |
| HIGH | Fix 13 Spanish accent errors | `dashboard/page.tsx` | Fix all missing accents + "hables" typo |
| MEDIUM | Wire DocumentEditor to admin UI | `document-editor.tsx` | Import in client detail or new route |
| MEDIUM | Add ComplianceCalendar to client detail | `clients/[id]/page.tsx` | Filter by company_id |
| MEDIUM | Standardize contact email | `dashboard/page.tsx:313` | Replace `info@` with `soporte@` |
| LOW | Remove dead code | `ProcessSteps`, `AddonGrid` | Delete or integrate |
| LOW | Mobile audit for compliance/inbox panels | Multiple | Manual QA on 375px viewport |

---

## ENVIRONMENT VARIABLES CHECKLIST

| Variable | Status | Notes |
|----------|--------|-------|
| `SUPABASE_SERVICE_ROLE_KEY` | Required | Used in all API routes |
| `NEXT_PUBLIC_SUPABASE_URL` | Required | — |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required | — |
| `RESEND_API_KEY` | Required | Email sending |
| `TWILIO_ACCOUNT_SID` | Required | WhatsApp |
| `TWILIO_AUTH_TOKEN` | **ROTATE** | Was exposed in prior session |
| `TWILIO_WHATSAPP_FROM` | Required | e.g. `whatsapp:+14155238886` |
| `TWILIO_WELCOME_TEMPLATE_SID` | Required | Approved WA template for prod numbers |
| `ADMIN_PERSONAL_WA` | Verify set | `+19046248859` |
| `CRON_SECRET` | Required | Protects cron endpoints |
| `STRIPE_SECRET_KEY` | Required | — |
| `STRIPE_WEBHOOK_SECRET` | Required | — |

---

## MIGRATIONS STATUS

Run these in Supabase SQL Editor if not already applied:

1. `supabase/migrations/20260417_onboarding_fields.sql`
2. `supabase/migrations/20260417_sprint_b_comms.sql`
3. `supabase/migrations/20260418_sprint_b.sql` — mail_items new columns
4. `supabase/migrations/20260418_sprint_c.sql` — addon_services + compliance_events
5. `supabase/migrations/20260418_sprint_d.sql` — documents new columns
6. `supabase/migrations/20260406_renewals.sql`
7. `supabase/migrations/20260406_whatsapp_fields.sql`
8. `supabase/migrations/20260407_ops_queue_fields.sql`
