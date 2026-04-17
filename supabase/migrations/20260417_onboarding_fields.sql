-- Add onboarding fields to companies table
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS principal_office_address text,
  ADD COLUMN IF NOT EXISTS mailing_address text,
  ADD COLUMN IF NOT EXISTS registered_agent_name text,
  ADD COLUMN IF NOT EXISTS registered_agent_address text,
  ADD COLUMN IF NOT EXISTS organizer_name text,
  ADD COLUMN IF NOT EXISTS organizer_address text,
  ADD COLUMN IF NOT EXISTS business_activity text,
  ADD COLUMN IF NOT EXISTS alternate_name_1 text,
  ADD COLUMN IF NOT EXISTS alternate_name_2 text,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

-- Members table
CREATE TABLE IF NOT EXISTS company_members (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id           UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name            TEXT NOT NULL,
  address              TEXT,
  country              TEXT,
  ownership_percentage NUMERIC(5,2),
  capital_contribution TEXT,
  role                 TEXT DEFAULT 'member' CHECK (role IN ('member', 'manager', 'member_manager')),
  is_primary           BOOLEAN DEFAULT false,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_own_members" ON company_members
  FOR ALL USING (
    company_id IN (
      SELECT co.id FROM companies co
      JOIN clients cl ON cl.id = co.client_id
      JOIN users u   ON u.id  = cl.user_id
      WHERE u.id = auth.uid()
    )
  );
