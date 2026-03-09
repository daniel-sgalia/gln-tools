import bcrypt from 'bcryptjs';
import { initDb, getDb } from './db.js';

// ─── SOURCE ATTRIBUTION BY DATA CATEGORY ─────────────────────────
// Each data category is attributed to the most authoritative public source
const SOURCES = {
  cities: {
    text: 'Numbeo Cost of Living Index 2025',
    url: 'https://www.numbeo.com/cost-of-living/rankings_by_country.jsp',
  },
  cityScores: {
    text: 'GLN composite — Numbeo, Global Peace Index, InterNations Expat Insider',
    url: 'https://www.numbeo.com/quality-of-life/rankings_by_country.jsp',
  },
  visa: {
    text: 'Government immigration portals & VisaGuide.World 2025',
    url: 'https://visaguide.world/',
  },
  schools: {
    text: 'International Schools Database & school websites',
    url: 'https://www.international-schools-database.com/',
  },
  neighborhoods: {
    text: 'GLN relocation research & Expatistan community data',
    url: 'https://www.expatistan.com/cost-of-living',
  },
  budget: {
    text: 'Numbeo & Expatistan cost estimates, 2025',
    url: 'https://www.numbeo.com/cost-of-living/',
  },
  usCities: {
    text: 'Numbeo US city data & BLS Consumer Expenditure Survey',
    url: 'https://www.numbeo.com/cost-of-living/country_result.jsp?country=United+States',
  },
  stateTax: {
    text: 'Tax Foundation State Tax Data 2025',
    url: 'https://taxfoundation.org/data/all/state/state-income-tax-rates-2025/',
  },
  federalTax: {
    text: 'IRS Revenue Procedure 2024-40 (2025 brackets)',
    url: 'https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments-for-tax-year-2025',
  },
  mexicoTax: {
    text: 'SAT Mexico — Ley del ISR Art. 96 (2025)',
    url: 'https://www.sat.gob.mx/',
  },
  brazilTax: {
    text: 'Receita Federal do Brasil — IRPF 2025',
    url: 'https://www.gov.br/receitafederal/',
  },
  taxPrograms: {
    text: 'Government program portals & PwC Worldwide Tax Summaries',
    url: 'https://taxsummaries.pwc.com/',
  },
  destinationCol: {
    text: 'Numbeo city-level cost of living data, 2025',
    url: 'https://www.numbeo.com/cost-of-living/',
  },
};

// ─── CITY SCORING DATA (from CitySelector.jsx) ───────────────────
const CITIES = [
  {
    key: "lisbon", city: "Lisbon", country: "Portugal", flag: "\u{1F1F5}\u{1F1F9}",
    costOfLivingIndex: 58, safetyRating: "Very High", healthcareQuality: "Excellent",
    internetReliability: "Very Good", expatCommunity: "Large & established",
    climate: "Mediterranean — warm dry summers, mild rainy winters", climateType: "mediterranean",
    caveat: "Lisbon housing costs have risen sharply since 2020 — expect $2,000–$3,500/month for a quality family apartment in desirable neighborhoods like Estrela or Cascais.",
    scores: { budgetFriendliness: 5, safety: 10, healthcare: 10, schools: 9, culture: 8, nature: 6, expat: 9, business: 7, visaSpeed: 5, costSavings: 5 },
    visaByOrigin: { "United States": { speed: 5, boost: 0 }, "Canada": { speed: 5, boost: 0 }, "United Kingdom": { speed: 5, boost: 0 }, "Australia / NZ": { speed: 5, boost: 0 }, "EU Country": { speed: 10, boost: 15 }, "Other": { speed: 4, boost: -3 } },
    schoolsData: [
      { name: "St. Julian's School", type: "International", curriculum: "IB & British A-Levels", grades: "Pre-K through 13", tuitionUSD: "$12,000–$22,000/year", note: "Founded 1932. English-medium with mandatory Portuguese. Strong university placement to UK and US institutions." },
      { name: "Carlucci American International School of Lisbon", type: "American International", curriculum: "American / AP & IB Diploma", grades: "Pre-K through 12", tuitionUSD: "$15,000–$28,000/year", note: "US college-prep focused with IB Diploma option. Fully English instruction. US-accredited." },
      { name: "Oeiras International School", type: "International", curriculum: "IB (PYP, MYP, DP)", grades: "K through 12", tuitionUSD: "$10,000–$18,000/year", note: "Full IB continuum in Oeiras suburb. Smaller class sizes, 25 minutes from central Lisbon." },
    ],
    highlightsByDimension: {
      safety: "Ranked #4 safest country globally", healthcare: "World-class public healthcare (SNS)",
      schools: "Thriving international school scene", visa: "EU residency via D8 Digital Nomad Visa",
      culture: "Vibrant arts, fado music, and café culture", business: "NHR tax program for new residents",
      expat: "One of Europe's largest English-speaking expat hubs", cost: "30–40% cheaper than Western Europe",
      nature: "Atlantic beaches and Sintra hills within 30 minutes", climate: "300+ days of sunshine — Europe's sunniest capital",
      default: "EU residency via D8 Digital Nomad Visa",
    },
  },
  {
    key: "mexicoCity", city: "Mexico City", country: "Mexico", flag: "\u{1F1F2}\u{1F1FD}",
    costOfLivingIndex: 42, safetyRating: "Moderate", healthcareQuality: "Very Good",
    internetReliability: "Very Good", expatCommunity: "Large & established",
    climate: "Temperate — spring-like year-round at 7,350 ft elevation", climateType: "temperate",
    caveat: "Air quality can be poor during dry season (Nov–May) and altitude adjustment takes 1–2 weeks. Choose neighborhoods like Condesa, Roma, or Polanco for best quality of life.",
    scores: { budgetFriendliness: 8, safety: 5, healthcare: 8, schools: 8, culture: 10, nature: 5, expat: 10, business: 7, visaSpeed: 8, costSavings: 8 },
    visaByOrigin: { "United States": { speed: 8, boost: 2 }, "Canada": { speed: 8, boost: 2 }, "United Kingdom": { speed: 7, boost: 0 }, "Australia / NZ": { speed: 7, boost: 0 }, "EU Country": { speed: 7, boost: 0 }, "Other": { speed: 6, boost: -2 } },
    schoolsData: [
      { name: "American School Foundation (ASF)", type: "American International", curriculum: "American / AP", grades: "Pre-K through 12", tuitionUSD: "$18,000–$30,000/year", note: "Founded 1888. Largest American school in Latin America. English instruction with required Spanish. Exceptional college placement." },
      { name: "Greengates School", type: "British International", curriculum: "British / IGCSE & IB", grades: "Pre-K through 13", tuitionUSD: "$14,000–$24,000/year", note: "British curriculum school in Balcones de la Herradura. Strong IB results. English medium with Spanish." },
      { name: "Colegio Peterson", type: "Bilingual Private", curriculum: "Mexican SEP & IB", grades: "Pre-K through 12", tuitionUSD: "$8,000–$15,000/year", note: "Top-tier Mexican bilingual school with IB Diploma. Three campuses across the city. Strong local and international reputation." },
    ],
    highlightsByDimension: {
      culture: "World-class cultural and dining scene", visa: "Fastest visa processing (1–3 months)",
      climate: "Spring-like climate year-round", expat: "Massive and established expat community",
      cost: "Your money goes 2–3x further than US cities", business: "Booming startup and remote-work ecosystem",
      schools: "Top international schools (ASF, Greengates)", healthcare: "Private healthcare at a fraction of US costs",
      nature: "Day trips to mountains, pyramids, and forests", safety: "Safe expat neighborhoods (Condesa, Roma, Polanco)",
      default: "World-class cultural and dining scene",
    },
  },
  {
    key: "merida", city: "Mérida", country: "Mexico", flag: "\u{1F1F2}\u{1F1FD}",
    costOfLivingIndex: 35, safetyRating: "High", healthcareQuality: "Good",
    internetReliability: "Good", expatCommunity: "Growing",
    climate: "Tropical — hot and humid year-round, rainy season June–October", climateType: "tropical",
    caveat: "International school options are more limited than Mexico City or Lisbon — families with teens may need to consider online/hybrid schooling supplements.",
    scores: { budgetFriendliness: 10, safety: 8, healthcare: 6, schools: 4, culture: 5, nature: 6, expat: 6, business: 4, visaSpeed: 8, costSavings: 10 },
    visaByOrigin: { "United States": { speed: 8, boost: 2 }, "Canada": { speed: 8, boost: 2 }, "United Kingdom": { speed: 7, boost: 0 }, "Australia / NZ": { speed: 7, boost: 0 }, "EU Country": { speed: 7, boost: 0 }, "Other": { speed: 6, boost: -2 } },
    schoolsData: [
      { name: "Mérida International School", type: "International / Bilingual", curriculum: "American / Mexican SEP", grades: "Pre-K through 9", tuitionUSD: "$4,000–$7,000/year", note: "Bilingual English-Spanish. Small class sizes. Expanding to upper grades. Popular with expat families." },
      { name: "Colegio Americano de Mérida", type: "Private / Bilingual", curriculum: "American / Mexican", grades: "Pre-K through 12", tuitionUSD: "$3,500–$6,000/year", note: "Established bilingual school with strong local reputation. American-style curriculum with Mexican SEP compliance." },
    ],
    highlightsByDimension: {
      safety: "Safest large city in Mexico (#1 consistently)", cost: "Extremely low cost of living",
      culture: "Rich Mayan culture and cuisine", expat: "Growing expat community",
      nature: "Cenotes, beaches, and Mayan ruins nearby", climate: "Warm tropical weather year-round",
      healthcare: "Affordable private healthcare options", business: "Low operating costs for small businesses",
      visa: "Fast Mexican visa processing (1–3 months)", schools: "Affordable bilingual school options",
      default: "Safest large city in Mexico (#1 consistently)",
    },
  },
  {
    key: "sanJuan", city: "San Juan", country: "Puerto Rico", flag: "\u{1F1F5}\u{1F1F7}",
    costOfLivingIndex: 78, safetyRating: "Moderate", healthcareQuality: "Good",
    internetReliability: "Very Good", expatCommunity: "Large & established",
    climate: "Tropical — warm year-round with hurricane season June–November", climateType: "tropical",
    caveat: "Cost of living is higher than mainland Latin America (closer to mid-tier US cities). Hurricane preparedness is essential — the 2017 season was a major disruption.",
    scores: { budgetFriendliness: 3, safety: 5, healthcare: 6, schools: 7, culture: 7, nature: 7, expat: 8, business: 10, visaSpeed: 10, costSavings: 3 },
    visaByOrigin: { "United States": { speed: 10, boost: 15 }, "Canada": { speed: 3, boost: -5 }, "United Kingdom": { speed: 3, boost: -5 }, "Australia / NZ": { speed: 3, boost: -5 }, "EU Country": { speed: 3, boost: -5 }, "Other": { speed: 2, boost: -8 } },
    schoolsData: [
      { name: "Baldwin School of Puerto Rico", type: "Private / College-Prep", curriculum: "American / AP", grades: "Pre-K through 12", tuitionUSD: "$12,000–$18,000/year", note: "Top-ranked private school in PR. English-medium instruction. Strong AP program and US college placement." },
      { name: "Robinson School", type: "Private / Bilingual", curriculum: "American / AP", grades: "Pre-K through 12", tuitionUSD: "$10,000–$16,000/year", note: "Bilingual English-Spanish. IB candidate school. Located in Condado area. Strong STEM and arts programs." },
    ],
    highlightsByDimension: {
      visa: "No visa needed (US territory)", business: "Act 60: 4% corporate tax, 0% capital gains",
      expat: "English-speaking with US infrastructure", culture: "Caribbean lifestyle with US legal protections",
      cost: "Act 60 tax savings can offset higher living costs", safety: "US federal law enforcement and legal system",
      healthcare: "US-standard hospitals and insurance networks", nature: "El Yunque rainforest and Caribbean beaches",
      climate: "Year-round tropical warmth", schools: "US-accredited schools with AP programs",
      default: "No visa needed (US territory)",
    },
  },
  {
    key: "escazu", city: "Escazú", country: "Costa Rica", flag: "\u{1F1E8}\u{1F1F7}",
    costOfLivingIndex: 55, safetyRating: "High", healthcareQuality: "Very Good",
    internetReliability: "Very Good", expatCommunity: "Large & established",
    climate: "Tropical highland — spring-like year-round at 3,900 ft", climateType: "tropical",
    caveat: "Escazú's expat-heavy areas can feel like an American suburb — if you want authentic Costa Rican culture, consider spending weekends outside the central valley.",
    scores: { budgetFriendliness: 5, safety: 8, healthcare: 8, schools: 9, culture: 5, nature: 10, expat: 9, business: 5, visaSpeed: 5, costSavings: 5 },
    visaByOrigin: { "United States": { speed: 5, boost: 2 }, "Canada": { speed: 5, boost: 2 }, "United Kingdom": { speed: 5, boost: 0 }, "Australia / NZ": { speed: 5, boost: 0 }, "EU Country": { speed: 5, boost: 0 }, "Other": { speed: 4, boost: -2 } },
    schoolsData: [
      { name: "Country Day School", type: "American International", curriculum: "American / AP & IB", grades: "Pre-K through 12", tuitionUSD: "$12,000–$20,000/year", note: "Costa Rica's top international school. US-accredited. English instruction. Outstanding college placement including Ivy League." },
      { name: "Lincoln School", type: "American International", curriculum: "American / IB Diploma", grades: "Pre-K through 12", tuitionUSD: "$10,000–$17,000/year", note: "Founded by the US Embassy community. Full IB program. Diverse student body from 40+ nationalities." },
    ],
    highlightsByDimension: {
      healthcare: "Universal healthcare (CAJA) for residents", climate: "Spring-like climate year-round",
      expat: "Premier expat community in Central America", schools: "Excellent international schools",
      nature: "Cloud forests, volcanoes, and beaches within hours", safety: "One of the safest communities in Latin America",
      cost: "Strong value compared to US suburbs", business: "Growing tech and startup presence",
      culture: "Pura Vida lifestyle and local markets", visa: "Multiple visa pathways (Rentista, Pensionado)",
      default: "Universal healthcare (CAJA) for residents",
    },
  },
  {
    key: "panamaCity", city: "Panama City", country: "Panama", flag: "\u{1F1F5}\u{1F1E6}",
    costOfLivingIndex: 52, safetyRating: "Moderate", healthcareQuality: "Very Good",
    internetReliability: "Very Good", expatCommunity: "Large & established",
    climate: "Tropical — hot and humid year-round, dry season Dec–April", climateType: "tropical",
    caveat: "Panama City traffic is notoriously bad — choose your neighborhood carefully (Costa del Este or Clayton for families) to minimize commute stress.",
    scores: { budgetFriendliness: 6, safety: 5, healthcare: 8, schools: 7, culture: 6, nature: 7, expat: 8, business: 9, visaSpeed: 9, costSavings: 7 },
    visaByOrigin: { "United States": { speed: 9, boost: 5 }, "Canada": { speed: 9, boost: 5 }, "United Kingdom": { speed: 9, boost: 5 }, "Australia / NZ": { speed: 9, boost: 5 }, "EU Country": { speed: 9, boost: 5 }, "Other": { speed: 6, boost: 0 } },
    schoolsData: [
      { name: "International School of Panama (ISP)", type: "International", curriculum: "IB (PYP, MYP, DP)", grades: "Pre-K through 12", tuitionUSD: "$14,000–$22,000/year", note: "Full IB school with 50+ nationalities. English instruction. State-of-the-art campus in Ciudad del Saber." },
      { name: "Balboa Academy", type: "American International", curriculum: "American / AP", grades: "Pre-K through 12", tuitionUSD: "$8,000–$14,000/year", note: "American-style curriculum near the Panama Canal Zone. English-medium. Strong community feel with smaller class sizes." },
    ],
    highlightsByDimension: {
      visa: "Immediate permanent residency available", business: "0% tax on foreign-sourced income",
      cost: "US dollar economy — no currency risk", healthcare: "Modern infrastructure & healthcare",
      expat: "Cosmopolitan city with global expat community", nature: "Panama Canal, rainforests, and island getaways",
      safety: "Safe expat neighborhoods (Costa del Este, Clayton)", climate: "Tropical warmth with a pleasant dry season",
      schools: "Strong IB and American school options", culture: "Casco Viejo historic district and dining scene",
      default: "Immediate permanent residency available",
    },
  },
  {
    key: "florianopolis", city: "Florianópolis", country: "Brazil", flag: "🇧🇷",
    costOfLivingIndex: 45, safetyRating: "High", healthcareQuality: "Good",
    internetReliability: "Good", expatCommunity: "Growing",
    climate: "Subtropical — warm summers, mild winters, beach lifestyle year-round", climateType: "tropical",
    caveat: "Florianópolis is an island city — traffic over the bridges can be challenging during peak season (Dec–Feb). Portuguese is essential for daily life outside tourist areas.",
    scores: { budgetFriendliness: 7, safety: 7, healthcare: 6, schools: 5, culture: 7, nature: 10, expat: 5, business: 5, visaSpeed: 6, costSavings: 7 },
    visaByOrigin: { "United States": { speed: 6, boost: 0 }, "Canada": { speed: 6, boost: 0 }, "United Kingdom": { speed: 6, boost: 0 }, "Australia / NZ": { speed: 6, boost: 0 }, "EU Country": { speed: 6, boost: 0 }, "Other": { speed: 5, boost: -2 } },
    schoolsData: [
      { name: "Escola Internacional de Florianópolis", type: "International / Bilingual", curriculum: "Brazilian & IB-influenced", grades: "Pre-K through 9", tuitionUSD: "$4,000–$8,000/year", note: "Bilingual English-Portuguese. Growing international school with small class sizes. Popular with expat families." },
      { name: "Colégio Catarinense", type: "Private", curriculum: "Brazilian National", grades: "Pre-K through 12", tuitionUSD: "$3,000–$6,000/year", note: "Top-rated private school in Florianópolis. Portuguese instruction. Strong academics and extracurriculars." },
    ],
    highlightsByDimension: {
      nature: "42 beaches on a stunning island — surf, hike, and sail year-round",
      safety: "One of Brazil's safest and highest quality-of-life cities",
      cost: "40–60% cheaper than major US cities with beach lifestyle",
      culture: "Vibrant surf culture, Azorean heritage, and foodie scene",
      healthcare: "SUS public healthcare plus affordable private clinics",
      expat: "Growing digital nomad and international community",
      business: "Brazil's top tech hub — 'Silicon Island' startup ecosystem",
      visa: "Digital Nomad Visa for remote workers",
      schools: "Bilingual school options for expat families",
      climate: "Subtropical climate with warm summers and mild winters",
      default: "42 beaches on a stunning island — surf, hike, and sail year-round",
    },
  },
];

// ─── DEEP DIVE DATA ──────────────────────────────────────────
const DEEP_DIVE = {
  "Lisbon": {
    budgetBreakdown: [
      { category: "Housing", amount: "$2,000–$3,500", note: "2–3 bed apartment in Estrela, Lapa, or Cascais" },
      { category: "International School", amount: "$1,000–$2,300/child", note: "Per child/month at top-tier schools", familyOnly: true },
      { category: "Healthcare", amount: "$100–$250", note: "Private insurance supplement to public SNS" },
      { category: "Groceries & Dining", amount: "$600–$900", note: "Local markets, supermarkets, restaurants" },
      { category: "Transport", amount: "$150–$300", note: "Metro pass + occasional Uber/taxi" },
      { category: "Lifestyle", amount: "$500–$1,200", note: "Entertainment, weekend trips, activities" },
    ],
    totalRange: "$4,350–$8,450",
    neighborhoods: [
      { name: "Estrela / Lapa", vibe: "Leafy & family-friendly", description: "Quiet tree-lined streets with embassies, gardens, and top schools nearby. 15 minutes to downtown Lisbon." },
      { name: "Cascais", vibe: "Coastal & affluent", description: "Beachside town 30 minutes from Lisbon by train. International school hub with a resort-town feel year-round." },
      { name: "Príncipe Real", vibe: "Trendy & walkable", description: "Lisbon's most cosmopolitan neighborhood — boutiques, gardens, and restaurants. Best for couples and professionals." },
    ],
    visaPathway: { type: "D8 Digital Nomad Visa", processingTime: "2–4 months total", steps: [
      { label: "Document preparation", time: "2–3 weeks", detail: "Proof of remote income (€3,500+/mo), health insurance, criminal background check" },
      { label: "Consulate application", time: "1–2 weeks", detail: "Submit at your nearest Portuguese consulate with all supporting documents" },
      { label: "Visa processing", time: "4–8 weeks", detail: "Consulate reviews and approves — processing times vary by location" },
      { label: "Arrive & register", time: "First 2 weeks in PT", detail: "SEF registration, NIF tax number, NISS social security, SNS health card" },
    ]},
    glnServices: [
      { service: "Apartment search & lease negotiation", detail: "We find and secure housing in your target neighborhood before you arrive" },
      { service: "D8 visa application — full document prep", detail: "We handle the paperwork, apostille, translations, and consulate scheduling" },
      { service: "School enrollment & waitlist management", detail: "Applications, campus tours, and admissions follow-up for your children" },
      { service: "NIF, bank account & health registration", detail: "All essential registrations completed in your first week on the ground" },
      { service: "Airport pickup & settling-in support", detail: "Our Lisbon team meets you at arrival and handles first-week logistics" },
      { service: "Utilities, SIM, furniture & local orientation", detail: "Everything set up so your home is move-in ready when you walk through the door" },
    ],
  },
  "Mexico City": {
    budgetBreakdown: [
      { category: "Housing", amount: "$1,200–$2,800", note: "2–3 bed apartment in Condesa, Roma, or Polanco" },
      { category: "International School", amount: "$700–$2,500/child", note: "Per child/month at top bilingual or American schools", familyOnly: true },
      { category: "Healthcare", amount: "$200–$400", note: "Private insurance or pay-per-visit at top hospitals" },
      { category: "Groceries & Dining", amount: "$400–$700", note: "Markets, fondas, and restaurants — exceptional value" },
      { category: "Transport", amount: "$100–$250", note: "Metro, Uber, or hired driver" },
      { category: "Lifestyle", amount: "$400–$1,000", note: "Culture, nightlife, weekend trips" },
    ],
    totalRange: "$3,000–$7,650",
    neighborhoods: [
      { name: "Condesa / Roma", vibe: "Trendy & walkable", description: "Tree-lined boulevards, art-deco architecture, cafés on every corner. The expat epicenter with a vibrant food scene." },
      { name: "Polanco", vibe: "Upscale & polished", description: "Mexico City's most affluent neighborhood — luxury shopping, top restaurants, museums. Close to American School Foundation." },
      { name: "Santa Fe", vibe: "Modern & suburban", description: "Newer business district with modern apartments, malls, and international schools. Feels more American-suburban." },
    ],
    visaPathway: { type: "Temporary Resident Visa", processingTime: "1–3 months total", steps: [
      { label: "Gather financial proof", time: "1–2 weeks", detail: "6 months of bank statements showing $2,500+/mo income or $43,000+ in savings" },
      { label: "Consulate appointment", time: "1–2 weeks", detail: "Apply at your nearest Mexican consulate — in-person interview required" },
      { label: "Visa issued", time: "2–4 weeks", detail: "Receive visa sticker in passport — valid for 180 days to enter Mexico" },
      { label: "Exchange for resident card", time: "First 30 days in MX", detail: "Visit INM office to exchange visa for physical resident card (1-year renewable)" },
    ]},
    glnServices: [
      { service: "Apartment search in Condesa, Roma, or Polanco", detail: "We find vetted listings and negotiate lease terms before you arrive" },
      { service: "Temporary resident visa — full application support", detail: "Document prep, consulate scheduling, and INM exchange upon arrival" },
      { service: "School enrollment at ASF, Greengates, or Peterson", detail: "We handle applications, tours, and waitlist navigation" },
      { service: "CURP, RFC & bank account setup", detail: "Essential IDs and banking set up in your first week" },
      { service: "Airport pickup & neighborhood orientation", detail: "Our Mexico City team handles your arrival and first-week logistics" },
      { service: "SIM, internet, utilities & furniture sourcing", detail: "Your apartment fully set up and connected before move-in" },
    ],
  },
  "Mérida": {
    budgetBreakdown: [
      { category: "Housing", amount: "$800–$1,800", note: "2–3 bed house or apartment in Santiago or García Ginerés" },
      { category: "International School", amount: "$300–$600/child", note: "Per child/month at bilingual schools", familyOnly: true },
      { category: "Healthcare", amount: "$150–$300", note: "Private insurance or direct-pay at clinics" },
      { category: "Groceries & Dining", amount: "$300–$500", note: "Local markets and restaurants — very affordable" },
      { category: "Transport", amount: "$80–$200", note: "Car rental or Uber — city is spread out" },
      { category: "Lifestyle", amount: "$300–$600", note: "Beach trips, cenotes, cultural events" },
    ],
    totalRange: "$1,930–$4,000",
    neighborhoods: [
      { name: "Santiago / Centro", vibe: "Colonial & charming", description: "Historic center with restored colonial homes, walkable plazas, and the best restaurants. Most expats start here." },
      { name: "García Ginerés", vibe: "Residential & convenient", description: "Established middle-class neighborhood with tree-lined streets, close to hospitals and supermarkets." },
      { name: "Montebello / Northern Mérida", vibe: "Modern & suburban", description: "Newer developments with gated communities, modern amenities, and proximity to shopping plazas." },
    ],
    visaPathway: { type: "Temporary Resident Visa", processingTime: "1–3 months total", steps: [
      { label: "Gather financial proof", time: "1–2 weeks", detail: "6 months of bank statements showing $2,500+/mo income or $43,000+ in savings" },
      { label: "Consulate appointment", time: "1–2 weeks", detail: "Apply at your nearest Mexican consulate — in-person interview required" },
      { label: "Visa issued", time: "2–4 weeks", detail: "Receive visa sticker in passport — valid for 180 days to enter Mexico" },
      { label: "Exchange for resident card", time: "First 30 days in MX", detail: "Visit INM office in Mérida to exchange visa for physical resident card" },
    ]},
    glnServices: [
      { service: "Home search in Santiago, García Ginerés, or North Mérida", detail: "We find vetted houses and negotiate leases in your preferred neighborhood" },
      { service: "Temporary resident visa — full application support", detail: "Document prep, consulate scheduling, and INM exchange upon arrival" },
      { service: "School enrollment at local bilingual schools", detail: "We arrange tours, handle applications, and manage enrollment" },
      { service: "CURP, RFC & bank account setup", detail: "Essential IDs and banking set up in your first week" },
      { service: "Airport pickup & city orientation", detail: "Our Yucatán team meets you at Mérida airport and handles settling in" },
      { service: "Car rental, utilities, internet & home setup", detail: "Everything arranged so your home is ready on day one" },
    ],
  },
  "San Juan": {
    budgetBreakdown: [
      { category: "Housing", amount: "$1,800–$3,500", note: "2–3 bed apartment or condo in Condado or Guaynabo" },
      { category: "Private School", amount: "$1,000–$1,500/child", note: "Per child/month at Baldwin or Robinson School", familyOnly: true },
      { category: "Healthcare", amount: "$300–$600", note: "US-standard health insurance — higher than mainland LatAm" },
      { category: "Groceries & Dining", amount: "$600–$900", note: "Imported goods are pricier — local produce is affordable" },
      { category: "Transport", amount: "$200–$400", note: "Car is essential — gas, insurance, parking" },
      { category: "Lifestyle", amount: "$500–$1,000", note: "Beach life, dining, island hopping" },
    ],
    totalRange: "$4,400–$7,900",
    neighborhoods: [
      { name: "Condado", vibe: "Urban beach & vibrant", description: "San Juan's most walkable beach neighborhood — hotels, restaurants, nightlife. Popular with Act 60 relocators." },
      { name: "Guaynabo", vibe: "Suburban & family-oriented", description: "Upscale suburb with excellent schools, gated communities, and quiet tree-lined streets. Best for families." },
      { name: "Dorado", vibe: "Resort & luxury", description: "Exclusive beachfront community 30 min west of San Juan. Ritz-Carlton Reserve, golf courses, and top private schools." },
    ],
    visaPathway: { type: "No Visa Required", processingTime: "Immediate — US territory", steps: [
      { label: "Establish PR residency", time: "Day 1", detail: "Move to Puerto Rico — no visa, no passport needed. You're already a US citizen on US soil." },
      { label: "Apply for Act 60 tax decree", time: "2–4 weeks", detail: "Submit Act 60 application for 4% corporate tax and 0% capital gains on PR-sourced income" },
      { label: "Set up bona fide residency", time: "First 30 days", detail: "PR driver's license, voter registration, local bank account — establish domicile" },
      { label: "Pass presence test", time: "Ongoing", detail: "Spend 183+ days/year in PR, make it your tax home, have closer connections to PR than US mainland" },
    ]},
    glnServices: [
      { service: "Condo or home search in Condado, Guaynabo, or Dorado", detail: "We find vetted properties and negotiate leases or purchases" },
      { service: "Act 60 tax decree application", detail: "Full application prep, filing, and follow-up with DDEC (Dept. of Economic Development)" },
      { service: "School enrollment at Baldwin, Robinson, or local options", detail: "Applications, tours, and admissions for your children" },
      { service: "PR driver's license, banking & voter registration", detail: "All residency establishment steps handled in your first week" },
      { service: "Arrival coordination & island orientation", detail: "Airport pickup, neighborhood tours, and local connections" },
      { service: "Utilities, internet, car purchase/lease & home setup", detail: "Everything arranged so you're settled from day one" },
    ],
  },
  "Escazú": {
    budgetBreakdown: [
      { category: "Housing", amount: "$1,200–$2,500", note: "2–3 bed apartment or house in San Rafael or Santa Ana" },
      { category: "International School", amount: "$1,000–$1,700/child", note: "Per child/month at Country Day or Lincoln School", familyOnly: true },
      { category: "Healthcare", amount: "$100–$300", note: "CAJA public system included; private supplement optional" },
      { category: "Groceries & Dining", amount: "$500–$800", note: "Mix of local markets, Auto Mercado, and restaurants" },
      { category: "Transport", amount: "$150–$350", note: "Car recommended — gas, insurance, tolls" },
      { category: "Lifestyle", amount: "$400–$800", note: "Adventure activities, beach weekends, dining" },
    ],
    totalRange: "$3,350–$6,450",
    neighborhoods: [
      { name: "San Rafael de Escazú", vibe: "Upscale & convenient", description: "Heart of the expat community — walkable to restaurants, Multiplaza mall, and international schools." },
      { name: "Santa Ana", vibe: "Quiet & family-focused", description: "Adjacent town with newer developments, gated communities, and a more relaxed pace. Close to Lincoln School." },
      { name: "San Antonio de Escazú", vibe: "Hillside & scenic", description: "Higher elevation with cooler temps and mountain views. Mix of traditional Costa Rican homes and modern builds." },
    ],
    visaPathway: { type: "Rentista Visa", processingTime: "2–4 months total", steps: [
      { label: "Prove stable income", time: "1–2 weeks", detail: "Document $2,500+/mo in pension, investment, or remote income for 2+ years" },
      { label: "Submit application in CR", time: "1–2 weeks", detail: "Apply through Migración in Costa Rica — can enter on tourist visa first" },
      { label: "Processing & approval", time: "6–10 weeks", detail: "Migración reviews application — interim status allows you to stay" },
      { label: "Receive cédula", time: "2–4 weeks after approval", detail: "Pick up residency card, register with CAJA (public healthcare), open bank account" },
    ]},
    glnServices: [
      { service: "Home search in Escazú or Santa Ana", detail: "We find vetted properties and negotiate terms in the best family neighborhoods" },
      { service: "Rentista visa — full application support", detail: "Income documentation, Migración filing, and status tracking" },
      { service: "School enrollment at Country Day or Lincoln", detail: "Applications, campus tours, and waitlist management for your children" },
      { service: "CAJA registration, bank account & cédula pickup", detail: "Healthcare enrollment and essential registrations in your first weeks" },
      { service: "Airport pickup & Central Valley orientation", detail: "Our Costa Rica team handles arrival logistics and area tours" },
      { service: "Car lease, utilities, internet & home furnishing", detail: "Your home fully set up with reliable transportation arranged" },
    ],
  },
  "Panama City": {
    budgetBreakdown: [
      { category: "Housing", amount: "$1,200–$2,800", note: "2–3 bed apartment in Costa del Este or Clayton" },
      { category: "International School", amount: "$700–$1,800/child", note: "Per child/month at ISP or Balboa Academy", familyOnly: true },
      { category: "Healthcare", amount: "$200–$400", note: "Private insurance — world-class hospitals available" },
      { category: "Groceries & Dining", amount: "$400–$700", note: "Supermarkets, markets, and restaurants" },
      { category: "Transport", amount: "$100–$300", note: "Metro, Uber, or car — traffic is heavy" },
      { category: "Lifestyle", amount: "$400–$900", note: "Dining, beaches, San Blas island trips" },
    ],
    totalRange: "$3,000–$6,900",
    neighborhoods: [
      { name: "Costa del Este", vibe: "Modern & family-friendly", description: "Panama's newest upscale neighborhood — modern towers, parks, international schools, and waterfront dining." },
      { name: "Clayton", vibe: "Green & suburban", description: "Former US military base turned leafy suburb. Home to City of Knowledge, parks, and family-friendly atmosphere." },
      { name: "Casco Viejo", vibe: "Historic & trendy", description: "UNESCO World Heritage old town — restored colonial buildings, rooftop bars, boutique hotels. Best for couples and professionals." },
    ],
    visaPathway: { type: "Friendly Nations Visa", processingTime: "3–6 months total", steps: [
      { label: "Open Panama bank account", time: "1–2 weeks", detail: "Deposit $5,000+ minimum — this serves as proof of economic ties" },
      { label: "Gather documents", time: "2–3 weeks", detail: "Passport, background check (apostilled), professional or economic activity letter" },
      { label: "Submit application", time: "1 week", detail: "File through immigration lawyer at Servicio Nacional de Migración" },
      { label: "Receive permanent residency", time: "8–16 weeks", detail: "Permanent resident card issued — no need to renew. Path to citizenship in 5 years." },
    ]},
    glnServices: [
      { service: "Apartment search in Costa del Este or Clayton", detail: "We find vetted properties and negotiate leases in top family areas" },
      { service: "Friendly Nations Visa — full application support", detail: "Bank account opening, document prep, apostille, and immigration filing" },
      { service: "School enrollment at ISP or Balboa Academy", detail: "Applications, campus tours, and admissions support for your children" },
      { service: "Bank account, cedula & driver's license setup", detail: "All essential registrations completed with our on-ground team" },
      { service: "Airport pickup & Panama City orientation", detail: "Our team meets you at Tocumen and handles settling-in logistics" },
      { service: "Utilities, internet, SIM & home furnishing", detail: "Your apartment fully set up and ready before you arrive" },
    ],
  },
  "Florianópolis": {
    budgetBreakdown: [
      { category: "Housing", amount: "$800–$2,000", note: "2–3 bed apartment in Lagoa da Conceição, Campeche, or Centro" },
      { category: "International School", amount: "$350–$700/child", note: "Per child/month at bilingual or private schools", familyOnly: true },
      { category: "Healthcare", amount: "$100–$250", note: "Private health plan (Unimed) — SUS public system also available" },
      { category: "Groceries & Dining", amount: "$350–$600", note: "Local markets, supermarkets, and beachside restaurants" },
      { category: "Transport", amount: "$100–$250", note: "Car recommended on the island — Uber available in urban areas" },
      { category: "Lifestyle", amount: "$300–$700", note: "Surf lessons, beach clubs, boat trips, nightlife" },
    ],
    totalRange: "$2,000–$4,500",
    neighborhoods: [
      { name: "Lagoa da Conceição", vibe: "Bohemian & active", description: "The island's social hub — surrounded by lagoon and dunes, packed with restaurants, bars, and surf shops. Most popular with expats and digital nomads." },
      { name: "Campeche", vibe: "Beach & relaxed", description: "Quieter south-island neighborhood with stunning beach, growing café scene, and family-friendly vibes. Close to nature trails." },
      { name: "Jurerê Internacional", vibe: "Upscale & resort-like", description: "Florianópolis' most exclusive neighborhood — luxury homes, beach clubs, and a polished resort atmosphere year-round." },
    ],
    visaPathway: { type: "Digital Nomad Visa (VITEM XIV)", processingTime: "2–4 months total", steps: [
      { label: "Prove remote income", time: "1–2 weeks", detail: "Documentation of $1,500+/mo remote income from foreign employer or clients" },
      { label: "Consulate application", time: "1–2 weeks", detail: "Apply at your nearest Brazilian consulate with passport, background check, and income proof" },
      { label: "Visa processing", time: "4–8 weeks", detail: "Consulate reviews application — processing times vary by location" },
      { label: "Arrive & register", time: "First 30 days in BR", detail: "Register with Federal Police, get CPF tax number, open bank account" },
    ]},
    glnServices: [
      { service: "Apartment search in Lagoa, Campeche, or Jurerê", detail: "We find vetted properties and negotiate leases in the best island neighborhoods" },
      { service: "Digital Nomad Visa — full application support", detail: "Income documentation, consulate filing, and Federal Police registration upon arrival" },
      { service: "School enrollment at local bilingual schools", detail: "We arrange tours, handle applications, and manage enrollment for your children" },
      { service: "CPF, bank account & health plan registration", detail: "Essential IDs, banking, and Unimed health coverage set up in your first week" },
      { service: "Airport pickup & island orientation", detail: "Our Florianópolis team meets you at Hercílio Luz airport and handles settling in" },
      { service: "Car rental, utilities, internet & home setup", detail: "Everything arranged so your island home is ready on day one" },
    ],
  },
};

// ─── COST OF LIVING & TAX DATA ──────────────────────────────
const US_CITIES = {
  "New York City": { state: "NY", housing: 4200, school: 2800, healthcare: 650, groceries: 1200, transport: 350, lifestyle: 1500 },
  "San Francisco": { state: "CA", housing: 4500, school: 2600, healthcare: 600, groceries: 1100, transport: 300, lifestyle: 1400 },
  "Los Angeles": { state: "CA", housing: 3200, school: 2200, healthcare: 550, groceries: 950, transport: 400, lifestyle: 1200 },
  "Miami": { state: "FL", housing: 3000, school: 1800, healthcare: 500, groceries: 850, transport: 350, lifestyle: 1100 },
  "Chicago": { state: "IL", housing: 2400, school: 1600, healthcare: 500, groceries: 800, transport: 250, lifestyle: 900 },
  "Austin": { state: "TX", housing: 2200, school: 1400, healthcare: 450, groceries: 750, transport: 300, lifestyle: 900 },
  "Denver": { state: "CO", housing: 2500, school: 1500, healthcare: 500, groceries: 800, transport: 280, lifestyle: 950 },
  "Seattle": { state: "WA", housing: 3000, school: 2200, healthcare: 550, groceries: 950, transport: 280, lifestyle: 1100 },
};

const DESTINATION_COL = {
  "Lisbon": { housing: 2750, school: 1650, healthcare: 175, groceries: 750, transport: 225, lifestyle: 850 },
  "Mexico City": { housing: 2000, school: 1600, healthcare: 300, groceries: 550, transport: 175, lifestyle: 700 },
  "Mérida": { housing: 1300, school: 450, healthcare: 225, groceries: 400, transport: 140, lifestyle: 450 },
  "San Juan": { housing: 2650, school: 1250, healthcare: 450, groceries: 750, transport: 300, lifestyle: 750 },
  "Escazú": { housing: 1850, school: 1350, healthcare: 200, groceries: 650, transport: 250, lifestyle: 600 },
  "Panama City": { housing: 2000, school: 1250, healthcare: 300, groceries: 550, transport: 200, lifestyle: 650 },
  "Florianópolis": { housing: 1400, school: 525, healthcare: 175, groceries: 475, transport: 175, lifestyle: 500 },
};

const STATE_TAX_RATES = {
  NY: { rate: 0.0685, name: "New York", localRate: 0.03876 },
  CA: { rate: 0.0930, name: "California", localRate: 0 },
  FL: { rate: 0, name: "Florida", localRate: 0 },
  IL: { rate: 0.0495, name: "Illinois", localRate: 0 },
  TX: { rate: 0, name: "Texas", localRate: 0 },
  CO: { rate: 0.044, name: "Colorado", localRate: 0 },
  WA: { rate: 0, name: "Washington", localRate: 0 },
};

const FEDERAL_BRACKETS = [
  { min: 0, max: 23850, rate: 0.10 },
  { min: 23850, max: 96950, rate: 0.12 },
  { min: 96950, max: 206700, rate: 0.22 },
  { min: 206700, max: 394600, rate: 0.24 },
  { min: 394600, max: 501050, rate: 0.32 },
  { min: 501050, max: 751600, rate: 0.35 },
  { min: 751600, max: null, rate: 0.37 },
];

const MEXICO_BRACKETS = [
  { min: 0, max: 8952, rate: 0.0192 },
  { min: 8952, max: 75985, rate: 0.064 },
  { min: 75985, max: 133536, rate: 0.1088 },
  { min: 133536, max: 155229, rate: 0.16 },
  { min: 155229, max: 185852, rate: 0.1792 },
  { min: 185852, max: 374837, rate: 0.2136 },
  { min: 374837, max: 590796, rate: 0.2352 },
  { min: 590796, max: 1127927, rate: 0.30 },
  { min: 1127927, max: null, rate: 0.35 },
];

const BRAZIL_BRACKETS = [
  { min: 0, max: 26400, rate: 0 },
  { min: 26400, max: 33120, rate: 0.075 },
  { min: 33120, max: 43980, rate: 0.15 },
  { min: 43980, max: 54936, rate: 0.225 },
  { min: 54936, max: null, rate: 0.275 },
];

const DESTINATION_TAX_PROGRAMS = {
  "San Juan": { programName: "Act 60 Incentive", programDesc: "4% flat corporate tax, 0% capital gains on PR-sourced income", effectiveRate: 0.04, method: "flat", caveat: "Must establish bona fide PR residency (183+ days/year). US federal tax still applies to non-PR-sourced income." },
  "Lisbon": { programName: "NHR Successor Regime", programDesc: "20% flat tax on qualifying foreign employment income for 10 years", effectiveRate: 0.20, method: "flat", caveat: "Program rules changed in 2024 — qualifying activities required. Consult a Portuguese tax advisor." },
  "Panama City": { programName: "Territorial Tax System", programDesc: "0% tax on all foreign-sourced income", effectiveRate: 0, method: "territorial", caveat: "Panama only taxes Panama-sourced income. Remote work for US clients = $0 Panama tax." },
  "Escazú": { programName: "Territorial Tax System", programDesc: "0% tax on foreign-sourced income", effectiveRate: 0, method: "territorial", caveat: "Costa Rica taxes only CR-sourced income. Remote workers earning from abroad pay $0 local income tax." },
  "Mexico City": { programName: "Progressive Tax (Resident)", programDesc: "Rates from 1.92% to 35% on worldwide income as a tax resident", effectiveRate: null, method: "progressive", caveat: "Tax residents (183+ days) are taxed on worldwide income. US-Mexico tax treaty prevents double taxation." },
  "Mérida": { programName: "Progressive Tax (Resident)", programDesc: "Rates from 1.92% to 35% on worldwide income as a tax resident", effectiveRate: null, method: "progressive", caveat: "Tax residents (183+ days) are taxed on worldwide income. US-Mexico tax treaty prevents double taxation." },
  "Florianópolis": { programName: "Progressive Tax (Resident)", programDesc: "Rates from 0% to 27.5% on worldwide income as a tax resident", effectiveRate: null, method: "progressive", bracketsRef: "brazil", caveat: "Tax residents (183+ days) are taxed on worldwide income. Digital Nomad Visa holders may qualify for simplified tax treatment. Consult a Brazilian tax advisor." },
};

// ─── SEED FUNCTION ──────────────────────────────────────────
function seed() {
  console.log('Initializing database...');
  const db = initDb();

  // Check if already seeded
  const cityCount = db.prepare('SELECT COUNT(*) as count FROM cities').get().count;
  if (cityCount > 0) {
    console.log(`Database already has ${cityCount} cities. Use --reset to re-seed.`);
    if (!process.argv.includes('--reset')) return;
    console.log('Resetting database...');
    const tables = ['audit_log', 'visa_pathway_steps', 'visa_pathways', 'gln_services', 'budget_breakdowns', 'budget_totals',
      'neighborhoods', 'schools', 'city_highlights', 'visa_by_origin', 'city_scores', 'destination_col', 'destination_tax_programs',
      'tax_brackets', 'state_tax_rates', 'us_cities', 'cities', 'users'];
    for (const t of tables) db.exec(`DELETE FROM ${t}`);
  }

  // Create default admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gln.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'glnadmin2026';
  const hash = bcrypt.hashSync(adminPassword, 12);
  db.prepare('INSERT INTO users (email, password_hash, display_name, role) VALUES (?, ?, ?, ?)').run(adminEmail, hash, 'Admin', 'admin');
  console.log(`Created admin user: ${adminEmail}`);

  // Seed cities
  const insertCity = db.prepare(`
    INSERT INTO cities (key, city_name, country, flag, cost_of_living_index, safety_rating, healthcare_quality,
      internet_reliability, expat_community, climate_description, climate_type, caveat, source, source_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertScore = db.prepare('INSERT INTO city_scores (city_id, dimension, score, source, source_url) VALUES (?, ?, ?, ?, ?)');
  const insertVisa = db.prepare('INSERT INTO visa_by_origin (city_id, origin, speed, boost, source, source_url) VALUES (?, ?, ?, ?, ?, ?)');
  const insertHighlight = db.prepare('INSERT INTO city_highlights (city_id, dimension_key, highlight_text) VALUES (?, ?, ?)');
  const insertSchool = db.prepare('INSERT INTO schools (city_id, name, type, curriculum, grades, tuition_usd, note, source, source_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insertNeighborhood = db.prepare('INSERT INTO neighborhoods (city_id, name, vibe, description, sort_order) VALUES (?, ?, ?, ?, ?)');
  const insertBudget = db.prepare('INSERT INTO budget_breakdowns (city_id, category, amount, note, family_only, source, source_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const insertBudgetTotal = db.prepare('INSERT INTO budget_totals (city_id, total_range) VALUES (?, ?)');
  const insertVisaPathway = db.prepare('INSERT INTO visa_pathways (city_id, visa_type, processing_time, source, source_url) VALUES (?, ?, ?, ?, ?)');
  const insertVisaStep = db.prepare('INSERT INTO visa_pathway_steps (visa_pathway_id, step_label, step_time, step_detail, sort_order) VALUES (?, ?, ?, ?, ?)');
  const insertService = db.prepare('INSERT INTO gln_services (city_id, service_name, detail, sort_order) VALUES (?, ?, ?, ?)');
  const insertDestCol = db.prepare('INSERT INTO destination_col (city_id, housing, school, healthcare, groceries, transport, lifestyle, source, source_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insertTaxProgram = db.prepare('INSERT INTO destination_tax_programs (city_id, program_name, program_desc, effective_rate, method, brackets_ref, caveat, source, source_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');

  const transaction = db.transaction(() => {
    CITIES.forEach((c, idx) => {
      const result = insertCity.run(c.key, c.city, c.country, c.flag, c.costOfLivingIndex, c.safetyRating,
        c.healthcareQuality, c.internetReliability, c.expatCommunity, c.climate, c.climateType, c.caveat, SOURCES.cities.text, SOURCES.cities.url, idx);
      const cityId = result.lastInsertRowid;

      // Scores
      for (const [dim, score] of Object.entries(c.scores)) {
        insertScore.run(cityId, dim, score, SOURCES.cityScores.text, SOURCES.cityScores.url);
      }

      // Visa by origin
      for (const [origin, data] of Object.entries(c.visaByOrigin)) {
        insertVisa.run(cityId, origin, data.speed, data.boost, SOURCES.visa.text, SOURCES.visa.url);
      }

      // Highlights
      for (const [key, text] of Object.entries(c.highlightsByDimension)) {
        insertHighlight.run(cityId, key, text);
      }

      // Schools
      c.schoolsData.forEach((s, i) => {
        insertSchool.run(cityId, s.name, s.type, s.curriculum, s.grades, s.tuitionUSD, s.note || null, SOURCES.schools.text, SOURCES.schools.url, i);
      });

      // Deep dive data
      const dd = DEEP_DIVE[c.city];
      if (dd) {
        // Budget
        dd.budgetBreakdown.forEach((b, i) => {
          insertBudget.run(cityId, b.category, b.amount, b.note || null, b.familyOnly ? 1 : 0, SOURCES.budget.text, SOURCES.budget.url, i);
        });
        insertBudgetTotal.run(cityId, dd.totalRange);

        // Neighborhoods
        dd.neighborhoods.forEach((n, i) => {
          insertNeighborhood.run(cityId, n.name, n.vibe, n.description, i);
        });

        // Visa pathway
        if (dd.visaPathway) {
          const vpResult = insertVisaPathway.run(cityId, dd.visaPathway.type, dd.visaPathway.processingTime, SOURCES.visa.text, SOURCES.visa.url);
          dd.visaPathway.steps.forEach((s, i) => {
            insertVisaStep.run(vpResult.lastInsertRowid, s.label, s.time, s.detail, i);
          });
        }

        // GLN services
        dd.glnServices.forEach((s, i) => {
          insertService.run(cityId, s.service, s.detail, i);
        });
      }

      // Destination cost of living
      const col = DESTINATION_COL[c.city];
      if (col) {
        insertDestCol.run(cityId, col.housing, col.school, col.healthcare, col.groceries, col.transport, col.lifestyle, SOURCES.destinationCol.text, SOURCES.destinationCol.url);
      }

      // Tax program
      const tax = DESTINATION_TAX_PROGRAMS[c.city];
      if (tax) {
        insertTaxProgram.run(cityId, tax.programName, tax.programDesc, tax.effectiveRate, tax.method, tax.bracketsRef || null, tax.caveat, SOURCES.taxPrograms.text, SOURCES.taxPrograms.url);
      }

      console.log(`  Seeded: ${c.city}, ${c.country}`);
    });

    // US cities
    for (const [name, data] of Object.entries(US_CITIES)) {
      db.prepare('INSERT INTO us_cities (city_name, state_code, housing, school, healthcare, groceries, transport, lifestyle, source, source_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(name, data.state, data.housing, data.school, data.healthcare, data.groceries, data.transport, data.lifestyle, SOURCES.usCities.text, SOURCES.usCities.url);
    }
    console.log(`  Seeded: ${Object.keys(US_CITIES).length} US cities`);

    // State tax rates
    for (const [code, data] of Object.entries(STATE_TAX_RATES)) {
      db.prepare('INSERT INTO state_tax_rates (state_code, state_name, rate, local_rate, source, source_url) VALUES (?, ?, ?, ?, ?, ?)').run(code, data.name, data.rate, data.localRate, SOURCES.stateTax.text, SOURCES.stateTax.url);
    }
    console.log(`  Seeded: ${Object.keys(STATE_TAX_RATES).length} state tax rates`);

    // Tax brackets
    const insertBracket = db.prepare('INSERT INTO tax_brackets (bracket_set, min_income, max_income, rate, source, source_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
    FEDERAL_BRACKETS.forEach((b, i) => insertBracket.run('federal_us', b.min, b.max, b.rate, SOURCES.federalTax.text, SOURCES.federalTax.url, i));
    MEXICO_BRACKETS.forEach((b, i) => insertBracket.run('mexico', b.min, b.max, b.rate, SOURCES.mexicoTax.text, SOURCES.mexicoTax.url, i));
    BRAZIL_BRACKETS.forEach((b, i) => insertBracket.run('brazil', b.min, b.max, b.rate, SOURCES.brazilTax.text, SOURCES.brazilTax.url, i));
    console.log('  Seeded: tax brackets (federal, mexico, brazil)');
  });

  transaction();
  console.log('\nSeed complete!');
  console.log(`\nAdmin login: ${adminEmail} / ${adminPassword}`);
}

seed();
