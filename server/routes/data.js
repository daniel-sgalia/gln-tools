import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// Helper: build the full data payload shaped to match frontend constants
function buildAllData() {
  const db = getDb();

  // Cities
  const cities = {};
  const cityRows = db.prepare('SELECT * FROM cities WHERE is_active = 1 ORDER BY sort_order').all();

  for (const city of cityRows) {
    const scores = {};
    const scoreRows = db.prepare('SELECT dimension, score FROM city_scores WHERE city_id = ?').all(city.id);
    for (const s of scoreRows) scores[s.dimension] = s.score;
    scores.climateType = city.climate_type;

    const visaByOrigin = {};
    const visaRows = db.prepare('SELECT origin, speed, boost FROM visa_by_origin WHERE city_id = ?').all(city.id);
    for (const v of visaRows) visaByOrigin[v.origin] = { speed: v.speed, boost: v.boost };

    const schoolsData = db.prepare('SELECT name, type, curriculum, grades, tuition_usd AS tuitionUSD, note FROM schools WHERE city_id = ? ORDER BY sort_order').all(city.id);

    const highlightsByDimension = {};
    const highlightRows = db.prepare('SELECT dimension_key, highlight_text FROM city_highlights WHERE city_id = ?').all(city.id);
    for (const h of highlightRows) highlightsByDimension[h.dimension_key] = h.highlight_text;

    cities[city.key] = {
      key: city.key,
      city: city.city_name,
      country: city.country,
      flag: city.flag,
      costOfLivingIndex: city.cost_of_living_index,
      safetyRating: city.safety_rating,
      healthcareQuality: city.healthcare_quality,
      internetReliability: city.internet_reliability,
      expatCommunity: city.expat_community,
      climate: city.climate_description,
      scores,
      visaByOrigin,
      caveat: city.caveat,
      schoolsData,
      highlightsByDimension,
      _meta: { source: city.source, sourceUrl: city.source_url, lastUpdated: city.last_updated },
    };
  }

  // Deep dive data
  const deepDive = {};
  for (const city of cityRows) {
    const budgetBreakdown = db.prepare(
      'SELECT category, amount, note, family_only AS familyOnly FROM budget_breakdowns WHERE city_id = ? ORDER BY sort_order'
    ).all(city.id).map(b => ({ ...b, familyOnly: !!b.familyOnly }));

    const totalRow = db.prepare('SELECT total_range FROM budget_totals WHERE city_id = ?').get(city.id);

    const neighborhoods = db.prepare(
      'SELECT name, vibe, description FROM neighborhoods WHERE city_id = ? ORDER BY sort_order'
    ).all(city.id);

    const vpRow = db.prepare('SELECT * FROM visa_pathways WHERE city_id = ?').get(city.id);
    let visaPathway = null;
    if (vpRow) {
      const steps = db.prepare(
        'SELECT step_label AS label, step_time AS time, step_detail AS detail FROM visa_pathway_steps WHERE visa_pathway_id = ? ORDER BY sort_order'
      ).all(vpRow.id);
      visaPathway = { type: vpRow.visa_type, processingTime: vpRow.processing_time, steps };
    }

    const glnServices = db.prepare(
      'SELECT service_name AS service, detail FROM gln_services WHERE city_id = ? ORDER BY sort_order'
    ).all(city.id);

    deepDive[city.city_name] = {
      budgetBreakdown,
      totalRange: totalRow?.total_range || '',
      neighborhoods,
      visaPathway,
      glnServices,
      _meta: {
        budgetSource: db.prepare('SELECT source FROM budget_breakdowns WHERE city_id = ? AND source IS NOT NULL LIMIT 1').get(city.id)?.source,
        budgetSourceUrl: db.prepare('SELECT source_url FROM budget_breakdowns WHERE city_id = ? AND source_url IS NOT NULL LIMIT 1').get(city.id)?.source_url,
        lastUpdated: db.prepare('SELECT MAX(last_updated) AS lu FROM budget_breakdowns WHERE city_id = ?').get(city.id)?.lu,
      },
    };
  }

  // US city cost of living
  const usCityCOL = {};
  const usRows = db.prepare('SELECT * FROM us_cities').all();
  for (const u of usRows) {
    usCityCOL[u.city_name] = {
      state: u.state_code,
      housing: u.housing, school: u.school, healthcare: u.healthcare,
      groceries: u.groceries, transport: u.transport, lifestyle: u.lifestyle,
      _meta: { source: u.source, sourceUrl: u.source_url, lastUpdated: u.last_updated },
    };
  }

  // Destination cost of living
  const destinationCOL = {};
  for (const city of cityRows) {
    const col = db.prepare('SELECT * FROM destination_col WHERE city_id = ?').get(city.id);
    if (col) {
      destinationCOL[city.city_name] = {
        housing: col.housing, school: col.school, healthcare: col.healthcare,
        groceries: col.groceries, transport: col.transport, lifestyle: col.lifestyle,
        _meta: { source: col.source, sourceUrl: col.source_url, lastUpdated: col.last_updated },
      };
    }
  }

  // State tax rates
  const stateTaxRates = {};
  const stateRows = db.prepare('SELECT * FROM state_tax_rates').all();
  for (const s of stateRows) {
    stateTaxRates[s.state_code] = {
      rate: s.rate, name: s.state_name, localRate: s.local_rate,
      _meta: { source: s.source, sourceUrl: s.source_url, lastUpdated: s.last_updated },
    };
  }

  // Tax brackets
  const buildBrackets = (set) =>
    db.prepare('SELECT min_income AS min, max_income AS max, rate FROM tax_brackets WHERE bracket_set = ? ORDER BY sort_order')
      .all(set)
      .map(b => ({ ...b, max: b.max ?? Infinity }));

  const federalBrackets = buildBrackets('federal_us');
  const mexicoBrackets = buildBrackets('mexico');
  const brazilBrackets = buildBrackets('brazil');

  // Destination tax programs
  const destinationTaxPrograms = {};
  for (const city of cityRows) {
    const tp = db.prepare('SELECT * FROM destination_tax_programs WHERE city_id = ?').get(city.id);
    if (tp) {
      destinationTaxPrograms[city.city_name] = {
        programName: tp.program_name,
        programDesc: tp.program_desc,
        effectiveRate: tp.effective_rate,
        method: tp.method,
        brackets: tp.brackets_ref || undefined,
        caveat: tp.caveat,
        _meta: { source: tp.source, sourceUrl: tp.source_url, lastUpdated: tp.last_updated },
      };
    }
  }

  return {
    cities,
    deepDive,
    usCityCOL,
    destinationCOL,
    stateTaxRates,
    federalBrackets,
    mexicoBrackets,
    brazilBrackets,
    destinationTaxPrograms,
    _meta: {
      generatedAt: new Date().toISOString(),
    },
  };
}

// Single bulk endpoint — everything the frontend needs
router.get('/all', (req, res) => {
  try {
    const data = buildAllData();
    res.set('Cache-Control', 'public, max-age=300');
    res.json(data);
  } catch (err) {
    console.error('Error building data:', err);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// Individual endpoints
router.get('/cities', (req, res) => {
  const data = buildAllData();
  res.json(data.cities);
});

router.get('/cities/:key', (req, res) => {
  const data = buildAllData();
  const city = data.cities[req.params.key];
  if (!city) return res.status(404).json({ error: 'City not found' });
  res.json(city);
});

router.get('/cities/:key/deep-dive', (req, res) => {
  const data = buildAllData();
  const city = data.cities[req.params.key];
  if (!city) return res.status(404).json({ error: 'City not found' });
  const dd = data.deepDive[city.city];
  if (!dd) return res.status(404).json({ error: 'Deep dive data not found' });
  res.json(dd);
});

export default router;
