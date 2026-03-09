#!/usr/bin/env node
/**
 * Migrates data from local SQLite DB → Supabase PostgreSQL.
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-supabase.js
 *
 * Requires: npm install dotenv (or set env vars directly)
 */
import 'dotenv/config';
import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '..', 'server', 'gln-tools.db');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function insertBatch(table, rows) {
  if (!rows.length) return [];
  const { data, error } = await supabase.from(table).insert(rows).select();
  if (error) throw new Error(`Insert into ${table} failed: ${error.message}`);
  return data;
}

async function main() {
  const db = new Database(DB_PATH, { readonly: true });
  db.pragma('journal_mode = WAL');

  console.log('Connected to SQLite:', DB_PATH);
  console.log('Target Supabase:', process.env.SUPABASE_URL);

  // 1. Cities
  const cities = db.prepare('SELECT * FROM cities ORDER BY sort_order').all();
  console.log(`Seeding ${cities.length} cities...`);
  const cityRows = cities.map(c => ({
    key: c.key, city_name: c.city_name, country: c.country, flag: c.flag,
    cost_of_living_index: c.cost_of_living_index, safety_rating: c.safety_rating,
    healthcare_quality: c.healthcare_quality, internet_reliability: c.internet_reliability,
    expat_community: c.expat_community, climate_description: c.climate_description,
    climate_type: c.climate_type, caveat: c.caveat, source: c.source, source_url: c.source_url,
    is_active: !!c.is_active, sort_order: c.sort_order,
  }));
  const insertedCities = await insertBatch('cities', cityRows);

  // Map old SQLite IDs → new Supabase IDs (by key)
  const cityIdMap = {};
  for (const city of cities) {
    const match = insertedCities.find(ic => ic.key === city.key);
    if (match) cityIdMap[city.id] = match.id;
  }

  // 2. City scores
  const scores = db.prepare('SELECT * FROM city_scores').all();
  console.log(`Seeding ${scores.length} city scores...`);
  await insertBatch('city_scores', scores.filter(s => cityIdMap[s.city_id]).map(s => ({
    city_id: cityIdMap[s.city_id], dimension: s.dimension, score: s.score,
    source: s.source, source_url: s.source_url,
  })));

  // 3. Visa by origin
  const visas = db.prepare('SELECT * FROM visa_by_origin').all();
  console.log(`Seeding ${visas.length} visa origins...`);
  await insertBatch('visa_by_origin', visas.filter(v => cityIdMap[v.city_id]).map(v => ({
    city_id: cityIdMap[v.city_id], origin: v.origin, speed: v.speed, boost: v.boost,
    source: v.source, source_url: v.source_url,
  })));

  // 4. City highlights
  const highlights = db.prepare('SELECT * FROM city_highlights').all();
  console.log(`Seeding ${highlights.length} highlights...`);
  await insertBatch('city_highlights', highlights.filter(h => cityIdMap[h.city_id]).map(h => ({
    city_id: cityIdMap[h.city_id], dimension_key: h.dimension_key, highlight_text: h.highlight_text,
    source: h.source, source_url: h.source_url,
  })));

  // 5. Schools
  const schools = db.prepare('SELECT * FROM schools ORDER BY sort_order').all();
  console.log(`Seeding ${schools.length} schools...`);
  await insertBatch('schools', schools.filter(s => cityIdMap[s.city_id]).map(s => ({
    city_id: cityIdMap[s.city_id], name: s.name, type: s.type, curriculum: s.curriculum,
    grades: s.grades, tuition_usd: s.tuition_usd, note: s.note,
    source: s.source, source_url: s.source_url, sort_order: s.sort_order,
  })));

  // 6. Neighborhoods
  const neighborhoods = db.prepare('SELECT * FROM neighborhoods ORDER BY sort_order').all();
  console.log(`Seeding ${neighborhoods.length} neighborhoods...`);
  await insertBatch('neighborhoods', neighborhoods.filter(n => cityIdMap[n.city_id]).map(n => ({
    city_id: cityIdMap[n.city_id], name: n.name, vibe: n.vibe, description: n.description,
    source: n.source, source_url: n.source_url, sort_order: n.sort_order,
  })));

  // 7. Budget breakdowns
  const budgets = db.prepare('SELECT * FROM budget_breakdowns ORDER BY sort_order').all();
  console.log(`Seeding ${budgets.length} budget items...`);
  await insertBatch('budget_breakdowns', budgets.filter(b => cityIdMap[b.city_id]).map(b => ({
    city_id: cityIdMap[b.city_id], category: b.category, amount: b.amount, note: b.note,
    family_only: !!b.family_only, source: b.source, source_url: b.source_url, sort_order: b.sort_order,
  })));

  // 8. Budget totals
  const totals = db.prepare('SELECT * FROM budget_totals').all();
  console.log(`Seeding ${totals.length} budget totals...`);
  await insertBatch('budget_totals', totals.filter(t => cityIdMap[t.city_id]).map(t => ({
    city_id: cityIdMap[t.city_id], total_range: t.total_range,
    source: t.source, source_url: t.source_url,
  })));

  // 9. Visa pathways + steps
  const pathways = db.prepare('SELECT * FROM visa_pathways').all();
  console.log(`Seeding ${pathways.length} visa pathways...`);
  for (const vp of pathways) {
    if (!cityIdMap[vp.city_id]) continue;
    const [inserted] = await insertBatch('visa_pathways', [{
      city_id: cityIdMap[vp.city_id], visa_type: vp.visa_type, processing_time: vp.processing_time,
      source: vp.source, source_url: vp.source_url,
    }]);
    const steps = db.prepare('SELECT * FROM visa_pathway_steps WHERE visa_pathway_id = ? ORDER BY sort_order').all(vp.id);
    if (steps.length) {
      await insertBatch('visa_pathway_steps', steps.map(s => ({
        visa_pathway_id: inserted.id, step_label: s.step_label, step_time: s.step_time,
        step_detail: s.step_detail, sort_order: s.sort_order, source: s.source,
      })));
    }
  }

  // 10. GLN services
  const services = db.prepare('SELECT * FROM gln_services ORDER BY sort_order').all();
  console.log(`Seeding ${services.length} GLN services...`);
  await insertBatch('gln_services', services.filter(s => cityIdMap[s.city_id]).map(s => ({
    city_id: cityIdMap[s.city_id], service_name: s.service_name, detail: s.detail, sort_order: s.sort_order,
  })));

  // 11. US cities
  const usCities = db.prepare('SELECT * FROM us_cities').all();
  console.log(`Seeding ${usCities.length} US cities...`);
  await insertBatch('us_cities', usCities.map(u => ({
    city_name: u.city_name, state_code: u.state_code,
    housing: u.housing, school: u.school, healthcare: u.healthcare,
    groceries: u.groceries, transport: u.transport, lifestyle: u.lifestyle,
    source: u.source, source_url: u.source_url,
  })));

  // 12. Destination cost of living
  const destCol = db.prepare('SELECT * FROM destination_col').all();
  console.log(`Seeding ${destCol.length} destination CoL records...`);
  await insertBatch('destination_col', destCol.filter(d => cityIdMap[d.city_id]).map(d => ({
    city_id: cityIdMap[d.city_id],
    housing: d.housing, school: d.school, healthcare: d.healthcare,
    groceries: d.groceries, transport: d.transport, lifestyle: d.lifestyle,
    source: d.source, source_url: d.source_url,
  })));

  // 13. State tax rates
  const stateRates = db.prepare('SELECT * FROM state_tax_rates').all();
  console.log(`Seeding ${stateRates.length} state tax rates...`);
  await insertBatch('state_tax_rates', stateRates.map(s => ({
    state_code: s.state_code, state_name: s.state_name, rate: s.rate, local_rate: s.local_rate,
    source: s.source, source_url: s.source_url,
  })));

  // 14. Tax brackets
  const brackets = db.prepare('SELECT * FROM tax_brackets ORDER BY sort_order').all();
  console.log(`Seeding ${brackets.length} tax brackets...`);
  await insertBatch('tax_brackets', brackets.map(b => ({
    bracket_set: b.bracket_set, min_income: b.min_income, max_income: b.max_income,
    rate: b.rate, source: b.source, source_url: b.source_url, sort_order: b.sort_order,
  })));

  // 15. Destination tax programs
  const taxPrograms = db.prepare('SELECT * FROM destination_tax_programs').all();
  console.log(`Seeding ${taxPrograms.length} tax programs...`);
  await insertBatch('destination_tax_programs', taxPrograms.filter(t => cityIdMap[t.city_id]).map(t => ({
    city_id: cityIdMap[t.city_id], program_name: t.program_name, program_desc: t.program_desc,
    effective_rate: t.effective_rate, method: t.method, brackets_ref: t.brackets_ref,
    caveat: t.caveat, source: t.source, source_url: t.source_url,
  })));

  console.log('\nSeed complete!');
  db.close();
}

main().catch(err => { console.error('Seed failed:', err); process.exit(1); });
