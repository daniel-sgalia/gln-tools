import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'gln-tools.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDb() {
  const db = getDb();

  db.exec(`
    -- Users
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'editor',
      created_at TEXT DEFAULT (datetime('now')),
      last_login TEXT
    );

    -- Cities (core entity)
    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      last_updated TEXT DEFAULT (datetime('now')),
      updated_by INTEGER REFERENCES users(id),
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- City scores (scoring dimensions)
    CREATE TABLE IF NOT EXISTS city_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      dimension TEXT NOT NULL,
      score INTEGER NOT NULL,
      source TEXT,
      source_url TEXT,
      last_updated TEXT DEFAULT (datetime('now')),
      updated_by INTEGER REFERENCES users(id),
      UNIQUE(city_id, dimension)
    );

    -- Visa by origin
    CREATE TABLE IF NOT EXISTS visa_by_origin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      origin TEXT NOT NULL,
      speed INTEGER NOT NULL,
      boost INTEGER NOT NULL DEFAULT 0,
      source TEXT,
      source_url TEXT,
      last_updated TEXT DEFAULT (datetime('now')),
      updated_by INTEGER REFERENCES users(id),
      UNIQUE(city_id, origin)
    );

    -- Highlights by dimension
    CREATE TABLE IF NOT EXISTS city_highlights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      dimension_key TEXT NOT NULL,
      highlight_text TEXT NOT NULL,
      source TEXT,
      source_url TEXT,
      last_updated TEXT DEFAULT (datetime('now')),
      updated_by INTEGER REFERENCES users(id),
      UNIQUE(city_id, dimension_key)
    );

    -- Schools
    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      curriculum TEXT NOT NULL,
      grades TEXT NOT NULL,
      tuition_usd TEXT NOT NULL,
      note TEXT,
      source TEXT,
      source_url TEXT,
      last_updated TEXT DEFAULT (datetime('now')),
      updated_by INTEGER REFERENCES users(id),
      sort_order INTEGER DEFAULT 0
    );

    -- Neighborhoods
    CREATE TABLE IF NOT EXISTS neighborhoods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      vibe TEXT NOT NULL,
      description TEXT NOT NULL,
      source TEXT,
      source_url TEXT,
      last_updated TEXT DEFAULT (datetime('now')),
      updated_by INTEGER REFERENCES users(id),
      sort_order INTEGER DEFAULT 0
    );

    -- Budget breakdowns
    CREATE TABLE IF NOT EXISTS budget_breakdowns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      amount TEXT NOT NULL,
      note TEXT,
      family_only INTEGER DEFAULT 0,
      source TEXT,
      source_url TEXT,
      last_updated TEXT DEFAULT (datetime('now')),
      updated_by INTEGER REFERENCES users(id),
      sort_order INTEGER DEFAULT 0
    );

    -- Budget totals
    CREATE TABLE IF NOT EXISTS budget_totals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      total_range TEXT NOT NULL,
      source TEXT,
      source_url TEXT,
      last_updated TEXT DEFAULT (datetime('now')),
      updated_by INTEGER REFERENCES users(id),
      UNIQUE(city_id)
    );

    -- Visa pathways
    CREATE TABLE IF NOT EXISTS visa_pathways (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      visa_type TEXT NOT NULL,
      processing_time TEXT NOT NULL,
      source TEXT,
      source_url TEXT,
      last_updated TEXT DEFAULT (datetime('now')),
      updated_by INTEGER REFERENCES users(id),
      UNIQUE(city_id)
    );

    CREATE TABLE IF NOT EXISTS visa_pathway_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visa_pathway_id INTEGER NOT NULL REFERENCES visa_pathways(id) ON DELETE CASCADE,
      step_label TEXT NOT NULL,
      step_time TEXT NOT NULL,
      step_detail TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      source TEXT,
      last_updated TEXT DEFAULT (datetime('now')),
      updated_by INTEGER REFERENCES users(id)
    );

    -- GLN services
    CREATE TABLE IF NOT EXISTS gln_services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      service_name TEXT NOT NULL,
      detail TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      last_updated TEXT DEFAULT (datetime('now')),
      updated_by INTEGER REFERENCES users(id)
    );

    -- US city cost of living
    CREATE TABLE IF NOT EXISTS us_cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      last_updated TEXT DEFAULT (datetime('now')),
      updated_by INTEGER REFERENCES users(id)
    );

    -- Destination cost of living
    CREATE TABLE IF NOT EXISTS destination_col (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      housing INTEGER NOT NULL,
      school INTEGER NOT NULL,
      healthcare INTEGER NOT NULL,
      groceries INTEGER NOT NULL,
      transport INTEGER NOT NULL,
      lifestyle INTEGER NOT NULL,
      source TEXT,
      source_url TEXT,
      last_updated TEXT DEFAULT (datetime('now')),
      updated_by INTEGER REFERENCES users(id),
      UNIQUE(city_id)
    );

    -- State tax rates
    CREATE TABLE IF NOT EXISTS state_tax_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state_code TEXT UNIQUE NOT NULL,
      state_name TEXT NOT NULL,
      rate REAL NOT NULL,
      local_rate REAL NOT NULL DEFAULT 0,
      source TEXT,
      source_url TEXT,
      last_updated TEXT DEFAULT (datetime('now')),
      updated_by INTEGER REFERENCES users(id)
    );

    -- Tax brackets
    CREATE TABLE IF NOT EXISTS tax_brackets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bracket_set TEXT NOT NULL,
      min_income REAL NOT NULL,
      max_income REAL,
      rate REAL NOT NULL,
      source TEXT,
      source_url TEXT,
      last_updated TEXT DEFAULT (datetime('now')),
      updated_by INTEGER REFERENCES users(id),
      sort_order INTEGER DEFAULT 0
    );

    -- Destination tax programs
    CREATE TABLE IF NOT EXISTS destination_tax_programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      program_name TEXT NOT NULL,
      program_desc TEXT NOT NULL,
      effective_rate REAL,
      method TEXT NOT NULL,
      brackets_ref TEXT,
      caveat TEXT,
      source TEXT,
      source_url TEXT,
      last_updated TEXT DEFAULT (datetime('now')),
      updated_by INTEGER REFERENCES users(id),
      UNIQUE(city_id)
    );

    -- Audit log
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      user_email TEXT,
      table_name TEXT NOT NULL,
      record_id INTEGER NOT NULL,
      record_label TEXT,
      action TEXT NOT NULL,
      field_name TEXT,
      old_value TEXT,
      new_value TEXT,
      timestamp TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_log(table_name, record_id);
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
  `);

  // Migrate existing DBs — add record_label column if missing
  try { db.exec('ALTER TABLE audit_log ADD COLUMN record_label TEXT'); } catch {}

  return db;
}
