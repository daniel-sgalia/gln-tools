import { useState, useEffect } from "react";

const GOOGLE_FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600&display=swap');
`;

const style = `
  ${GOOGLE_FONTS}
  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #07101F;
    --navy-mid: #0E1C30;
    --navy-light: #162540;
    --border: rgba(255,255,255,0.08);
    --gold: #C9A96E;
    --gold-light: #E8C98A;
    --cream: #F0EBE1;
    --muted: rgba(240,235,225,0.45);
    --green: #4CAF82;
    --amber: #E8944A;
    --red: #E05C5C;
  }

  body { background: var(--navy); color: var(--cream); font-family: 'Outfit', sans-serif; }

  .app {
    min-height: 100vh;
    background: var(--navy);
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(201,169,110,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 85% 90%, rgba(76,175,130,0.06) 0%, transparent 50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 16px 60px;
  }

  /* HEADER */
  .header {
    width: 100%;
    max-width: 800px;
    padding: 32px 0 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .header-eyebrow {
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 14px;
  }
  .header h1 {
    font-family: 'Cormorant Garant', serif;
    font-size: clamp(36px, 6vw, 58px);
    font-weight: 600;
    line-height: 1.08;
    color: var(--cream);
    margin-bottom: 16px;
  }
  .header h1 em {
    font-style: italic;
    color: var(--gold-light);
  }
  .header-sub {
    font-size: 15px;
    font-weight: 300;
    color: var(--muted);
    max-width: 480px;
    line-height: 1.6;
    margin-bottom: 40px;
  }
  .divider {
    width: 60px; height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    margin: 0 auto 40px;
  }

  /* PROGRESS */
  .progress-bar {
    width: 100%;
    max-width: 560px;
    margin: 0 auto 40px;
  }
  .progress-steps {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .progress-step {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--muted);
    transition: color 0.3s;
  }
  .progress-step.active { color: var(--gold); }
  .progress-track {
    height: 2px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--gold), var(--gold-light));
    border-radius: 2px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* QUESTION CARD */
  .question-card {
    width: 100%;
    max-width: 560px;
    background: var(--navy-mid);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 40px;
    animation: fadeUp 0.4s ease;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .question-number {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 12px;
  }
  .question-text {
    font-family: 'Cormorant Garant', serif;
    font-size: 26px;
    font-weight: 600;
    color: var(--cream);
    line-height: 1.3;
    margin-bottom: 8px;
  }
  .question-hint {
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 28px;
    line-height: 1.5;
  }
  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .options-grid.single { grid-template-columns: 1fr; }
  .option-btn {
    background: var(--navy-light);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 18px;
    color: var(--cream);
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
    line-height: 1.35;
  }
  .option-btn:hover {
    border-color: var(--gold);
    background: rgba(201,169,110,0.08);
    color: var(--gold-light);
    transform: translateY(-1px);
  }
  .option-btn.selected {
    border-color: var(--gold);
    background: rgba(201,169,110,0.12);
    color: var(--gold-light);
  }
  .option-icon { font-size: 18px; flex-shrink: 0; }

  .next-btn {
    margin-top: 24px;
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    border: none;
    border-radius: 10px;
    color: var(--navy);
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .next-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .next-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  /* LOADING */
  .loading-screen {
    width: 100%;
    max-width: 560px;
    text-align: center;
    padding: 60px 40px;
    background: var(--navy-mid);
    border: 1px solid var(--border);
    border-radius: 16px;
    animation: fadeUp 0.4s ease;
  }
  .globe-spinner {
    font-size: 52px;
    animation: spin 3s linear infinite;
    display: block;
    margin: 0 auto 24px;
  }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .loading-title {
    font-family: 'Cormorant Garant', serif;
    font-size: 28px;
    font-weight: 600;
    color: var(--cream);
    margin-bottom: 10px;
  }
  .loading-sub { font-size: 14px; color: var(--muted); margin-bottom: 32px; }
  .loading-steps { display: flex; flex-direction: column; gap: 10px; text-align: left; }
  .loading-step {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: var(--muted);
    padding: 10px 14px;
    border-radius: 8px;
    background: var(--navy-light);
    transition: all 0.3s;
  }
  .loading-step.done { color: var(--green); background: rgba(76,175,130,0.08); }
  .loading-step.active { color: var(--gold); background: rgba(201,169,110,0.08); }
  .step-icon { font-size: 16px; }

  /* RESULTS */
  .results-header {
    width: 100%;
    max-width: 800px;
    text-align: center;
    margin-bottom: 36px;
    animation: fadeUp 0.5s ease;
  }
  .results-title {
    font-family: 'Cormorant Garant', serif;
    font-size: clamp(30px, 5vw, 46px);
    font-weight: 600;
    color: var(--cream);
    margin-bottom: 10px;
  }
  .results-sub { font-size: 14px; color: var(--muted); }
  .profile-pill {
    display: inline-flex;
    gap: 16px;
    background: var(--navy-light);
    border: 1px solid var(--border);
    border-radius: 40px;
    padding: 8px 20px;
    margin-top: 16px;
    font-size: 12px;
    color: var(--muted);
    flex-wrap: wrap;
    justify-content: center;
  }
  .profile-pill span { color: var(--gold); font-weight: 500; }

  .results-grid {
    width: 100%;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* PATHWAY CARD */
  .pathway-card {
    background: var(--navy-mid);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    animation: fadeUp 0.5s ease;
    transition: border-color 0.3s, transform 0.2s;
  }
  .pathway-card:hover { border-color: rgba(201,169,110,0.3); transform: translateY(-2px); }
  .pathway-card.top-pick { border-color: var(--gold); }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--border);
    gap: 12px;
    flex-wrap: wrap;
  }
  .card-left { display: flex; align-items: center; gap: 14px; }
  .flag { font-size: 32px; }
  .card-destination { font-family: 'Cormorant Garant', serif; font-size: 22px; font-weight: 600; color: var(--cream); line-height: 1; }
  .card-visa-name { font-size: 12px; color: var(--gold); font-weight: 500; letter-spacing: 0.5px; margin-top: 3px; }
  .card-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .match-score {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(201,169,110,0.1);
    border: 1px solid rgba(201,169,110,0.25);
    border-radius: 10px;
    padding: 6px 12px;
  }
  .score-num { font-family: 'Cormorant Garant', serif; font-size: 24px; font-weight: 700; color: var(--gold-light); line-height: 1; }
  .score-label { font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); }

  .top-badge {
    background: var(--gold);
    color: var(--navy);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
  }

  .difficulty-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    letter-spacing: 0.3px;
  }
  .diff-easy { background: rgba(76,175,130,0.15); color: var(--green); border: 1px solid rgba(76,175,130,0.3); }
  .diff-moderate { background: rgba(232,148,74,0.15); color: var(--amber); border: 1px solid rgba(232,148,74,0.3); }
  .diff-complex { background: rgba(224,92,92,0.15); color: var(--red); border: 1px solid rgba(224,92,92,0.3); }

  .card-body { padding: 20px 24px; }

  .ai-summary {
    font-size: 14px;
    color: rgba(240,235,225,0.75);
    line-height: 1.65;
    margin-bottom: 20px;
    padding-left: 12px;
    border-left: 2px solid var(--gold);
  }

  .card-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 18px;
  }
  .stat-box {
    background: var(--navy-light);
    border-radius: 8px;
    padding: 10px 12px;
  }
  .stat-label { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
  .stat-value { font-size: 13px; font-weight: 500; color: var(--cream); line-height: 1.3; }

  .benefits-list {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-bottom: 18px;
  }
  .benefit-tag {
    background: var(--navy-light);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 4px 10px;
    font-size: 12px;
    color: rgba(240,235,225,0.65);
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }
  .caveats { font-size: 12px; color: var(--muted); line-height: 1.4; flex: 1; }
  .explore-btn {
    padding: 9px 20px;
    border: 1px solid var(--gold);
    border-radius: 8px;
    background: transparent;
    color: var(--gold);
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .explore-btn:hover { background: var(--gold); color: var(--navy); }

  /* ERROR */
  .error-box {
    background: rgba(224,92,92,0.1);
    border: 1px solid rgba(224,92,92,0.3);
    border-radius: 10px;
    padding: 16px 20px;
    font-size: 14px;
    color: var(--red);
    margin-bottom: 16px;
    max-width: 560px;
    width: 100%;
  }

  /* CTA footer */
  .results-cta {
    margin-top: 40px;
    width: 100%;
    max-width: 800px;
    background: linear-gradient(135deg, var(--navy-mid), var(--navy-light));
    border: 1px solid rgba(201,169,110,0.2);
    border-radius: 16px;
    padding: 36px 40px;
    text-align: center;
    animation: fadeUp 0.6s ease;
  }
  .cta-title { font-family: 'Cormorant Garant', serif; font-size: 28px; font-weight: 600; color: var(--cream); margin-bottom: 10px; }
  .cta-sub { font-size: 14px; color: var(--muted); margin-bottom: 24px; line-height: 1.6; }
  .cta-btn {
    display: inline-block;
    padding: 14px 36px;
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    border: none;
    border-radius: 10px;
    color: var(--navy);
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.5px;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s;
  }
  .cta-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .restart-link {
    display: block;
    margin-top: 14px;
    font-size: 13px;
    color: var(--muted);
    cursor: pointer;
    text-decoration: underline;
    background: none;
    border: none;
    font-family: 'Outfit', sans-serif;
  }
  .restart-link:hover { color: var(--cream); }

  @media (max-width: 560px) {
    .question-card { padding: 28px 20px; }
    .options-grid { grid-template-columns: 1fr; }
    .card-stats { grid-template-columns: 1fr 1fr; }
    .card-header { flex-direction: column; align-items: flex-start; }
  }
`;

// ─── QUESTIONS ────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: "citizenship",
    text: "What is your citizenship?",
    hint: "This affects which visa pathways are available to you.",
    options: [
      { label: "United States", icon: "🇺🇸" },
      { label: "Canada", icon: "🇨🇦" },
      { label: "United Kingdom", icon: "🇬🇧" },
      { label: "Australia / NZ", icon: "🇦🇺" },
      { label: "EU Country", icon: "🇪🇺" },
      { label: "Other", icon: "🌍" },
    ],
  },
  {
    id: "incomeType",
    text: "How do you earn your income?",
    hint: "Different visa categories favor different income structures.",
    options: [
      { label: "Remote employee / freelancer", icon: "💻" },
      { label: "Business owner / entrepreneur", icon: "🏢" },
      { label: "Investor / passive income", icon: "📈" },
      { label: "Retiree / pension", icon: "🌅" },
    ],
  },
  {
    id: "monthlyIncome",
    text: "What is your approximate monthly income?",
    hint: "Many visa programs have minimum income thresholds.",
    options: [
      { label: "Under $2,000 / mo", icon: "💰" },
      { label: "$2,000 – $5,000 / mo", icon: "💰" },
      { label: "$5,000 – $15,000 / mo", icon: "💰" },
      { label: "$15,000+ / mo", icon: "💰" },
    ],
  },
  {
    id: "familySize",
    text: "Who is relocating with you?",
    hint: "Some programs have simpler or cheaper dependent pathways.",
    options: [
      { label: "Just me", icon: "🧍" },
      { label: "Me + partner", icon: "👫" },
      { label: "Family with kids", icon: "👨‍👩‍👦" },
      { label: "Multi-generational", icon: "👴👩‍👦" },
    ],
  },
  {
    id: "timeline",
    text: "When do you plan to make the move?",
    hint: "This shapes whether processing time is a factor.",
    options: [
      { label: "ASAP (0–3 months)", icon: "🚀" },
      { label: "This year (3–12 months)", icon: "📅" },
      { label: "Planning ahead (1–2 years)", icon: "🗺️" },
      { label: "Just exploring", icon: "🔭" },
    ],
  },
];

const STEP_LABELS = ["Citizenship", "Income", "Budget", "Family", "Timeline"];

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function VisaPathwayExplorer() {
  const [step, setStep] = useState(0); // 0 = intro, 1-5 = questions, 6 = loading, 7 = results
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const currentQ = step >= 1 && step <= 5 ? QUESTIONS[step - 1] : null;
  const progressPct = step === 0 ? 0 : step <= 5 ? (step / 5) * 100 : 100;

  const handleStart = () => { setStep(1); setSelected(null); };

  const handleSelect = (label) => setSelected(label);

  const handleNext = () => {
    if (!selected) return;
    const newAnswers = { ...answers, [currentQ.id]: selected };
    setAnswers(newAnswers);
    setSelected(null);
    if (step < 5) {
      setStep(step + 1);
    } else {
      setStep(6);
      fetchResults(newAnswers);
    }
  };

  const buildPrompt = (profile) => `You are a world-class international relocation advisor for Global Living Network. A user has completed their profile. Analyze their situation and return EXACTLY a JSON array of 6 visa pathway recommendations — one for each destination: Puerto Rico, Costa Rica, Portugal, Mexico, Panama, Brazil.

User Profile:
- Citizenship: ${profile.citizenship}
- Income Type: ${profile.incomeType}
- Monthly Income: ${profile.monthlyIncome}
- Family: ${profile.familySize}
- Timeline: ${profile.timeline}

Return ONLY a JSON array (no markdown, no commentary) with this exact structure:
[
  {
    "destination": "Country Name",
    "flag": "🇵🇷",
    "visaName": "Specific visa/program name",
    "matchScore": 87,
    "difficulty": "Easy|Moderate|Complex",
    "incomeRequirement": "e.g. $2,500/mo",
    "processingTime": "e.g. 2–4 months",
    "pathToResidency": "e.g. 2 years → permanent",
    "aiSummary": "2–3 sentence personalized analysis of why this destination and visa fits THIS user's specific profile. Be specific and actionable.",
    "keyBenefits": ["benefit 1", "benefit 2", "benefit 3", "benefit 4"],
    "caveat": "One honest watchout specific to their profile."
  }
]

Rank them by matchScore (highest first). Use the user's actual profile to personalize matchScores and commentary. Be honest about poor fits with lower scores. Flags: 🇵🇷 Puerto Rico, 🇨🇷 Costa Rica, 🇵🇹 Portugal, 🇲🇽 Mexico, 🇵🇦 Panama, 🇧🇷 Brazil.`;

  const getMockResults = (profile) => [
    {
      destination: "Puerto Rico",
      flag: "\u{1F1F5}\u{1F1F7}",
      visaName: "Act 60 — Export Services",
      matchScore: 94,
      difficulty: "Moderate",
      incomeRequirement: "No minimum (tax benefit requires export services)",
      processingTime: "2–4 months",
      pathToResidency: "US territory — no visa needed",
      aiSummary: `As a ${profile.citizenship} citizen with ${profile.incomeType.toLowerCase()} income, Puerto Rico's Act 60 offers a powerful combination: 4% corporate tax, 0% capital gains, and no federal income tax on local-sourced income — all without needing a visa. Your ${profile.monthlyIncome} income positions you well for the tax incentive thresholds.`,
      keyBenefits: ["4% corporate tax rate", "0% capital gains tax", "No passport needed (US territory)", "English-speaking"],
      caveat: "Must establish bona fide residency (183+ days/year) and pass presence tests to qualify for Act 60 benefits."
    },
    {
      destination: "Portugal",
      flag: "\u{1F1F5}\u{1F1F9}",
      visaName: "D8 Digital Nomad Visa / IFICI (ex-NHR)",
      matchScore: 89,
      difficulty: "Moderate",
      incomeRequirement: "$3,480/mo (4x Portuguese minimum wage)",
      processingTime: "3–6 months",
      pathToResidency: "1 year → renew → permanent after 5 years",
      aiSummary: `Portugal's D8 visa is ideal for your ${profile.incomeType.toLowerCase()} profile. The new IFICI tax regime (replacing NHR) offers 20% flat tax on qualifying foreign income for 10 years. With ${profile.familySize.toLowerCase()} relocating, Portugal's excellent healthcare and education systems are a strong fit.`,
      keyBenefits: ["20% flat tax (IFICI regime)", "EU residency & Schengen access", "World-class healthcare", "Path to EU citizenship (5 years)"],
      caveat: "IFICI regime has stricter eligibility than old NHR — must not have been a Portuguese tax resident in prior 5 years."
    },
    {
      destination: "Mexico",
      flag: "\u{1F1F2}\u{1F1FD}",
      visaName: "Temporary Resident Visa (Residente Temporal)",
      matchScore: 85,
      difficulty: "Easy",
      incomeRequirement: "$2,500/mo or $42,000 in savings",
      processingTime: "1–3 months",
      pathToResidency: "1 year → renew up to 4 years → permanent",
      aiSummary: `Mexico's temporary residency visa has one of the lowest barriers to entry for your income level. With ${profile.monthlyIncome} monthly income, you comfortably exceed the threshold. The ${profile.timeline.toLowerCase()} timeline works perfectly — Mexico has the fastest processing of any destination on this list.`,
      keyBenefits: ["Low cost of living", "Close proximity to US", "Fast processing", "No language requirement for visa"],
      caveat: "Territorial tax system means you'll likely still owe US taxes on worldwide income — consult a cross-border tax advisor."
    },
    {
      destination: "Panama",
      flag: "\u{1F1F5}\u{1F1E6}",
      visaName: "Friendly Nations Visa",
      matchScore: 82,
      difficulty: "Easy",
      incomeRequirement: "$5,000 bank deposit + economic tie",
      processingTime: "2–4 months",
      pathToResidency: "Immediate permanent residency → citizenship after 5 years",
      aiSummary: `Panama's Friendly Nations Visa offers immediate permanent residency with minimal requirements — just a $5,000 bank deposit and an economic tie (job offer, business, or property). As a ${profile.citizenship} citizen, you qualify automatically. The territorial tax system means foreign-sourced income is tax-free.`,
      keyBenefits: ["Territorial taxation (0% on foreign income)", "Immediate permanent residency", "US dollar economy", "Pensionado discounts on everything"],
      caveat: "Must establish a genuine economic tie to Panama — opening a corporation ($1,500–$2,000) is the most common route."
    },
    {
      destination: "Costa Rica",
      flag: "\u{1F1E8}\u{1F1F7}",
      visaName: "Rentista Visa / Digital Nomad Visa",
      matchScore: 78,
      difficulty: "Moderate",
      incomeRequirement: "$2,500/mo (Rentista) or $3,000/mo (Digital Nomad)",
      processingTime: "3–6 months",
      pathToResidency: "2 years temporary → permanent after 3 years",
      aiSummary: `Costa Rica offers excellent quality of life for ${profile.familySize.toLowerCase()}. The Rentista visa requires proof of $2,500/mo stable income, which your ${profile.incomeType.toLowerCase()} income satisfies. Costa Rica's universal healthcare (CAJA) covers residents, and the expat community is well-established.`,
      keyBenefits: ["Universal healthcare (CAJA)", "Pura Vida lifestyle", "Strong expat community", "Excellent biodiversity & nature"],
      caveat: "Cost of living in expat-heavy areas (Escazú, Tamarindo) can approach US levels — budget carefully for international schools."
    },
    {
      destination: "Brazil",
      flag: "\u{1F1E7}\u{1F1F7}",
      visaName: "Digital Nomad Visa (VITEM XIV)",
      matchScore: 71,
      difficulty: "Complex",
      incomeRequirement: "$1,500/mo",
      processingTime: "4–8 months",
      pathToResidency: "1 year → renew → permanent after 4 years",
      aiSummary: `Brazil's digital nomad visa has a low income threshold at $1,500/mo, but the bureaucratic process is more complex than other destinations. For ${profile.familySize.toLowerCase()}, Brazil offers vibrant culture and low cost of living outside major cities, though the language barrier (Portuguese) is a factor.`,
      keyBenefits: ["Lowest income requirement", "Rich culture & lifestyle", "Very low cost of living (outside SP/Rio)", "Large country with diverse climates"],
      caveat: "Portuguese language is essential for daily life outside tourist areas — budget for language classes and expect a steeper cultural adjustment."
    },
  ];

  const fetchResults = async (profile) => {
    setLoadingStep(0);
    setError(null);

    const loadingIntervals = [
      setTimeout(() => setLoadingStep(1), 800),
      setTimeout(() => setLoadingStep(2), 1800),
      setTimeout(() => setLoadingStep(3), 2800),
    ];

    const useMock = !import.meta.env.VITE_USE_LIVE_API;

    try {
      let parsed;

      if (useMock) {
        // Demo mode — use mock data with realistic delay
        await new Promise((r) => setTimeout(r, 3200));
        parsed = getMockResults(profile);
      } else {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            messages: [{ role: "user", content: buildPrompt(profile) }],
          }),
        });

        const data = await response.json();
        const text = data.content?.map(b => b.text || "").join("") || "";
        const clean = text.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
      }

      loadingIntervals.forEach(clearTimeout);
      setLoadingStep(4);

      setTimeout(() => {
        setResults(parsed);
        setStep(7);
      }, 600);
    } catch (err) {
      loadingIntervals.forEach(clearTimeout);
      setError("We had trouble analyzing your profile. Please try again.");
      setStep(5);
    }
  };

  const restart = () => {
    setStep(0); setAnswers({}); setSelected(null); setResults(null); setError(null);
  };

  const diffClass = (d) =>
    d === "Easy" ? "diff-easy" : d === "Moderate" ? "diff-moderate" : "diff-complex";

  return (
    <>
      <style>{style}</style>
      <div className="app">

        {/* HEADER */}
        <div className="header">
          <div className="header-eyebrow">Global Living Network</div>
          <h1>Find Your <em>Visa Pathway</em><br />Abroad</h1>
          <p className="header-sub">
            Answer 5 questions and our AI advisor will map your best legal pathways across 6 top expat destinations — personalized to your income, family, and timeline.
          </p>
          <div className="divider" />
        </div>

        {/* PROGRESS BAR (shown during questions) */}
        {step >= 1 && step <= 5 && (
          <div className="progress-bar">
            <div className="progress-steps">
              {STEP_LABELS.map((label, i) => (
                <div key={i} className={`progress-step ${i + 1 <= step ? "active" : ""}`}>
                  {label}
                </div>
              ))}
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}

        {/* INTRO */}
        {step === 0 && (
          <div className="question-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>🌍</div>
            <div className="question-text" style={{ marginBottom: 10 }}>Ready to find your path?</div>
            <p className="question-hint">
              This 5-question assessment analyzes your citizenship, income type, budget, family situation, and timeline — then maps your strongest legal pathways across Puerto Rico, Costa Rica, Portugal, Mexico, Panama, and Brazil.
            </p>
            <button className="next-btn" onClick={handleStart}>
              Start My Assessment →
            </button>
          </div>
        )}

        {/* QUESTIONS */}
        {currentQ && (
          <div className="question-card" key={step}>
            <div className="question-number">Question {step} of 5</div>
            <div className="question-text">{currentQ.text}</div>
            <div className="question-hint">{currentQ.hint}</div>
            <div className={`options-grid ${currentQ.options.length <= 4 ? "single" : ""}`}>
              {currentQ.options.map((opt) => (
                <button
                  key={opt.label}
                  className={`option-btn ${selected === opt.label ? "selected" : ""}`}
                  onClick={() => handleSelect(opt.label)}
                >
                  <span className="option-icon">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
            <button className="next-btn" onClick={handleNext} disabled={!selected}>
              {step < 5 ? "Continue →" : "Analyze My Pathways →"}
            </button>
          </div>
        )}

        {/* LOADING */}
        {step === 6 && (
          <div className="loading-screen">
            <span className="globe-spinner">🌐</span>
            <div className="loading-title">Mapping Your Pathways</div>
            <div className="loading-sub">Our AI is analyzing 6 destinations against your profile…</div>
            <div className="loading-steps">
              {[
                ["🛂", "Checking visa eligibility by citizenship"],
                ["💼", "Matching income type to program requirements"],
                ["👨‍👩‍👦", "Evaluating family & dependent pathways"],
                ["📊", "Scoring & ranking all 6 destinations"],
                ["✅", "Generating your personalized report"],
              ].map(([icon, label], i) => (
                <div key={i} className={`loading-step ${loadingStep > i ? "done" : loadingStep === i ? "active" : ""}`}>
                  <span className="step-icon">{loadingStep > i ? "✓" : icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="error-box">{error}</div>
        )}

        {/* RESULTS */}
        {step === 7 && results && (
          <>
            <div className="results-header">
              <div className="results-title">Your Visa Pathway Report</div>
              <div className="results-sub">6 destinations analyzed · Ranked by fit for your profile</div>
              <div className="profile-pill">
                <span>{answers.citizenship}</span>
                <span>{answers.incomeType}</span>
                <span>{answers.monthlyIncome}</span>
                <span>{answers.familySize}</span>
              </div>
            </div>

            <div className="results-grid">
              {results.map((r, i) => (
                <div key={r.destination} className={`pathway-card ${i === 0 ? "top-pick" : ""}`}
                  style={{ animationDelay: `${i * 0.08}s` }}>

                  <div className="card-header">
                    <div className="card-left">
                      <span className="flag">{r.flag}</span>
                      <div>
                        <div className="card-destination">{r.destination}</div>
                        <div className="card-visa-name">{r.visaName}</div>
                      </div>
                    </div>
                    <div className="card-right">
                      {i === 0 && <span className="top-badge">Best Match</span>}
                      <span className={`difficulty-badge ${diffClass(r.difficulty)}`}>{r.difficulty}</span>
                      <div className="match-score">
                        <span className="score-num">{r.matchScore}</span>
                        <span className="score-label">Match</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="ai-summary">{r.aiSummary}</div>

                    <div className="card-stats">
                      <div className="stat-box">
                        <div className="stat-label">Income Req.</div>
                        <div className="stat-value">{r.incomeRequirement}</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-label">Processing</div>
                        <div className="stat-value">{r.processingTime}</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-label">Residency Path</div>
                        <div className="stat-value">{r.pathToResidency}</div>
                      </div>
                    </div>

                    <div className="benefits-list">
                      {r.keyBenefits?.map((b, j) => (
                        <span key={j} className="benefit-tag">✓ {b}</span>
                      ))}
                    </div>

                    <div className="card-footer">
                      <div className="caveats">⚠ {r.caveat}</div>
                      <button className="explore-btn"
                        onClick={() => window.open("https://globallivingnetwork.com/contact-us/", "_blank")}>
                        Explore {r.destination} →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="results-cta">
              <div className="cta-title">Ready to take the next step?</div>
              <div className="cta-sub">
                Our relocation specialists will map out your exact pathway, connect you with vetted immigration attorneys, and introduce you to local real estate agents in your top destination.
              </div>
              <a className="cta-btn" href="https://globallivingnetwork.com/contact-us/" target="_blank" rel="noreferrer">
                Start My Relocation Plan
              </a>
              <button className="restart-link" onClick={restart}>
                ← Run a new assessment
              </button>
            </div>
          </>
        )}

      </div>
    </>
  );
}
