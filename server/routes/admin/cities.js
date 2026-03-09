import { Router } from 'express';
import { getDb } from '../../db.js';
import { authMiddleware } from '../../middleware/auth.js';
import { logChange, diffFields } from '../../middleware/audit.js';

const router = Router();
router.use(authMiddleware);

// Helper: look up city label for audit log
function cityLabel(db, cityId) {
  const c = db.prepare('SELECT city_name, country FROM cities WHERE id = ?').get(cityId);
  return c ? `${c.city_name}, ${c.country}` : null;
}

// List all cities (including inactive)
router.get('/', (req, res) => {
  const db = getDb();
  const cities = db.prepare('SELECT * FROM cities ORDER BY sort_order').all();
  res.json(cities);
});

// Create a new city
router.post('/', (req, res) => {
  const db = getDb();
  const { key, city_name, country, flag } = req.body;

  if (!key || !city_name || !country || !flag) {
    return res.status(400).json({ error: 'key, city_name, country, and flag are required' });
  }

  const existing = db.prepare('SELECT id FROM cities WHERE key = ?').get(key);
  if (existing) {
    return res.status(409).json({ error: 'A city with this key already exists' });
  }

  const maxOrder = db.prepare('SELECT MAX(sort_order) AS m FROM cities').get();
  const sortOrder = (maxOrder?.m ?? -1) + 1;

  const result = db.prepare(
    `INSERT INTO cities (key, city_name, country, flag, sort_order, is_active, updated_by, last_updated)
     VALUES (?, ?, ?, ?, ?, 1, ?, datetime('now'))`
  ).run(key, city_name, country, flag, sortOrder, req.user.userId);

  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'cities', recordId: result.lastInsertRowid, recordLabel: `${city_name}, ${country}`, action: 'create' });
  res.json({ id: result.lastInsertRowid, key });
});

// Delete a city (CASCADE removes all child records)
router.delete('/:id', (req, res) => {
  const db = getDb();
  const city = db.prepare('SELECT * FROM cities WHERE id = ?').get(req.params.id);
  if (!city) return res.status(404).json({ error: 'City not found' });

  db.prepare('DELETE FROM cities WHERE id = ?').run(city.id);
  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'cities', recordId: city.id, recordLabel: `${city.city_name}, ${city.country}`, action: 'delete',
    changes: { city_name: { old: city.city_name, new: null }, country: { old: city.country, new: null } } });

  res.json({ ok: true });
});

// Get single city with all sub-data
router.get('/:id', (req, res) => {
  const db = getDb();
  const city = db.prepare('SELECT * FROM cities WHERE id = ?').get(req.params.id);
  if (!city) return res.status(404).json({ error: 'City not found' });

  const scores = db.prepare('SELECT * FROM city_scores WHERE city_id = ?').all(city.id);
  const visaByOrigin = db.prepare('SELECT * FROM visa_by_origin WHERE city_id = ?').all(city.id);
  const highlights = db.prepare('SELECT * FROM city_highlights WHERE city_id = ?').all(city.id);
  const schools = db.prepare('SELECT * FROM schools WHERE city_id = ? ORDER BY sort_order').all(city.id);
  const neighborhoods = db.prepare('SELECT * FROM neighborhoods WHERE city_id = ? ORDER BY sort_order').all(city.id);
  const budgetBreakdowns = db.prepare('SELECT * FROM budget_breakdowns WHERE city_id = ? ORDER BY sort_order').all(city.id);
  const budgetTotal = db.prepare('SELECT * FROM budget_totals WHERE city_id = ?').get(city.id);
  const visaPathway = db.prepare('SELECT * FROM visa_pathways WHERE city_id = ?').get(city.id);
  let visaSteps = [];
  if (visaPathway) {
    visaSteps = db.prepare('SELECT * FROM visa_pathway_steps WHERE visa_pathway_id = ? ORDER BY sort_order').all(visaPathway.id);
  }
  const glnServices = db.prepare('SELECT * FROM gln_services WHERE city_id = ? ORDER BY sort_order').all(city.id);
  const destinationCol = db.prepare('SELECT * FROM destination_col WHERE city_id = ?').get(city.id);
  const taxProgram = db.prepare('SELECT * FROM destination_tax_programs WHERE city_id = ?').get(city.id);

  res.json({
    ...city, scores, visaByOrigin, highlights, schools, neighborhoods,
    budgetBreakdowns, budgetTotal, visaPathway, visaSteps, glnServices,
    destinationCol, taxProgram,
  });
});

// Update city general info
router.put('/:id', (req, res) => {
  const db = getDb();
  const city = db.prepare('SELECT * FROM cities WHERE id = ?').get(req.params.id);
  if (!city) return res.status(404).json({ error: 'City not found' });

  const fields = ['city_name', 'country', 'flag', 'cost_of_living_index', 'safety_rating',
    'healthcare_quality', 'internet_reliability', 'expat_community', 'climate_description',
    'climate_type', 'caveat', 'source', 'source_url', 'is_active', 'sort_order'];

  const changes = diffFields(city, req.body, fields);
  if (!changes) return res.json(city);

  const updates = Object.keys(changes).map(f => `${f} = @${f}`).join(', ');
  const values = {};
  for (const [f, { new: v }] of Object.entries(changes)) values[f] = v;
  values.id = city.id;

  db.prepare(`UPDATE cities SET ${updates}, last_updated = datetime('now'), updated_by = ${req.user.userId} WHERE id = @id`).run(values);
  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'cities', recordId: city.id, recordLabel: `${city.city_name}, ${city.country}`, action: 'update', changes });

  res.json(db.prepare('SELECT * FROM cities WHERE id = ?').get(city.id));
});

// Update city scores (bulk)
router.put('/:id/scores', (req, res) => {
  const db = getDb();
  const cityId = parseInt(req.params.id);
  const { scores, source } = req.body;

  const upsert = db.prepare(`
    INSERT INTO city_scores (city_id, dimension, score, source, updated_by)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(city_id, dimension)
    DO UPDATE SET score = excluded.score, source = excluded.source, updated_by = excluded.updated_by, last_updated = datetime('now')
  `);

  const transaction = db.transaction(() => {
    for (const [dimension, score] of Object.entries(scores)) {
      const existing = db.prepare('SELECT score FROM city_scores WHERE city_id = ? AND dimension = ?').get(cityId, dimension);
      upsert.run(cityId, dimension, score, source || null, req.user.userId);
      if (existing && existing.score !== score) {
        logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'city_scores', recordId: cityId, recordLabel: cityLabel(db, cityId), action: 'update',
          changes: { [dimension]: { old: existing.score, new: score } } });
      }
    }
  });
  transaction();

  res.json(db.prepare('SELECT * FROM city_scores WHERE city_id = ?').all(cityId));
});

// Update visa by origin (bulk)
router.put('/:id/visa-origins', (req, res) => {
  const db = getDb();
  const cityId = parseInt(req.params.id);
  const { origins } = req.body;

  const upsert = db.prepare(`
    INSERT INTO visa_by_origin (city_id, origin, speed, boost, source, updated_by)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(city_id, origin)
    DO UPDATE SET speed = excluded.speed, boost = excluded.boost, source = excluded.source, updated_by = excluded.updated_by, last_updated = datetime('now')
  `);

  const transaction = db.transaction(() => {
    for (const [origin, data] of Object.entries(origins)) {
      upsert.run(cityId, origin, data.speed, data.boost, data.source || null, req.user.userId);
    }
  });
  transaction();

  res.json(db.prepare('SELECT * FROM visa_by_origin WHERE city_id = ?').all(cityId));
});

// Update highlights (bulk)
router.put('/:id/highlights', (req, res) => {
  const db = getDb();
  const cityId = parseInt(req.params.id);
  const { highlights } = req.body;

  const upsert = db.prepare(`
    INSERT INTO city_highlights (city_id, dimension_key, highlight_text, source, updated_by)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(city_id, dimension_key)
    DO UPDATE SET highlight_text = excluded.highlight_text, source = excluded.source, updated_by = excluded.updated_by, last_updated = datetime('now')
  `);

  const transaction = db.transaction(() => {
    for (const [key, text] of Object.entries(highlights)) {
      upsert.run(cityId, key, text, null, req.user.userId);
    }
  });
  transaction();

  res.json(db.prepare('SELECT * FROM city_highlights WHERE city_id = ?').all(cityId));
});

// CRUD: Schools
router.post('/:id/schools', (req, res) => {
  const db = getDb();
  const cityId = parseInt(req.params.id);
  const { name, type, curriculum, grades, tuition_usd, note, source, source_url } = req.body;
  const result = db.prepare(
    'INSERT INTO schools (city_id, name, type, curriculum, grades, tuition_usd, note, source, source_url, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(cityId, name, type, curriculum, grades, tuition_usd, note || null, source || null, source_url || null, req.user.userId);
  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'schools', recordId: result.lastInsertRowid, recordLabel: name, action: 'create' });
  res.json(db.prepare('SELECT * FROM schools WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/schools/:schoolId', (req, res) => {
  const db = getDb();
  const school = db.prepare('SELECT * FROM schools WHERE id = ?').get(req.params.schoolId);
  if (!school) return res.status(404).json({ error: 'School not found' });

  const fields = ['name', 'type', 'curriculum', 'grades', 'tuition_usd', 'note', 'source', 'source_url', 'sort_order'];
  const changes = diffFields(school, req.body, fields);
  if (!changes) return res.json(school);

  const updates = Object.keys(changes).map(f => `${f} = @${f}`).join(', ');
  const values = {};
  for (const [f, { new: v }] of Object.entries(changes)) values[f] = v;
  values.id = school.id;

  db.prepare(`UPDATE schools SET ${updates}, last_updated = datetime('now'), updated_by = ${req.user.userId} WHERE id = @id`).run(values);
  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'schools', recordId: school.id, recordLabel: school.name, action: 'update', changes });
  res.json(db.prepare('SELECT * FROM schools WHERE id = ?').get(school.id));
});

router.delete('/schools/:schoolId', (req, res) => {
  const db = getDb();
  const school = db.prepare('SELECT * FROM schools WHERE id = ?').get(req.params.schoolId);
  if (!school) return res.status(404).json({ error: 'School not found' });
  db.prepare('DELETE FROM schools WHERE id = ?').run(school.id);
  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'schools', recordId: school.id, recordLabel: school.name, action: 'delete' });
  res.json({ ok: true });
});

// CRUD: Neighborhoods
router.post('/:id/neighborhoods', (req, res) => {
  const db = getDb();
  const cityId = parseInt(req.params.id);
  const { name, vibe, description, source } = req.body;
  const result = db.prepare(
    'INSERT INTO neighborhoods (city_id, name, vibe, description, source, updated_by) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(cityId, name, vibe, description, source || null, req.user.userId);
  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'neighborhoods', recordId: result.lastInsertRowid, recordLabel: name, action: 'create' });
  res.json(db.prepare('SELECT * FROM neighborhoods WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/neighborhoods/:nhId', (req, res) => {
  const db = getDb();
  const nh = db.prepare('SELECT * FROM neighborhoods WHERE id = ?').get(req.params.nhId);
  if (!nh) return res.status(404).json({ error: 'Neighborhood not found' });

  const fields = ['name', 'vibe', 'description', 'source', 'sort_order'];
  const changes = diffFields(nh, req.body, fields);
  if (!changes) return res.json(nh);

  const updates = Object.keys(changes).map(f => `${f} = @${f}`).join(', ');
  const values = {};
  for (const [f, { new: v }] of Object.entries(changes)) values[f] = v;
  values.id = nh.id;

  db.prepare(`UPDATE neighborhoods SET ${updates}, last_updated = datetime('now'), updated_by = ${req.user.userId} WHERE id = @id`).run(values);
  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'neighborhoods', recordId: nh.id, recordLabel: nh.name, action: 'update', changes });
  res.json(db.prepare('SELECT * FROM neighborhoods WHERE id = ?').get(nh.id));
});

router.delete('/neighborhoods/:nhId', (req, res) => {
  const db = getDb();
  const nhDel = db.prepare('SELECT name FROM neighborhoods WHERE id = ?').get(req.params.nhId);
  db.prepare('DELETE FROM neighborhoods WHERE id = ?').run(req.params.nhId);
  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'neighborhoods', recordId: parseInt(req.params.nhId), recordLabel: nhDel?.name, action: 'delete' });
  res.json({ ok: true });
});

// Budget breakdown (bulk update)
router.put('/:id/budget', (req, res) => {
  const db = getDb();
  const cityId = parseInt(req.params.id);
  const { items, totalRange, source } = req.body;

  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM budget_breakdowns WHERE city_id = ?').run(cityId);
    const insert = db.prepare(
      'INSERT INTO budget_breakdowns (city_id, category, amount, note, family_only, source, updated_by, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    items.forEach((item, i) => {
      insert.run(cityId, item.category, item.amount, item.note || null, item.familyOnly ? 1 : 0, source || null, req.user.userId, i);
    });

    db.prepare('INSERT OR REPLACE INTO budget_totals (city_id, total_range, source, updated_by) VALUES (?, ?, ?, ?)').run(cityId, totalRange, source || null, req.user.userId);
  });
  transaction();

  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'budget_breakdowns', recordId: cityId, recordLabel: cityLabel(db, cityId), action: 'update', changes: { budget: { old: 'bulk', new: 'updated' } } });
  res.json({ ok: true });
});

// Visa pathway (update with steps)
router.put('/:id/visa-pathway', (req, res) => {
  const db = getDb();
  const cityId = parseInt(req.params.id);
  const { visaType, processingTime, steps, source } = req.body;

  const transaction = db.transaction(() => {
    const existing = db.prepare('SELECT id FROM visa_pathways WHERE city_id = ?').get(cityId);
    let vpId;
    if (existing) {
      db.prepare("UPDATE visa_pathways SET visa_type = ?, processing_time = ?, source = ?, updated_by = ?, last_updated = datetime('now') WHERE city_id = ?")
        .run(visaType, processingTime, source || null, req.user.userId, cityId);
      vpId = existing.id;
      db.prepare('DELETE FROM visa_pathway_steps WHERE visa_pathway_id = ?').run(vpId);
    } else {
      const result = db.prepare('INSERT INTO visa_pathways (city_id, visa_type, processing_time, source, updated_by) VALUES (?, ?, ?, ?, ?)')
        .run(cityId, visaType, processingTime, source || null, req.user.userId);
      vpId = result.lastInsertRowid;
    }

    const insertStep = db.prepare(
      'INSERT INTO visa_pathway_steps (visa_pathway_id, step_label, step_time, step_detail, sort_order, updated_by) VALUES (?, ?, ?, ?, ?, ?)'
    );
    steps.forEach((step, i) => {
      insertStep.run(vpId, step.label, step.time, step.detail, i, req.user.userId);
    });
  });
  transaction();

  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'visa_pathways', recordId: cityId, recordLabel: cityLabel(db, cityId), action: 'update', changes: { visaPathway: { old: 'bulk', new: 'updated' } } });
  res.json({ ok: true });
});

// GLN services (bulk update)
router.put('/:id/services', (req, res) => {
  const db = getDb();
  const cityId = parseInt(req.params.id);
  const { services } = req.body;

  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM gln_services WHERE city_id = ?').run(cityId);
    const insert = db.prepare(
      'INSERT INTO gln_services (city_id, service_name, detail, sort_order, updated_by) VALUES (?, ?, ?, ?, ?)'
    );
    services.forEach((s, i) => {
      insert.run(cityId, s.service, s.detail, i, req.user.userId);
    });
  });
  transaction();

  res.json({ ok: true });
});

// Destination cost of living
router.put('/:id/col', (req, res) => {
  const db = getDb();
  const cityId = parseInt(req.params.id);
  const { housing, school, healthcare, groceries, transport, lifestyle, source } = req.body;

  db.prepare(`
    INSERT INTO destination_col (city_id, housing, school, healthcare, groceries, transport, lifestyle, source, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(city_id)
    DO UPDATE SET housing = excluded.housing, school = excluded.school, healthcare = excluded.healthcare,
                  groceries = excluded.groceries, transport = excluded.transport, lifestyle = excluded.lifestyle,
                  source = excluded.source, updated_by = excluded.updated_by, last_updated = datetime('now')
  `).run(cityId, housing, school, healthcare, groceries, transport, lifestyle, source || null, req.user.userId);

  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'destination_col', recordId: cityId, recordLabel: cityLabel(db, cityId), action: 'update', changes: { col: { old: 'bulk', new: 'updated' } } });
  res.json({ ok: true });
});

// Destination tax program
router.put('/:id/tax-program', (req, res) => {
  const db = getDb();
  const cityId = parseInt(req.params.id);
  const { programName, programDesc, effectiveRate, method, bracketsRef, caveat, source } = req.body;

  db.prepare(`
    INSERT INTO destination_tax_programs (city_id, program_name, program_desc, effective_rate, method, brackets_ref, caveat, source, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(city_id)
    DO UPDATE SET program_name = excluded.program_name, program_desc = excluded.program_desc, effective_rate = excluded.effective_rate,
                  method = excluded.method, brackets_ref = excluded.brackets_ref, caveat = excluded.caveat,
                  source = excluded.source, updated_by = excluded.updated_by, last_updated = datetime('now')
  `).run(cityId, programName, programDesc, effectiveRate ?? null, method, bracketsRef || null, caveat || null, source || null, req.user.userId);

  logChange({ userId: req.user.userId, userEmail: req.user.email, tableName: 'destination_tax_programs', recordId: cityId, recordLabel: cityLabel(db, cityId), action: 'update', changes: { taxProgram: { old: 'bulk', new: 'updated' } } });
  res.json({ ok: true });
});

export default router;
