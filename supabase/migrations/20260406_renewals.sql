-- ═══════════════════════════════════════════════════════════════════
-- Renewals & Compliance Module
-- Created: 2026-04-06
-- ═══════════════════════════════════════════════════════════════════

-- ── Main renewals table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS renewals (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id             UUID        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type                   TEXT        NOT NULL,
  label                  TEXT        NOT NULL,
  description            TEXT,
  due_date               DATE        NOT NULL,
  estimated_cost_cents   INTEGER     NOT NULL DEFAULT 0,
  status                 TEXT        NOT NULL DEFAULT 'upcoming',
  is_required            BOOLEAN     NOT NULL DEFAULT true,
  compliance_plan_covers BOOLEAN     NOT NULL DEFAULT false,
  paid_at                TIMESTAMPTZ,
  stripe_payment_link    TEXT,
  notes                  TEXT,
  last_reminder_at       TIMESTAMPTZ,
  reminders_sent         JSONB       NOT NULL DEFAULT '[]',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT renewals_type_check CHECK (
    type IN (
      'registered_agent',
      'annual_report',
      'franchise_tax',
      'periodic_report',
      'compliance_plan',
      'boi_report',
      'ein_renewal'
    )
  ),
  CONSTRAINT renewals_status_check CHECK (
    status IN ('upcoming','due_soon','overdue','paid','waived','not_applicable')
  )
);

-- ── Reminder log table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS renewal_reminders (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  renewal_id       UUID        NOT NULL REFERENCES renewals(id) ON DELETE CASCADE,
  channel          TEXT        NOT NULL,
  days_offset      INTEGER     NOT NULL,  -- negative = before due, 0 = on due, positive = after
  tone             TEXT        NOT NULL,
  sent_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recipient_email  TEXT,
  recipient_phone  TEXT,
  delivery_status  TEXT        NOT NULL DEFAULT 'sent',
  error_message    TEXT,

  CONSTRAINT reminder_channel_check CHECK (channel IN ('email','whatsapp','dashboard')),
  CONSTRAINT reminder_tone_check    CHECK (tone    IN ('educational','preventive','urgent','recovery'))
);

-- ── Indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS renewals_company_id_idx   ON renewals(company_id);
CREATE INDEX IF NOT EXISTS renewals_due_date_idx      ON renewals(due_date);
CREATE INDEX IF NOT EXISTS renewals_status_idx        ON renewals(status);
CREATE INDEX IF NOT EXISTS renewals_type_idx          ON renewals(type);
CREATE INDEX IF NOT EXISTS renewal_reminders_rid_idx  ON renewal_reminders(renewal_id);
CREATE INDEX IF NOT EXISTS renewal_reminders_sent_idx ON renewal_reminders(sent_at);

-- ── Auto-update updated_at ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_renewals_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER renewals_updated_at
  BEFORE UPDATE ON renewals
  FOR EACH ROW EXECUTE FUNCTION update_renewals_updated_at();

-- ── Auto-status: mark as due_soon or overdue based on due_date ───
-- Called by cron via /api/cron/renewals-check
-- Status logic:
--   due_date >= today + 31 days → upcoming
--   today + 1 to today + 30 days → due_soon
--   today → due_soon (due today)
--   due_date < today → overdue
-- (paid / waived / not_applicable are never auto-changed)
CREATE OR REPLACE FUNCTION refresh_renewal_statuses()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE renewals
  SET    status = CASE
    WHEN due_date < CURRENT_DATE              THEN 'overdue'
    WHEN due_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'due_soon'
    ELSE 'upcoming'
  END
  WHERE  status NOT IN ('paid','waived','not_applicable');
END;
$$;

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE renewals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewal_reminders ENABLE ROW LEVEL SECURITY;

-- Clients can view renewals for their own companies
CREATE POLICY "clients_view_own_renewals" ON renewals
  FOR SELECT
  USING (
    company_id IN (
      SELECT c.id FROM companies c
      JOIN clients cl ON cl.id = c.client_id
      WHERE cl.user_id = auth.uid()
    )
  );

-- Admins can do everything (service_role bypass covers cron/API routes)
CREATE POLICY "admins_all_renewals" ON renewals
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admins_all_renewal_reminders" ON renewal_reminders
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "clients_view_own_renewal_reminders" ON renewal_reminders
  FOR SELECT
  USING (
    renewal_id IN (
      SELECT r.id FROM renewals r
      JOIN companies c   ON c.id  = r.company_id
      JOIN clients cl    ON cl.id = c.client_id
      WHERE cl.user_id = auth.uid()
    )
  );

-- ── Admin view: renewals enriched with company + client data ─────
CREATE OR REPLACE VIEW admin_renewals_view AS
  SELECT
    r.id,
    r.type,
    r.label,
    r.description,
    r.due_date,
    r.estimated_cost_cents,
    r.status,
    r.is_required,
    r.compliance_plan_covers,
    r.paid_at,
    r.stripe_payment_link,
    r.notes,
    r.last_reminder_at,
    r.reminders_sent,
    r.created_at,
    c.id              AS company_id,
    c.company_name,
    c.state           AS company_state,
    c.entity_type,
    c.formation_date,
    c.package,
    cl.id             AS client_id,
    u.full_name       AS client_name,
    u.email           AS client_email,
    cli.phone         AS client_phone,
    cli.language_pref AS client_lang
  FROM  renewals r
  JOIN  companies c   ON c.id  = r.company_id
  JOIN  clients   cli ON cli.id = c.client_id
  JOIN  users     u   ON u.id  = cli.user_id
  LEFT  JOIN clients cl ON cl.id = c.client_id;
