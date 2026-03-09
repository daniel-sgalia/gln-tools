-- GLN Tools — PostgreSQL Schema for Supabase
-- Migrated from SQLite (server/db.js)

-- App users (links to Supabase auth.users)
CREATE TABLE IF NOT EXISTS app_users (
  id SERIAL PRIMARY KEY,
  supabase_uid UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Cities (core entity)
CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  city_name TEXT NOT NULL,
  country TEXT NOT NULL,
  flag TEXT NOT NULL,
  cost_of_living_index INTEGER,
  safety_rating TEXT,
  healthcare_quality TEXT,
  internet_reliability TEXT,
  expat_community TEXT,
  climate_description TEXT,
  climate_type TEXT,
  caveat TEXT,
  source TEXT,
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by INTEGER REFERENCES app_users(id),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- City scores (scoring dimensions)
CREATE TABLE IF NOT EXISTS city_scores (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL,
  score INTEGER NOT NULL,
  source TEXT,
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by INTEGER REFERENCES app_users(id),
  UNIQUE(city_id, dimension)
);

-- Visa by origin
CREATE TABLE IF NOT EXISTS visa_by_origin (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  speed INTEGER NOT NULL,
  boost INTEGER NOT NULL DEFAULT 0,
  source TEXT,
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by INTEGER REFERENCES app_users(id),
  UNIQUE(city_id, origin)
);

-- Highlights by dimension
CREATE TABLE IF NOT EXISTS city_highlights (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  dimension_key TEXT NOT NULL,
  highlight_text TEXT NOT NULL,
  source TEXT,
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by INTEGER REFERENCES app_users(id),
  UNIQUE(city_id, dimension_key)
);

-- Schools
CREATE TABLE IF NOT EXISTS schools (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  curriculum TEXT NOT NULL,
  grades TEXT NOT NULL,
  tuition_usd TEXT NOT NULL,
  note TEXT,
  source TEXT,
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by INTEGER REFERENCES app_users(id),
  sort_order INTEGER DEFAULT 0
);

-- Neighborhoods
CREATE TABLE IF NOT EXISTS neighborhoods (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  vibe TEXT NOT NULL,
  description TEXT NOT NULL,
  source TEXT,
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by INTEGER REFERENCES app_users(id),
  sort_order INTEGER DEFAULT 0
);

-- Budget breakdowns
CREATE TABLE IF NOT EXISTS budget_breakdowns (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount TEXT NOT NULL,
  note TEXT,
  family_only BOOLEAN DEFAULT FALSE,
  source TEXT,
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by INTEGER REFERENCES app_users(id),
  sort_order INTEGER DEFAULT 0
);

-- Budget totals
CREATE TABLE IF NOT EXISTS budget_totals (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  total_range TEXT NOT NULL,
  source TEXT,
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by INTEGER REFERENCES app_users(id),
  UNIQUE(city_id)
);

-- Visa pathways
CREATE TABLE IF NOT EXISTS visa_pathways (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  visa_type TEXT NOT NULL,
  processing_time TEXT NOT NULL,
  source TEXT,
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by INTEGER REFERENCES app_users(id),
  UNIQUE(city_id)
);

CREATE TABLE IF NOT EXISTS visa_pathway_steps (
  id SERIAL PRIMARY KEY,
  visa_pathway_id INTEGER NOT NULL REFERENCES visa_pathways(id) ON DELETE CASCADE,
  step_label TEXT NOT NULL,
  step_time TEXT NOT NULL,
  step_detail TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  source TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by INTEGER REFERENCES app_users(id)
);

-- GLN services
CREATE TABLE IF NOT EXISTS gln_services (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  detail TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by INTEGER REFERENCES app_users(id)
);

-- US city cost of living
CREATE TABLE IF NOT EXISTS us_cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT UNIQUE NOT NULL,
  state_code TEXT NOT NULL,
  housing INTEGER NOT NULL,
  school INTEGER NOT NULL,
  healthcare INTEGER NOT NULL,
  groceries INTEGER NOT NULL,
  transport INTEGER NOT NULL,
  lifestyle INTEGER NOT NULL,
  source TEXT,
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by INTEGER REFERENCES app_users(id)
);

-- Destination cost of living
CREATE TABLE IF NOT EXISTS destination_col (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  housing INTEGER NOT NULL,
  school INTEGER NOT NULL,
  healthcare INTEGER NOT NULL,
  groceries INTEGER NOT NULL,
  transport INTEGER NOT NULL,
  lifestyle INTEGER NOT NULL,
  source TEXT,
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by INTEGER REFERENCES app_users(id),
  UNIQUE(city_id)
);

-- State tax rates
CREATE TABLE IF NOT EXISTS state_tax_rates (
  id SERIAL PRIMARY KEY,
  state_code TEXT UNIQUE NOT NULL,
  state_name TEXT NOT NULL,
  rate DOUBLE PRECISION NOT NULL,
  local_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
  source TEXT,
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by INTEGER REFERENCES app_users(id)
);

-- Tax brackets
CREATE TABLE IF NOT EXISTS tax_brackets (
  id SERIAL PRIMARY KEY,
  bracket_set TEXT NOT NULL,
  min_income DOUBLE PRECISION NOT NULL,
  max_income DOUBLE PRECISION,
  rate DOUBLE PRECISION NOT NULL,
  source TEXT,
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by INTEGER REFERENCES app_users(id),
  sort_order INTEGER DEFAULT 0
);

-- Destination tax programs
CREATE TABLE IF NOT EXISTS destination_tax_programs (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  program_name TEXT NOT NULL,
  program_desc TEXT NOT NULL,
  effective_rate DOUBLE PRECISION,
  method TEXT NOT NULL,
  brackets_ref TEXT,
  caveat TEXT,
  source TEXT,
  source_url TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  updated_by INTEGER REFERENCES app_users(id),
  UNIQUE(city_id)
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES app_users(id),
  user_email TEXT,
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  record_label TEXT,
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);

-- Disable RLS for now (admin-only app, service role key used server-side)
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_by_origin ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_totals ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_pathway_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE gln_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE us_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE destination_col ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE destination_tax_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all data tables (for the public quiz)
CREATE POLICY "Public read access" ON cities FOR SELECT USING (true);
CREATE POLICY "Public read access" ON city_scores FOR SELECT USING (true);
CREATE POLICY "Public read access" ON visa_by_origin FOR SELECT USING (true);
CREATE POLICY "Public read access" ON city_highlights FOR SELECT USING (true);
CREATE POLICY "Public read access" ON schools FOR SELECT USING (true);
CREATE POLICY "Public read access" ON neighborhoods FOR SELECT USING (true);
CREATE POLICY "Public read access" ON budget_breakdowns FOR SELECT USING (true);
CREATE POLICY "Public read access" ON budget_totals FOR SELECT USING (true);
CREATE POLICY "Public read access" ON visa_pathways FOR SELECT USING (true);
CREATE POLICY "Public read access" ON visa_pathway_steps FOR SELECT USING (true);
CREATE POLICY "Public read access" ON gln_services FOR SELECT USING (true);
CREATE POLICY "Public read access" ON us_cities FOR SELECT USING (true);
CREATE POLICY "Public read access" ON destination_col FOR SELECT USING (true);
CREATE POLICY "Public read access" ON state_tax_rates FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tax_brackets FOR SELECT USING (true);
CREATE POLICY "Public read access" ON destination_tax_programs FOR SELECT USING (true);

-- Allow authenticated users full access (admin operations use service role key anyway)
CREATE POLICY "Auth full access" ON app_users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON cities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON city_scores FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON visa_by_origin FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON city_highlights FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON schools FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON neighborhoods FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON budget_breakdowns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON budget_totals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON visa_pathways FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON visa_pathway_steps FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON gln_services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON us_cities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON destination_col FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON state_tax_rates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON tax_brackets FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON destination_tax_programs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON audit_log FOR ALL USING (auth.role() = 'authenticated');
