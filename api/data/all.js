import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Batch-fetch all data in parallel
    const [
      { data: cityRows },
      { data: allScores },
      { data: allVisas },
      { data: allSchools },
      { data: allHighlights },
      { data: allBudgets },
      { data: allBudgetTotals },
      { data: allNeighborhoods },
      { data: allVisaPathways },
      { data: allVisaSteps },
      { data: allServices },
      { data: allDestCol },
      { data: allTaxPrograms },
      { data: usRows },
      { data: stateRows },
      { data: allBrackets },
    ] = await Promise.all([
      db.from('cities').select('*').eq('is_active', true).order('sort_order'),
      db.from('city_scores').select('*'),
      db.from('visa_by_origin').select('*'),
      db.from('schools').select('*').order('sort_order'),
      db.from('city_highlights').select('*'),
      db.from('budget_breakdowns').select('*').order('sort_order'),
      db.from('budget_totals').select('*'),
      db.from('neighborhoods').select('*').order('sort_order'),
      db.from('visa_pathways').select('*'),
      db.from('visa_pathway_steps').select('*').order('sort_order'),
      db.from('gln_services').select('*').order('sort_order'),
      db.from('destination_col').select('*'),
      db.from('destination_tax_programs').select('*'),
      db.from('us_cities').select('*'),
      db.from('state_tax_rates').select('*'),
      db.from('tax_brackets').select('*').order('sort_order'),
    ]);

    // Index child data by city_id for fast lookup
    const scoresByCity = groupBy(allScores, 'city_id');
    const visasByCity = groupBy(allVisas, 'city_id');
    const schoolsByCity = groupBy(allSchools, 'city_id');
    const highlightsByCity = groupBy(allHighlights, 'city_id');
    const budgetsByCity = groupBy(allBudgets, 'city_id');
    const budgetTotalsByCity = indexBy(allBudgetTotals, 'city_id');
    const neighborhoodsByCity = groupBy(allNeighborhoods, 'city_id');
    const visaPathwaysByCity = indexBy(allVisaPathways, 'city_id');
    const stepsByPathway = groupBy(allVisaSteps, 'visa_pathway_id');
    const servicesByCity = groupBy(allServices, 'city_id');
    const destColByCity = indexBy(allDestCol, 'city_id');
    const taxProgramsByCity = indexBy(allTaxPrograms, 'city_id');

    // Build cities
    const cities = {};
    for (const city of cityRows) {
      const scores = {};
      for (const s of (scoresByCity[city.id] || [])) scores[s.dimension] = s.score;
      scores.climateType = city.climate_type;

      const visaByOrigin = {};
      for (const v of (visasByCity[city.id] || [])) visaByOrigin[v.origin] = { speed: v.speed, boost: v.boost };

      const schoolsData = (schoolsByCity[city.id] || []).map(s => ({
        name: s.name, type: s.type, curriculum: s.curriculum,
        grades: s.grades, tuitionUSD: s.tuition_usd, note: s.note,
      }));

      const highlightsByDimension = {};
      for (const h of (highlightsByCity[city.id] || [])) highlightsByDimension[h.dimension_key] = h.highlight_text;

      cities[city.key] = {
        key: city.key, city: city.city_name, country: city.country, flag: city.flag,
        costOfLivingIndex: city.cost_of_living_index, safetyRating: city.safety_rating,
        healthcareQuality: city.healthcare_quality, internetReliability: city.internet_reliability,
        expatCommunity: city.expat_community, climate: city.climate_description,
        scores, visaByOrigin, caveat: city.caveat, schoolsData, highlightsByDimension,
        _meta: { source: city.source, sourceUrl: city.source_url, lastUpdated: city.last_updated },
      };
    }

    // Build deep dive
    const deepDive = {};
    for (const city of cityRows) {
      const budgetBreakdown = (budgetsByCity[city.id] || []).map(b => ({
        category: b.category, amount: b.amount, note: b.note, familyOnly: !!b.family_only,
      }));
      const totalRow = budgetTotalsByCity[city.id];
      const neighborhoods = (neighborhoodsByCity[city.id] || []).map(n => ({
        name: n.name, vibe: n.vibe, description: n.description,
      }));

      const vpRow = visaPathwaysByCity[city.id];
      let visaPathway = null;
      if (vpRow) {
        const steps = (stepsByPathway[vpRow.id] || []).map(s => ({
          label: s.step_label, time: s.step_time, detail: s.step_detail,
        }));
        visaPathway = { type: vpRow.visa_type, processingTime: vpRow.processing_time, steps };
      }

      const glnServices = (servicesByCity[city.id] || []).map(s => ({
        service: s.service_name, detail: s.detail,
      }));

      const budgetSource = (budgetsByCity[city.id] || []).find(b => b.source)?.source;
      const budgetSourceUrl = (budgetsByCity[city.id] || []).find(b => b.source_url)?.source_url;
      const lastUpdated = (budgetsByCity[city.id] || []).reduce((max, b) =>
        b.last_updated > (max || '') ? b.last_updated : max, null);

      deepDive[city.city_name] = {
        budgetBreakdown, totalRange: totalRow?.total_range || '',
        neighborhoods, visaPathway, glnServices,
        _meta: { budgetSource, budgetSourceUrl, lastUpdated },
      };
    }

    // US city cost of living
    const usCityCOL = {};
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
      const col = destColByCity[city.id];
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
    for (const s of stateRows) {
      stateTaxRates[s.state_code] = {
        rate: s.rate, name: s.state_name, localRate: s.local_rate,
        _meta: { source: s.source, sourceUrl: s.source_url, lastUpdated: s.last_updated },
      };
    }

    // Tax brackets
    const bracketsBySet = groupBy(allBrackets, 'bracket_set');
    const buildBrackets = (set) => (bracketsBySet[set] || []).map(b => ({
      min: b.min_income, max: b.max_income ?? Infinity, rate: b.rate,
    }));

    // Destination tax programs
    const destinationTaxPrograms = {};
    for (const city of cityRows) {
      const tp = taxProgramsByCity[city.id];
      if (tp) {
        destinationTaxPrograms[city.city_name] = {
          programName: tp.program_name, programDesc: tp.program_desc,
          effectiveRate: tp.effective_rate, method: tp.method,
          brackets: tp.brackets_ref || undefined, caveat: tp.caveat,
          _meta: { source: tp.source, sourceUrl: tp.source_url, lastUpdated: tp.last_updated },
        };
      }
    }

    const data = {
      cities, deepDive, usCityCOL, destinationCOL, stateTaxRates,
      federalBrackets: buildBrackets('federal_us'),
      mexicoBrackets: buildBrackets('mexico'),
      brazilBrackets: buildBrackets('brazil'),
      destinationTaxPrograms,
      _meta: { generatedAt: new Date().toISOString() },
    };

    res.setHeader('Cache-Control', 'public, s-maxage=300');
    res.json(data);
  } catch (err) {
    console.error('Error building data:', err);
    res.status(500).json({ error: 'Failed to load data' });
  }
}

function groupBy(arr, key) {
  const map = {};
  for (const item of (arr || [])) {
    (map[item[key]] = map[item[key]] || []).push(item);
  }
  return map;
}

function indexBy(arr, key) {
  const map = {};
  for (const item of (arr || [])) map[item[key]] = item;
  return map;
}
