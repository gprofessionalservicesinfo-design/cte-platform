-- Sprint C: Addon services + compliance events

CREATE TABLE IF NOT EXISTS addon_services (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID REFERENCES companies(id) ON DELETE CASCADE,
  service_type      text NOT NULL CHECK (service_type IN (
    'registered_agent','business_address','itin',
    'annual_report','bookkeeping','trademark','ein'
  )),
  status            text DEFAULT 'pending' CHECK (status IN ('pending','active','expired','cancelled')),
  price             numeric(10,2),
  stripe_payment_id text,
  expires_at        timestamptz,
  notes             text,
  created_at        timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID REFERENCES companies(id) ON DELETE CASCADE,
  event_type       text NOT NULL,
  due_date         date NOT NULL,
  status           text DEFAULT 'pending' CHECK (status IN ('pending','completed','overdue','waived')),
  reminder_sent_at timestamptz,
  notes            text,
  created_at       timestamptz DEFAULT NOW()
);

-- RLS
ALTER TABLE addon_services    ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_events ENABLE ROW LEVEL SECURITY;

-- Admin full access
DROP POLICY IF EXISTS "admin_all_addons"      ON addon_services;
DROP POLICY IF EXISTS "admin_all_compliance"  ON compliance_events;

CREATE POLICY "admin_all_addons" ON addon_services FOR ALL
  USING (auth.jwt() ->> 'email' = 'gprofessionalservices.info@gmail.com');

CREATE POLICY "admin_all_compliance" ON compliance_events FOR ALL
  USING (auth.jwt() ->> 'email' = 'gprofessionalservices.info@gmail.com');

-- Clients can read their own
DROP POLICY IF EXISTS "clients_own_addons"      ON addon_services;
DROP POLICY IF EXISTS "clients_own_compliance"  ON compliance_events;

CREATE POLICY "clients_own_addons" ON addon_services FOR SELECT
  USING (company_id IN (
    SELECT co.id FROM companies co
    JOIN clients cl ON cl.id = co.client_id
    JOIN users u ON u.id = cl.user_id
    WHERE u.id = auth.uid()
  ));

CREATE POLICY "clients_own_compliance" ON compliance_events FOR SELECT
  USING (company_id IN (
    SELECT co.id FROM companies co
    JOIN clients cl ON cl.id = co.client_id
    JOIN users u ON u.id = cl.user_id
    WHERE u.id = auth.uid()
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_addon_services_company    ON addon_services    (company_id);
CREATE INDEX IF NOT EXISTS idx_compliance_events_company ON compliance_events (company_id);
CREATE INDEX IF NOT EXISTS idx_compliance_events_due     ON compliance_events (due_date);
