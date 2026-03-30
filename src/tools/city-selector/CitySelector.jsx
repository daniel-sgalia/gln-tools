import { useState, useEffect } from "react";
import { loadAllData } from "../../data/dataProvider";

const GOOGLE_FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600&family=Sora:wght@400;500;600;800&display=swap');
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
    padding: 12px 16px 60px;
    position: relative;
  }

  .ao-corner-link {
    position: absolute;
    top: 26px;
    left: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: opacity 0.3s;
    z-index: 100;
  }
  .ao-corner-link:hover { opacity: 0.8; }
  .ao-corner-logo { height: 24px; width: 24px; }
  .ao-corner-text {
    font-family: 'Sora', sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: #F0EBE1;
    letter-spacing: -0.5px;
  }
  .ao-corner-text span { color: #C8FF3E; }

  .built-by {
    display: flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
    opacity: 0.7;
    transition: opacity 0.3s;
    margin-top: -8px;
    margin-bottom: 6px;
  }
  .built-by:hover { opacity: 1; }
  .built-by-logo { height: 14px; width: 14px; }
  .built-by-label {
    font-family: 'Sora', sans-serif;
    font-size: 11px;
    font-weight: 400;
    color: rgba(240,235,225,0.5);
    letter-spacing: -0.1px;
  }
  .built-by-text {
    font-family: 'Sora', sans-serif;
    font-size: 11px;
    font-weight: 800;
    color: #F0EBE1;
    letter-spacing: -0.3px;
  }
  .built-by-text span { color: #C8FF3E; }

  /* HEADER */
  .header {
    width: 100%;
    max-width: 720px;
    padding: 32px 0 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .header-logo {
    height: 38px;
    margin-bottom: 20px;
    filter: invert(1) brightness(0.92) sepia(0.15) hue-rotate(10deg) saturate(0.3);
    opacity: 0.85;
    transition: opacity 0.3s;
  }
  .header-logo:hover { opacity: 1; }
  .header-compact { padding: 8px 0 0; }
  .header-compact .header-logo { height: 24px; margin-bottom: 4px; }
  .header-eyebrow {
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 14px;
    display: none;
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
    font-size: 17px;
    font-weight: 400;
    color: rgba(240,235,225,0.75);
    max-width: 600px;
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
    max-width: 720px;
    margin: 0 auto 16px;
  }
  .progress-steps {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .progress-step {
    font-size: 12px;
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
    max-width: 720px;
    background: var(--navy-mid);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px 40px;
    animation: fadeUp 0.4s ease;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .question-number {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 12px;
  }
  .question-text {
    font-family: 'Cormorant Garant', serif;
    font-size: 30px;
    font-weight: 600;
    color: var(--cream);
    line-height: 1.3;
    margin-bottom: 8px;
  }
  .question-hint {
    font-size: 15px;
    color: var(--muted);
    margin-bottom: 24px;
    line-height: 1.5;
  }
  .options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }
  .options-grid.single { grid-template-columns: 1fr; }
  .options-grid.two-col { grid-template-columns: 1fr 1fr; }
  .option-btn {
    background: var(--navy-light);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px 20px;
    color: var(--cream);
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
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
  .option-icon { display: none; }

  .next-btn {
    margin-top: 20px;
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    border: none;
    border-radius: 10px;
    color: var(--navy);
    font-family: 'Outfit', sans-serif;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .next-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .next-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .multi-select-counter {
    margin-top: 16px;
    text-align: center;
    font-size: 13px;
    color: var(--muted);
    letter-spacing: 0.3px;
  }

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
  .spinner-ring {
    width: 48px;
    height: 48px;
    border: 2px solid var(--border);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 28px;
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
  .step-icon { font-size: 13px; font-weight: 600; width: 18px; text-align: center; flex-shrink: 0; }

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

  /* CITY CARD */
  .city-card {
    background: var(--navy-mid);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    animation: fadeUp 0.5s ease;
    transition: border-color 0.3s, transform 0.2s;
  }
  .city-card:hover { border-color: rgba(201,169,110,0.3); transform: translateY(-2px); }
  .city-card.top-pick { border-color: var(--gold); }

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
  .card-subtitle { font-size: 12px; color: var(--gold); font-weight: 500; letter-spacing: 0.5px; margin-top: 3px; }
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

  .card-body { padding: 20px 24px; }

  .ai-summary {
    font-size: 14px;
    color: rgba(240,235,225,0.75);
    line-height: 1.65;
    margin-bottom: 20px;
    padding-left: 12px;
    border-left: 2px solid var(--gold);
  }

  /* METRICS GRID - 6 boxes, 3 columns */
  .city-metrics {
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
  .stat-value.metric-green { color: var(--green); }
  .stat-value.metric-amber { color: var(--amber); }
  .stat-value.metric-red { color: var(--red); }

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
    text-decoration: none;
  }
  .explore-btn:hover { background: var(--gold); color: var(--navy); }

  /* SCHOOLS ACCORDION */
  .schools-section {
    border-top: 1px solid var(--border);
    padding: 0 24px;
  }
  .schools-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    background: none;
    border: none;
    color: var(--gold);
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    letter-spacing: 0.3px;
  }
  .schools-toggle:hover { color: var(--gold-light); }
  .schools-chevron {
    transition: transform 0.3s ease;
    font-size: 12px;
    display: inline-block;
  }
  .schools-chevron.open { transform: rotate(90deg); }
  .schools-list {
    padding-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: fadeUp 0.3s ease;
  }
  .school-card {
    background: var(--navy-light);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px;
  }
  .school-name {
    font-family: 'Cormorant Garant', serif;
    font-size: 17px;
    font-weight: 600;
    color: var(--cream);
    margin-bottom: 6px;
  }
  .school-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }
  .school-meta-tag {
    background: var(--navy-mid);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 11px;
    color: var(--muted);
  }
  .school-tuition {
    font-size: 13px;
    font-weight: 500;
    color: var(--gold);
    margin-bottom: 4px;
  }
  .school-note {
    font-size: 12px;
    color: rgba(240,235,225,0.6);
    line-height: 1.5;
  }

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

  /* DEEP DIVE */
  .deep-dive {
    width: 100%;
    max-width: 800px;
    animation: fadeUp 0.5s ease;
  }
  .dd-back {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: var(--gold);
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 24px;
    padding: 0;
    transition: color 0.2s;
  }
  .dd-back:hover { color: var(--gold-light); }

  .dd-hero {
    background: var(--navy-mid);
    border: 1px solid var(--gold);
    border-radius: 16px;
    padding: 32px 36px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }
  .dd-hero-left { display: flex; align-items: center; gap: 16px; }
  .dd-hero-flag { font-size: 42px; }
  .dd-hero-title {
    font-family: 'Cormorant Garant', serif;
    font-size: 28px;
    font-weight: 600;
    color: var(--cream);
    line-height: 1.2;
  }
  .dd-hero-subtitle {
    font-size: 13px;
    color: var(--gold);
    font-weight: 400;
    margin-top: 4px;
  }

  .dd-section {
    background: var(--navy-mid);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px 32px;
    margin-bottom: 16px;
  }
  .dd-section-title {
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: 20px;
  }
  .source-badge {
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    color: rgba(240,235,225,0.35);
    margin-top: 12px;
    padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.04);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .source-badge-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(201,169,110,0.4);
  }

  .budget-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }
  .budget-item {
    background: var(--navy-light);
    border-radius: 10px;
    padding: 14px 16px;
  }
  .budget-category {
    font-size: 11px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 6px;
  }
  .budget-amount {
    font-family: 'Cormorant Garant', serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--cream);
    line-height: 1.2;
    margin-bottom: 4px;
  }
  .budget-note {
    font-size: 11px;
    color: rgba(240,235,225,0.5);
    line-height: 1.4;
  }
  .budget-total {
    background: rgba(201,169,110,0.08);
    border: 1px solid rgba(201,169,110,0.2);
    border-radius: 10px;
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .budget-total-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .budget-total-amount {
    font-family: 'Cormorant Garant', serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--gold-light);
  }

  .neighborhoods-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .neighborhood-card {
    background: var(--navy-light);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px 20px;
  }
  .neighborhood-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }
  .neighborhood-name {
    font-family: 'Cormorant Garant', serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--cream);
  }
  .neighborhood-vibe {
    font-size: 11px;
    color: var(--gold);
    background: rgba(201,169,110,0.1);
    border: 1px solid rgba(201,169,110,0.2);
    border-radius: 20px;
    padding: 2px 10px;
    font-weight: 500;
  }
  .neighborhood-desc {
    font-size: 13px;
    color: rgba(240,235,225,0.65);
    line-height: 1.6;
  }

  .visa-type-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(76,175,130,0.1);
    border: 1px solid rgba(76,175,130,0.25);
    border-radius: 8px;
    padding: 8px 16px;
    margin-bottom: 20px;
  }
  .visa-type-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--green);
  }
  .visa-type-time {
    font-size: 12px;
    color: var(--muted);
  }
  .visa-steps {
    display: flex;
    flex-direction: column;
    gap: 0;
    position: relative;
  }
  .visa-step {
    display: flex;
    gap: 16px;
    padding-bottom: 20px;
    position: relative;
  }
  .visa-step:last-child { padding-bottom: 0; }
  .visa-step::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 32px;
    bottom: 0;
    width: 1px;
    background: var(--border);
  }
  .visa-step:last-child::before { display: none; }
  .step-number {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: rgba(201,169,110,0.12);
    border: 1px solid rgba(201,169,110,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    color: var(--gold);
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }
  .step-content { flex: 1; padding-top: 4px; }
  .step-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--cream);
    margin-bottom: 2px;
  }
  .step-time {
    font-size: 12px;
    color: var(--gold);
    font-weight: 500;
    margin-bottom: 4px;
  }
  .step-detail {
    font-size: 12px;
    color: rgba(240,235,225,0.55);
    line-height: 1.5;
  }

  .gln-services-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .gln-service {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .gln-check {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(76,175,130,0.12);
    border: 1px solid rgba(76,175,130,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: var(--green);
    flex-shrink: 0;
    margin-top: 1px;
  }
  .gln-service-text { flex: 1; }
  .gln-service-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--cream);
    margin-bottom: 2px;
  }
  .gln-service-detail {
    font-size: 12px;
    color: rgba(240,235,225,0.5);
    line-height: 1.5;
  }

  .lead-section {
    background: linear-gradient(135deg, var(--navy-mid), var(--navy-light));
    border: 1px solid rgba(201,169,110,0.25);
    border-radius: 16px;
    padding: 36px 36px;
    text-align: center;
    margin-top: 8px;
  }
  .lead-title {
    font-family: 'Cormorant Garant', serif;
    font-size: 28px;
    font-weight: 600;
    color: var(--cream);
    margin-bottom: 8px;
  }
  .lead-sub {
    font-size: 14px;
    color: var(--muted);
    margin-bottom: 28px;
    line-height: 1.6;
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
  }
  .lead-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-width: 400px;
    margin: 0 auto;
  }
  .form-input {
    width: 100%;
    padding: 14px 18px;
    background: var(--navy);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--cream);
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    transition: border-color 0.2s;
  }
  .form-input::placeholder { color: var(--muted); }
  .form-input:focus { outline: none; border-color: var(--gold); }
  .form-submit {
    padding: 15px;
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    border: none;
    border-radius: 10px;
    color: var(--navy);
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 4px;
  }
  .form-submit:hover { opacity: 0.9; transform: translateY(-1px); }
  .form-submit:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .form-disclaimer {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.5;
    margin-top: 4px;
  }

  .lead-success {
    text-align: center;
    padding: 20px 0;
    animation: fadeUp 0.4s ease;
  }
  .lead-success-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  .lead-success-title {
    font-family: 'Cormorant Garant', serif;
    font-size: 26px;
    font-weight: 600;
    color: var(--cream);
    margin-bottom: 10px;
  }
  .lead-success-text {
    font-size: 14px;
    color: var(--muted);
    line-height: 1.6;
    max-width: 400px;
    margin: 0 auto;
  }

  /* COL TRANSLATOR */
  .col-selector { margin-bottom: 24px; }
  .col-selector-label {
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 8px;
  }
  .col-dropdown {
    width: 100%;
    max-width: 320px;
    padding: 12px 16px;
    background: var(--navy);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--cream);
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    cursor: pointer;
    transition: border-color 0.2s;
  }
  .col-dropdown:focus { outline: none; border-color: var(--gold); }
  .col-dropdown option { background: var(--navy); color: var(--cream); }

  .col-headline {
    font-family: 'Cormorant Garant', serif;
    font-size: 28px;
    font-weight: 700;
    color: var(--green);
    margin-bottom: 24px;
    line-height: 1.2;
  }
  .col-headline em { color: var(--gold-light); font-style: normal; }

  .col-row-header {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr 0.8fr;
    gap: 12px;
    padding: 0 16px 8px;
  }
  .col-row-header span {
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--muted);
  }
  .col-comparison-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }
  .col-row {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr 0.8fr;
    gap: 12px;
    align-items: center;
    background: var(--navy-light);
    border-radius: 10px;
    padding: 12px 16px;
  }
  .col-category { font-size: 13px; font-weight: 500; color: var(--cream); }
  .col-us-cost {
    font-size: 14px;
    color: var(--muted);
    text-decoration: line-through;
    text-decoration-color: rgba(240,235,225,0.25);
  }
  .col-dest-cost { font-size: 14px; font-weight: 500; color: var(--cream); }
  .col-savings { font-size: 13px; font-weight: 600; color: var(--green); text-align: right; }
  .col-savings.negative { color: var(--red); }

  .col-totals {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .col-total-card {
    background: rgba(76,175,130,0.08);
    border: 1px solid rgba(76,175,130,0.2);
    border-radius: 10px;
    padding: 16px 20px;
    text-align: center;
  }
  .col-total-label {
    font-size: 11px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 6px;
  }
  .col-total-value {
    font-family: 'Cormorant Garant', serif;
    font-size: 26px;
    font-weight: 700;
    color: var(--green);
    line-height: 1;
  }

  /* TAX CALCULATOR */
  .tax-input-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .tax-input-label { font-size: 13px; color: var(--muted); white-space: nowrap; }
  .tax-input {
    width: 220px;
    padding: 12px 16px;
    background: var(--navy);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--cream);
    font-family: 'Outfit', sans-serif;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.5px;
    transition: border-color 0.2s;
  }
  .tax-input::placeholder { color: var(--muted); }
  .tax-input:focus { outline: none; border-color: var(--gold); }

  .tax-comparison {
    display: grid;
    grid-template-columns: 1fr 50px 1fr;
    gap: 0;
    align-items: stretch;
    margin-bottom: 20px;
  }
  .tax-column {
    background: var(--navy-light);
    border-radius: 12px;
    padding: 20px;
  }
  .tax-column.destination {
    border: 1px solid rgba(76,175,130,0.25);
    background: rgba(76,175,130,0.05);
  }
  .tax-column-header {
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border);
  }
  .tax-vs {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: var(--muted);
  }
  .tax-line-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--border);
  }
  .tax-line-item:last-child { border-bottom: none; }
  .tax-line-label { font-size: 13px; color: rgba(240,235,225,0.7); }
  .tax-line-value { font-size: 14px; font-weight: 500; color: var(--cream); }
  .tax-line-item.total {
    border-top: 2px solid var(--border);
    border-bottom: none;
    margin-top: 8px;
    padding-top: 12px;
  }
  .tax-line-item.total .tax-line-label { font-weight: 600; color: var(--cream); }
  .tax-line-item.total .tax-line-value {
    font-family: 'Cormorant Garant', serif;
    font-size: 22px;
    font-weight: 700;
  }

  .tax-program-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(76,175,130,0.1);
    border: 1px solid rgba(76,175,130,0.25);
    border-radius: 8px;
    padding: 8px 16px;
    margin-bottom: 12px;
  }
  .tax-program-name { font-size: 14px; font-weight: 600; color: var(--green); }
  .tax-program-desc {
    font-size: 12px;
    color: rgba(240,235,225,0.6);
    line-height: 1.5;
    margin-bottom: 16px;
  }
  .tax-savings-banner {
    background: rgba(76,175,130,0.1);
    border: 1px solid rgba(76,175,130,0.25);
    border-radius: 12px;
    padding: 20px 24px;
    text-align: center;
    margin-top: 20px;
  }
  .tax-savings-label {
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 6px;
  }
  .tax-savings-amount {
    font-family: 'Cormorant Garant', serif;
    font-size: 36px;
    font-weight: 700;
    color: var(--green);
    line-height: 1;
    margin-bottom: 6px;
  }
  .tax-savings-note { font-size: 12px; color: rgba(240,235,225,0.5); }
  .tax-disclaimer {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.5;
    margin-top: 16px;
    padding: 10px 14px;
    background: var(--navy-light);
    border-radius: 8px;
    border-left: 2px solid var(--amber);
  }

  @media (max-width: 768px) {
    .options-grid { grid-template-columns: 1fr 1fr; }
    .options-grid.single { grid-template-columns: 1fr; }
  }
  @media (max-width: 560px) {
    .question-card { padding: 28px 20px; }
    .options-grid { grid-template-columns: 1fr; }
    .city-metrics { grid-template-columns: 1fr 1fr; }
    .card-header { flex-direction: column; align-items: flex-start; }
    .budget-grid { grid-template-columns: 1fr 1fr; }
    .dd-hero { padding: 24px 20px; }
    .dd-section { padding: 24px 20px; }
    .dd-hero-title { font-size: 24px; }
    .lead-section { padding: 28px 20px; }
    .col-row { grid-template-columns: 1fr 1fr; gap: 6px; }
    .col-row-header { display: none; }
    .col-totals { grid-template-columns: 1fr; }
    .tax-comparison { grid-template-columns: 1fr; gap: 16px; }
    .tax-vs { display: none; }
    .tax-input-row { flex-direction: column; align-items: flex-start; }
  }
`;

// ─── CITY SCORING DATA ───────────────────────────────────────
const CITY_SCORE_DATA = {
  lisbon: {
    key: "lisbon", city: "Lisbon", country: "Portugal", flag: "\u{1F1F5}\u{1F1F9}",
    costOfLivingIndex: 58, safetyRating: "Very High", healthcareQuality: "Excellent",
    internetReliability: "Very Good", expatCommunity: "Large & established",
    climate: "Mediterranean - warm dry summers, mild rainy winters",
    scores: {
      climateType: "mediterranean", budgetFriendliness: 5, safety: 10, healthcare: 10,
      schools: 9, culture: 8, nature: 6, expat: 9, business: 7, visaSpeed: 5, costSavings: 5,
    },
    visaByOrigin: {
      "United States": { speed: 5, boost: 0 }, "Canada": { speed: 5, boost: 0 },
      "United Kingdom": { speed: 5, boost: 0 }, "Australia / NZ": { speed: 5, boost: 0 },
      "EU Country": { speed: 10, boost: 15 }, "Other": { speed: 4, boost: -3 },
    },
    caveat: "Lisbon housing costs have risen sharply since 2020 - expect $2,000–$3,500/month for a quality family apartment in desirable neighborhoods like Estrela or Cascais.",
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
      nature: "Atlantic beaches and Sintra hills within 30 minutes", climate: "300+ days of sunshine - Europe's sunniest capital",
      default: "EU residency via D8 Digital Nomad Visa",
    },
  },
  mexicoCity: {
    key: "mexicoCity", city: "Mexico City", country: "Mexico", flag: "\u{1F1F2}\u{1F1FD}",
    costOfLivingIndex: 42, safetyRating: "Moderate", healthcareQuality: "Very Good",
    internetReliability: "Very Good", expatCommunity: "Large & established",
    climate: "Temperate - spring-like year-round at 7,350 ft elevation",
    scores: {
      climateType: "temperate", budgetFriendliness: 8, safety: 5, healthcare: 8,
      schools: 8, culture: 10, nature: 5, expat: 10, business: 7, visaSpeed: 8, costSavings: 8,
    },
    visaByOrigin: {
      "United States": { speed: 8, boost: 2 }, "Canada": { speed: 8, boost: 2 },
      "United Kingdom": { speed: 7, boost: 0 }, "Australia / NZ": { speed: 7, boost: 0 },
      "EU Country": { speed: 7, boost: 0 }, "Other": { speed: 6, boost: -2 },
    },
    caveat: "Air quality can be poor during dry season (Nov–May) and altitude adjustment takes 1–2 weeks. Choose neighborhoods like Condesa, Roma, or Polanco for best quality of life.",
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
  merida: {
    key: "merida", city: "Mérida", country: "Mexico", flag: "\u{1F1F2}\u{1F1FD}",
    costOfLivingIndex: 35, safetyRating: "High", healthcareQuality: "Good",
    internetReliability: "Good", expatCommunity: "Growing",
    climate: "Tropical - hot and humid year-round, rainy season June–October",
    scores: {
      climateType: "tropical", budgetFriendliness: 10, safety: 8, healthcare: 6,
      schools: 4, culture: 5, nature: 6, expat: 6, business: 4, visaSpeed: 8, costSavings: 10,
    },
    visaByOrigin: {
      "United States": { speed: 8, boost: 2 }, "Canada": { speed: 8, boost: 2 },
      "United Kingdom": { speed: 7, boost: 0 }, "Australia / NZ": { speed: 7, boost: 0 },
      "EU Country": { speed: 7, boost: 0 }, "Other": { speed: 6, boost: -2 },
    },
    caveat: "International school options are more limited than Mexico City or Lisbon - families with teens may need to consider online/hybrid schooling supplements.",
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
  sanJuan: {
    key: "sanJuan", city: "San Juan", country: "Puerto Rico", flag: "\u{1F1F5}\u{1F1F7}",
    costOfLivingIndex: 78, safetyRating: "Moderate", healthcareQuality: "Good",
    internetReliability: "Very Good", expatCommunity: "Large & established",
    climate: "Tropical - warm year-round with hurricane season June–November",
    scores: {
      climateType: "tropical", budgetFriendliness: 3, safety: 5, healthcare: 6,
      schools: 7, culture: 7, nature: 7, expat: 8, business: 10, visaSpeed: 10, costSavings: 3,
    },
    visaByOrigin: {
      "United States": { speed: 10, boost: 15 }, "Canada": { speed: 3, boost: -5 },
      "United Kingdom": { speed: 3, boost: -5 }, "Australia / NZ": { speed: 3, boost: -5 },
      "EU Country": { speed: 3, boost: -5 }, "Other": { speed: 2, boost: -8 },
    },
    caveat: "Cost of living is higher than mainland Latin America (closer to mid-tier US cities). Hurricane preparedness is essential - the 2017 season was a major disruption.",
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
  escazu: {
    key: "escazu", city: "Escazú", country: "Costa Rica", flag: "\u{1F1E8}\u{1F1F7}",
    costOfLivingIndex: 55, safetyRating: "High", healthcareQuality: "Very Good",
    internetReliability: "Very Good", expatCommunity: "Large & established",
    climate: "Tropical highland - spring-like year-round at 3,900 ft",
    scores: {
      climateType: "tropical", budgetFriendliness: 5, safety: 8, healthcare: 8,
      schools: 9, culture: 5, nature: 10, expat: 9, business: 5, visaSpeed: 5, costSavings: 5,
    },
    visaByOrigin: {
      "United States": { speed: 5, boost: 2 }, "Canada": { speed: 5, boost: 2 },
      "United Kingdom": { speed: 5, boost: 0 }, "Australia / NZ": { speed: 5, boost: 0 },
      "EU Country": { speed: 5, boost: 0 }, "Other": { speed: 4, boost: -2 },
    },
    caveat: "Escazú's expat-heavy areas can feel like an American suburb - if you want authentic Costa Rican culture, consider spending weekends outside the central valley.",
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
  panamaCity: {
    key: "panamaCity", city: "Panama City", country: "Panama", flag: "\u{1F1F5}\u{1F1E6}",
    costOfLivingIndex: 52, safetyRating: "Moderate", healthcareQuality: "Very Good",
    internetReliability: "Very Good", expatCommunity: "Large & established",
    climate: "Tropical - hot and humid year-round, dry season Dec–April",
    scores: {
      climateType: "tropical", budgetFriendliness: 6, safety: 5, healthcare: 8,
      schools: 7, culture: 6, nature: 7, expat: 8, business: 9, visaSpeed: 9, costSavings: 7,
    },
    visaByOrigin: {
      "United States": { speed: 9, boost: 5 }, "Canada": { speed: 9, boost: 5 },
      "United Kingdom": { speed: 9, boost: 5 }, "Australia / NZ": { speed: 9, boost: 5 },
      "EU Country": { speed: 9, boost: 5 }, "Other": { speed: 6, boost: 0 },
    },
    caveat: "Panama City traffic is notoriously bad - choose your neighborhood carefully (Costa del Este or Clayton for families) to minimize commute stress.",
    schoolsData: [
      { name: "International School of Panama (ISP)", type: "International", curriculum: "IB (PYP, MYP, DP)", grades: "Pre-K through 12", tuitionUSD: "$14,000–$22,000/year", note: "Full IB school with 50+ nationalities. English instruction. State-of-the-art campus in Ciudad del Saber." },
      { name: "Balboa Academy", type: "American International", curriculum: "American / AP", grades: "Pre-K through 12", tuitionUSD: "$8,000–$14,000/year", note: "American-style curriculum near the Panama Canal Zone. English-medium. Strong community feel with smaller class sizes." },
    ],
    highlightsByDimension: {
      visa: "Immediate permanent residency available", business: "0% tax on foreign-sourced income",
      cost: "US dollar economy - no currency risk", healthcare: "Modern infrastructure & healthcare",
      expat: "Cosmopolitan city with global expat community", nature: "Panama Canal, rainforests, and island getaways",
      safety: "Safe expat neighborhoods (Costa del Este, Clayton)", climate: "Tropical warmth with a pleasant dry season",
      schools: "Strong IB and American school options", culture: "Casco Viejo historic district and dining scene",
      default: "Immediate permanent residency available",
    },
  },
  florianopolis: {
    key: "florianopolis", city: "Florianópolis", country: "Brazil", flag: "🇧🇷",
    costOfLivingIndex: 45, safetyRating: "High", healthcareQuality: "Good",
    internetReliability: "Good", expatCommunity: "Growing",
    climate: "Subtropical - warm summers, mild winters, beach lifestyle year-round",
    scores: {
      climateType: "tropical", budgetFriendliness: 7, safety: 7, healthcare: 6,
      schools: 5, culture: 7, nature: 10, expat: 5, business: 5, visaSpeed: 6, costSavings: 7,
    },
    visaByOrigin: {
      "United States": { speed: 6, boost: 0 }, "Canada": { speed: 6, boost: 0 },
      "United Kingdom": { speed: 6, boost: 0 }, "Australia / NZ": { speed: 6, boost: 0 },
      "EU Country": { speed: 6, boost: 0 }, "Other": { speed: 5, boost: -2 },
    },
    caveat: "Florianópolis is an island city - traffic over the bridges can be challenging during peak season (Dec–Feb). Portuguese is essential for daily life outside tourist areas.",
    schoolsData: [
      { name: "Escola Internacional de Florianópolis", type: "International / Bilingual", curriculum: "Brazilian & IB-influenced", grades: "Pre-K through 9", tuitionUSD: "$4,000–$8,000/year", note: "Bilingual English-Portuguese. Growing international school with small class sizes. Popular with expat families." },
      { name: "Colégio Catarinense", type: "Private", curriculum: "Brazilian National", grades: "Pre-K through 12", tuitionUSD: "$3,000–$6,000/year", note: "Top-rated private school in Florianópolis. Portuguese instruction. Strong academics and extracurriculars." },
    ],
    highlightsByDimension: {
      nature: "42 beaches on a stunning island - surf, hike, and sail year-round",
      safety: "One of Brazil's safest and highest quality-of-life cities",
      cost: "40–60% cheaper than major US cities with beach lifestyle",
      culture: "Vibrant surf culture, Azorean heritage, and foodie scene",
      healthcare: "SUS public healthcare plus affordable private clinics",
      expat: "Growing digital nomad and international community",
      business: "Brazil's top tech hub - 'Silicon Island' startup ecosystem",
      visa: "Digital Nomad Visa for remote workers",
      schools: "Bilingual school options for expat families",
      climate: "Subtropical climate with warm summers and mild winters",
      default: "42 beaches on a stunning island - surf, hike, and sail year-round",
    },
  },
};

// ─── SCORING LOOKUP CONSTANTS ────────────────────────────────
const CLIMATE_MAP = {
  "Tropical - warm year-round": "tropical",
  "Mediterranean - warm & dry summers": "mediterranean",
  "Temperate - four distinct seasons": "temperate",
  "Doesn't matter to me": null,
};

const BUDGET_TIERS = {
  "Under $3,000 / month": 1,
  "$3,000 – $6,000 / month": 2,
  "$6,000 – $12,000 / month": 3,
  "$12,000+ / month": 4,
};

const TIMELINE_URGENCY = {
  "Within 3 months": 4,
  "3–12 months": 3,
  "1–2 years out": 2,
  "Just exploring for now": 1,
};

const PRIORITY_TO_DIMENSIONS = {
  "Safety & stability": ["safety"],
  "Top schools & family life": ["schools"],
  "Low cost of living": ["budgetFriendliness", "costSavings"],
  "Healthcare quality": ["healthcare"],
  "Nightlife & culture": ["culture"],
  "Nature & outdoor lifestyle": ["nature"],
  "Strong expat community": ["expat"],
  "Business & entrepreneurship": ["business"],
};

const PRIORITY_TO_HIGHLIGHT_KEY = {
  "Safety & stability": "safety",
  "Top schools & family life": "schools",
  "Low cost of living": "cost",
  "Healthcare quality": "healthcare",
  "Nightlife & culture": "culture",
  "Nature & outdoor lifestyle": "nature",
  "Strong expat community": "expat",
  "Business & entrepreneurship": "business",
};

const DIM_TO_HIGHLIGHT_KEY = {
  budgetFriendliness: "cost", safety: "safety", healthcare: "healthcare",
  schools: "schools", culture: "culture", nature: "nature",
  expat: "expat", business: "business", visaSpeed: "visa", costSavings: "cost",
};

// ─── SCORING FUNCTIONS ───────────────────────────────────────
function scoreCities(profile, cityData) {
  const cities = Object.values(cityData || CITY_SCORE_DATA);
  const priorities = profile.priorities.split(", ");
  const climatePreference = CLIMATE_MAP[profile.climate];
  const budgetTier = BUDGET_TIERS[profile.budget];
  const timelineUrgency = TIMELINE_URGENCY[profile.timeline];
  const hasKids = profile.familySituation?.includes("children") || profile.familySituation?.includes("teens");
  const isRetiree = profile.familySituation?.includes("Retiree");
  const isSolo = profile.familySituation === "Just me" || profile.familySituation === "Me and my partner";

  return cities.map((cityData) => {
    let score = 50;
    const s = cityData.scores;
    const visa = cityData.visaByOrigin?.[profile.citizenship] || cityData.visaByOrigin?.["Other"];
    if (!visa) return { cityData, rawScore: 0 };

    // 1. Climate match
    if (climatePreference === null) {
      score += 3;
    } else if (s.climateType === climatePreference) {
      score += 12;
    } else if (climatePreference === "temperate" && (cityData.key === "escazu" || cityData.key === "mexicoCity")) {
      score += 7;
    } else {
      score -= 4;
    }

    // 2. Budget fit
    if (budgetTier === 1) score += s.budgetFriendliness * 1.2;
    else if (budgetTier === 2) score += s.budgetFriendliness * 0.8;
    else if (budgetTier === 3) score += Math.min(s.budgetFriendliness, 7) * 0.5;
    else score += (10 - s.budgetFriendliness) * 0.4;

    // 3. Priorities
    priorities.forEach((priority) => {
      const dims = PRIORITY_TO_DIMENSIONS[priority];
      if (dims) dims.forEach((dim) => { score += (s[dim] || 0) * 0.8; });
    });

    // 4. Family situation
    if (hasKids) { score += s.schools * 0.6 + s.safety * 0.3; }
    else if (isRetiree) { score += s.healthcare * 0.6 + s.costSavings * 0.3 + s.safety * 0.2; }
    else if (isSolo) { score += s.culture * 0.3 + s.expat * 0.2; }

    // 5. Visa & citizenship
    score += visa.boost + visa.speed * 0.3;

    // 6. Timeline urgency
    if (timelineUrgency >= 3) score += visa.speed * (timelineUrgency === 4 ? 0.8 : 0.4);

    return { cityData, rawScore: score };
  });
}

function normalizeScores(scoredCities) {
  scoredCities.sort((a, b) => b.rawScore - a.rawScore);
  const maxRaw = scoredCities[0].rawScore;
  const minRaw = scoredCities[scoredCities.length - 1].rawScore;
  const rawRange = maxRaw - minRaw || 1;
  return scoredCities.map((item, index) => ({
    ...item,
    matchScore: Math.round(96 - ((maxRaw - item.rawScore) / rawRange) * 21),
    rank: index + 1,
  }));
}

function buildHighlights(cityData, priorities, profile) {
  const highlights = [];
  const usedKeys = new Set();

  // 1. Lead with highlights matching user priorities
  priorities.forEach((priority) => {
    if (highlights.length >= 4) return;
    const key = PRIORITY_TO_HIGHLIGHT_KEY[priority];
    if (key && cityData.highlightsByDimension[key] && !usedKeys.has(key)) {
      highlights.push(cityData.highlightsByDimension[key]);
      usedKeys.add(key);
    }
  });

  // 2. Add visa highlight if citizenship gives a big boost
  if (highlights.length < 4 && !usedKeys.has("visa")) {
    const visa = cityData.visaByOrigin?.[profile.citizenship] || cityData.visaByOrigin?.["Other"];
    if (visa && (visa.boost >= 5 || visa.speed >= 9)) {
      highlights.push(cityData.highlightsByDimension.visa);
      usedKeys.add("visa");
    }
  }

  // 3. Fill with highest-scoring dimensions
  const dimensionRanking = Object.entries(cityData.scores)
    .filter(([key]) => key !== "climateType")
    .sort(([, a], [, b]) => b - a);

  for (const [dim] of dimensionRanking) {
    if (highlights.length >= 4) break;
    const hKey = DIM_TO_HIGHLIGHT_KEY[dim];
    if (hKey && !usedKeys.has(hKey) && cityData.highlightsByDimension[hKey]) {
      highlights.push(cityData.highlightsByDimension[hKey]);
      usedKeys.add(hKey);
    }
  }

  if (highlights.length < 4) highlights.push(cityData.highlightsByDimension.default);
  return highlights;
}

function buildAiSummary(cityData, profile) {
  const s = cityData.scores;
  const priorities = profile.priorities.split(", ");
  const visa = cityData.visaByOrigin?.[profile.citizenship] || cityData.visaByOrigin?.["Other"];
  const hasKids = profile.familySituation?.includes("children") || profile.familySituation?.includes("teens");
  const isRetiree = profile.familySituation?.includes("Retiree");
  const fragments = [];

  // Citizenship-specific opener
  if (visa?.boost >= 10) {
    if (cityData.key === "sanJuan") fragments.push(`As a ${profile.citizenship} citizen, ${cityData.city} requires no visa, no passport, and no immigration process`);
    else if (cityData.key === "lisbon") fragments.push(`As an EU citizen, you have automatic right to live and work in ${cityData.city} - no visa needed`);
  }

  // Budget relevance
  if (s.budgetFriendliness >= 8) fragments.push(`your ${profile.budget.toLowerCase()} budget stretches remarkably far here - expect 2–3x the purchasing power of a comparable US city`);
  else if (s.budgetFriendliness <= 3) fragments.push(`while the cost of living is higher than other options, your ${profile.budget.toLowerCase()} budget positions you comfortably`);

  // Priority-driven sentences
  if (priorities.includes("Safety & stability") && s.safety >= 8)
    fragments.push(`${cityData.safetyRating.toLowerCase()} safety ratings make it ideal for ${hasKids ? "raising a family" : isRetiree ? "a peaceful retirement" : "peace of mind"}`);
  if (priorities.includes("Top schools & family life") && s.schools >= 8)
    fragments.push("excellent international schools provide strong options from pre-K through graduation");
  if (priorities.includes("Healthcare quality") && s.healthcare >= 8)
    fragments.push(`${cityData.healthcareQuality.toLowerCase()} healthcare at a fraction of US costs`);
  if (priorities.includes("Nightlife & culture") && s.culture >= 8)
    fragments.push("a world-class cultural scene ensures there's always something to explore");
  if (priorities.includes("Nature & outdoor lifestyle") && s.nature >= 8)
    fragments.push("unparalleled access to nature and outdoor activities right at your doorstep");
  if (priorities.includes("Business & entrepreneurship") && s.business >= 8)
    fragments.push("significant tax advantages and a business-friendly environment make it ideal for entrepreneurs");
  if (priorities.includes("Strong expat community") && s.expat >= 8)
    fragments.push(`a ${cityData.expatCommunity.toLowerCase()} expat community means easy social connections and English-language services`);
  if (priorities.includes("Low cost of living") && s.costSavings >= 7)
    fragments.push("one of the most affordable relocation destinations with genuine cost savings");

  // Timeline relevance
  if (visa?.speed >= 9) fragments.push(`fast-track residency aligns perfectly with your ${profile.timeline.toLowerCase()} timeline`);

  const selected = fragments.slice(0, 3);
  if (selected.length === 0)
    return `${cityData.city} offers a solid match for your profile - combining ${cityData.safetyRating.toLowerCase()} safety, ${cityData.healthcareQuality.toLowerCase()} healthcare, and a ${cityData.expatCommunity.toLowerCase()} expat community. Your ${profile.budget.toLowerCase()} budget works well here, and the ${cityData.climate.toLowerCase()} climate suits many relocators.`;

  selected[0] = selected[0].charAt(0).toUpperCase() + selected[0].slice(1);
  if (selected.length === 1) return `${selected[0]}. ${cityData.city} is a strong fit for ${profile.familySituation.toLowerCase()} looking to relocate.`;
  if (selected.length === 2) return `${selected[0]}, and ${selected[1]}.`;
  return `${selected[0]}. Additionally, ${selected[1]}, and ${selected[2]}.`;
}

// ─── QUESTIONS ────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: "citizenship",
    text: "Where are you coming from?",
    hint: "Your current country affects visa options, tax treaties, and residency pathways.",
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
    id: "priorities",
    text: "What matters most in your new city?",
    hint: "Select up to 3 priorities that will shape your day-to-day happiness.",
    multiSelect: 3,
    options: [
      { label: "Safety & stability", icon: "🛡️" },
      { label: "Top schools & family life", icon: "🎓" },
      { label: "Low cost of living", icon: "💵" },
      { label: "Healthcare quality", icon: "🏥" },
      { label: "Nightlife & culture", icon: "🎭" },
      { label: "Nature & outdoor lifestyle", icon: "🏔️" },
      { label: "Strong expat community", icon: "🤝" },
      { label: "Business & entrepreneurship", icon: "📊" },
    ],
  },
  {
    id: "familySituation",
    text: "Who is relocating with you?",
    hint: "This helps us match school access, community fit, and neighborhood priorities.",
    options: [
      { label: "Just me", icon: "🧍" },
      { label: "Me and my partner", icon: "👫" },
      { label: "Family with young children", icon: "👨‍👩‍👧" },
      { label: "Family with teens", icon: "👨‍👩‍👦‍👦" },
      { label: "Retiree or retiree couple", icon: "🌅" },
    ],
  },
  {
    id: "budget",
    text: "What is your monthly household budget abroad?",
    hint: "Include housing, schooling, healthcare, and day-to-day living expenses.",
    options: [
      { label: "Under $3,000 / month", icon: "💰" },
      { label: "$3,000 – $6,000 / month", icon: "💰" },
      { label: "$6,000 – $12,000 / month", icon: "💰" },
      { label: "$12,000+ / month", icon: "💰" },
    ],
  },
  {
    id: "climate",
    text: "What climate do you prefer?",
    hint: "Climate affects lifestyle, energy costs, and which cities feel like home.",
    options: [
      { label: "Tropical - warm year-round", icon: "🌴" },
      { label: "Mediterranean - warm & dry summers", icon: "☀️" },
      { label: "Temperate - four distinct seasons", icon: "🍂" },
      { label: "Doesn't matter to me", icon: "🌍" },
    ],
  },
  {
    id: "timeline",
    text: "When are you planning to make the move?",
    hint: "This shapes visa processing urgency and how we prioritize your options.",
    options: [
      { label: "Within 3 months", icon: "🚀" },
      { label: "3–12 months", icon: "📅" },
      { label: "1–2 years out", icon: "🗺️" },
      { label: "Just exploring for now", icon: "🔭" },
    ],
  },
];

const STEP_LABELS = ["Origin", "Priorities", "Family", "Budget", "Climate", "Timeline"];

const TOTAL_QUESTIONS = QUESTIONS.length;

// ─── DEEP DIVE DATA ──────────────────────────────────────
const DEEP_DIVE_DATA = {
  Lisbon: {
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
      { name: "Príncipe Real", vibe: "Trendy & walkable", description: "Lisbon's most cosmopolitan neighborhood - boutiques, gardens, and restaurants. Best for couples and professionals." },
    ],
    visaPathway: {
      type: "D8 Digital Nomad Visa",
      processingTime: "2–4 months total",
      steps: [
        { label: "Document preparation", time: "2–3 weeks", detail: "Proof of remote income (€3,500+/mo), health insurance, criminal background check" },
        { label: "Consulate application", time: "1–2 weeks", detail: "Submit at your nearest Portuguese consulate with all supporting documents" },
        { label: "Visa processing", time: "4–8 weeks", detail: "Consulate reviews and approves - processing times vary by location" },
        { label: "Arrive & register", time: "First 2 weeks in PT", detail: "SEF registration, NIF tax number, NISS social security, SNS health card" },
      ],
    },
    glnServices: [
      { service: "Apartment search & lease negotiation", detail: "We find and secure housing in your target neighborhood before you arrive" },
      { service: "D8 visa application - full document prep", detail: "We handle the paperwork, apostille, translations, and consulate scheduling" },
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
      { category: "Groceries & Dining", amount: "$400–$700", note: "Markets, fondas, and restaurants - exceptional value" },
      { category: "Transport", amount: "$100–$250", note: "Metro, Uber, or hired driver" },
      { category: "Lifestyle", amount: "$400–$1,000", note: "Culture, nightlife, weekend trips" },
    ],
    totalRange: "$3,000–$7,650",
    neighborhoods: [
      { name: "Condesa / Roma", vibe: "Trendy & walkable", description: "Tree-lined boulevards, art-deco architecture, cafés on every corner. The expat epicenter with a vibrant food scene." },
      { name: "Polanco", vibe: "Upscale & polished", description: "Mexico City's most affluent neighborhood - luxury shopping, top restaurants, museums. Close to American School Foundation." },
      { name: "Santa Fe", vibe: "Modern & suburban", description: "Newer business district with modern apartments, malls, and international schools. Feels more American-suburban." },
    ],
    visaPathway: {
      type: "Temporary Resident Visa",
      processingTime: "1–3 months total",
      steps: [
        { label: "Gather financial proof", time: "1–2 weeks", detail: "6 months of bank statements showing $2,500+/mo income or $43,000+ in savings" },
        { label: "Consulate appointment", time: "1–2 weeks", detail: "Apply at your nearest Mexican consulate - in-person interview required" },
        { label: "Visa issued", time: "2–4 weeks", detail: "Receive visa sticker in passport - valid for 180 days to enter Mexico" },
        { label: "Exchange for resident card", time: "First 30 days in MX", detail: "Visit INM office to exchange visa for physical resident card (1-year renewable)" },
      ],
    },
    glnServices: [
      { service: "Apartment search in Condesa, Roma, or Polanco", detail: "We find vetted listings and negotiate lease terms before you arrive" },
      { service: "Temporary resident visa - full application support", detail: "Document prep, consulate scheduling, and INM exchange upon arrival" },
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
      { category: "Groceries & Dining", amount: "$300–$500", note: "Local markets and restaurants - very affordable" },
      { category: "Transport", amount: "$80–$200", note: "Car rental or Uber - city is spread out" },
      { category: "Lifestyle", amount: "$300–$600", note: "Beach trips, cenotes, cultural events" },
    ],
    totalRange: "$1,930–$4,000",
    neighborhoods: [
      { name: "Santiago / Centro", vibe: "Colonial & charming", description: "Historic center with restored colonial homes, walkable plazas, and the best restaurants. Most expats start here." },
      { name: "García Ginerés", vibe: "Residential & convenient", description: "Established middle-class neighborhood with tree-lined streets, close to hospitals and supermarkets." },
      { name: "Montebello / Northern Mérida", vibe: "Modern & suburban", description: "Newer developments with gated communities, modern amenities, and proximity to shopping plazas." },
    ],
    visaPathway: {
      type: "Temporary Resident Visa",
      processingTime: "1–3 months total",
      steps: [
        { label: "Gather financial proof", time: "1–2 weeks", detail: "6 months of bank statements showing $2,500+/mo income or $43,000+ in savings" },
        { label: "Consulate appointment", time: "1–2 weeks", detail: "Apply at your nearest Mexican consulate - in-person interview required" },
        { label: "Visa issued", time: "2–4 weeks", detail: "Receive visa sticker in passport - valid for 180 days to enter Mexico" },
        { label: "Exchange for resident card", time: "First 30 days in MX", detail: "Visit INM office in Mérida to exchange visa for physical resident card" },
      ],
    },
    glnServices: [
      { service: "Home search in Santiago, García Ginerés, or North Mérida", detail: "We find vetted houses and negotiate leases in your preferred neighborhood" },
      { service: "Temporary resident visa - full application support", detail: "Document prep, consulate scheduling, and INM exchange upon arrival" },
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
      { category: "Healthcare", amount: "$300–$600", note: "US-standard health insurance - higher than mainland LatAm" },
      { category: "Groceries & Dining", amount: "$600–$900", note: "Imported goods are pricier - local produce is affordable" },
      { category: "Transport", amount: "$200–$400", note: "Car is essential - gas, insurance, parking" },
      { category: "Lifestyle", amount: "$500–$1,000", note: "Beach life, dining, island hopping" },
    ],
    totalRange: "$4,400–$7,900",
    neighborhoods: [
      { name: "Condado", vibe: "Urban beach & vibrant", description: "San Juan's most walkable beach neighborhood - hotels, restaurants, nightlife. Popular with Act 60 relocators." },
      { name: "Guaynabo", vibe: "Suburban & family-oriented", description: "Upscale suburb with excellent schools, gated communities, and quiet tree-lined streets. Best for families." },
      { name: "Dorado", vibe: "Resort & luxury", description: "Exclusive beachfront community 30 min west of San Juan. Ritz-Carlton Reserve, golf courses, and top private schools." },
    ],
    visaPathway: {
      type: "No Visa Required",
      processingTime: "Immediate - US territory",
      steps: [
        { label: "Establish PR residency", time: "Day 1", detail: "Move to Puerto Rico - no visa, no passport needed. You're already a US citizen on US soil." },
        { label: "Apply for Act 60 tax decree", time: "2–4 weeks", detail: "Submit Act 60 application for 4% corporate tax and 0% capital gains on PR-sourced income" },
        { label: "Set up bona fide residency", time: "First 30 days", detail: "PR driver's license, voter registration, local bank account - establish domicile" },
        { label: "Pass presence test", time: "Ongoing", detail: "Spend 183+ days/year in PR, make it your tax home, have closer connections to PR than US mainland" },
      ],
    },
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
      { category: "Transport", amount: "$150–$350", note: "Car recommended - gas, insurance, tolls" },
      { category: "Lifestyle", amount: "$400–$800", note: "Adventure activities, beach weekends, dining" },
    ],
    totalRange: "$3,350–$6,450",
    neighborhoods: [
      { name: "San Rafael de Escazú", vibe: "Upscale & convenient", description: "Heart of the expat community - walkable to restaurants, Multiplaza mall, and international schools." },
      { name: "Santa Ana", vibe: "Quiet & family-focused", description: "Adjacent town with newer developments, gated communities, and a more relaxed pace. Close to Lincoln School." },
      { name: "San Antonio de Escazú", vibe: "Hillside & scenic", description: "Higher elevation with cooler temps and mountain views. Mix of traditional Costa Rican homes and modern builds." },
    ],
    visaPathway: {
      type: "Rentista Visa",
      processingTime: "2–4 months total",
      steps: [
        { label: "Prove stable income", time: "1–2 weeks", detail: "Document $2,500+/mo in pension, investment, or remote income for 2+ years" },
        { label: "Submit application in CR", time: "1–2 weeks", detail: "Apply through Migración in Costa Rica - can enter on tourist visa first" },
        { label: "Processing & approval", time: "6–10 weeks", detail: "Migración reviews application - interim status allows you to stay" },
        { label: "Receive cédula", time: "2–4 weeks after approval", detail: "Pick up residency card, register with CAJA (public healthcare), open bank account" },
      ],
    },
    glnServices: [
      { service: "Home search in Escazú or Santa Ana", detail: "We find vetted properties and negotiate terms in the best family neighborhoods" },
      { service: "Rentista visa - full application support", detail: "Income documentation, Migración filing, and status tracking" },
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
      { category: "Healthcare", amount: "$200–$400", note: "Private insurance - world-class hospitals available" },
      { category: "Groceries & Dining", amount: "$400–$700", note: "Supermarkets, markets, and restaurants" },
      { category: "Transport", amount: "$100–$300", note: "Metro, Uber, or car - traffic is heavy" },
      { category: "Lifestyle", amount: "$400–$900", note: "Dining, beaches, San Blas island trips" },
    ],
    totalRange: "$3,000–$6,900",
    neighborhoods: [
      { name: "Costa del Este", vibe: "Modern & family-friendly", description: "Panama's newest upscale neighborhood - modern towers, parks, international schools, and waterfront dining." },
      { name: "Clayton", vibe: "Green & suburban", description: "Former US military base turned leafy suburb. Home to City of Knowledge, parks, and family-friendly atmosphere." },
      { name: "Casco Viejo", vibe: "Historic & trendy", description: "UNESCO World Heritage old town - restored colonial buildings, rooftop bars, boutique hotels. Best for couples and professionals." },
    ],
    visaPathway: {
      type: "Friendly Nations Visa",
      processingTime: "3–6 months total",
      steps: [
        { label: "Open Panama bank account", time: "1–2 weeks", detail: "Deposit $5,000+ minimum - this serves as proof of economic ties" },
        { label: "Gather documents", time: "2–3 weeks", detail: "Passport, background check (apostilled), professional or economic activity letter" },
        { label: "Submit application", time: "1 week", detail: "File through immigration lawyer at Servicio Nacional de Migración" },
        { label: "Receive permanent residency", time: "8–16 weeks", detail: "Permanent resident card issued - no need to renew. Path to citizenship in 5 years." },
      ],
    },
    glnServices: [
      { service: "Apartment search in Costa del Este or Clayton", detail: "We find vetted properties and negotiate leases in top family areas" },
      { service: "Friendly Nations Visa - full application support", detail: "Bank account opening, document prep, apostille, and immigration filing" },
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
      { category: "Healthcare", amount: "$100–$250", note: "Private health plan (Unimed) - SUS public system also available" },
      { category: "Groceries & Dining", amount: "$350–$600", note: "Local markets, supermarkets, and beachside restaurants" },
      { category: "Transport", amount: "$100–$250", note: "Car recommended on the island - Uber available in urban areas" },
      { category: "Lifestyle", amount: "$300–$700", note: "Surf lessons, beach clubs, boat trips, nightlife" },
    ],
    totalRange: "$2,000–$4,500",
    neighborhoods: [
      { name: "Lagoa da Conceição", vibe: "Bohemian & active", description: "The island's social hub - surrounded by lagoon and dunes, packed with restaurants, bars, and surf shops. Most popular with expats and digital nomads." },
      { name: "Campeche", vibe: "Beach & relaxed", description: "Quieter south-island neighborhood with stunning beach, growing café scene, and family-friendly vibes. Close to nature trails." },
      { name: "Jurerê Internacional", vibe: "Upscale & resort-like", description: "Florianópolis' most exclusive neighborhood - luxury homes, beach clubs, and a polished resort atmosphere year-round." },
    ],
    visaPathway: {
      type: "Digital Nomad Visa (VITEM XIV)",
      processingTime: "2–4 months total",
      steps: [
        { label: "Prove remote income", time: "1–2 weeks", detail: "Documentation of $1,500+/mo remote income from foreign employer or clients" },
        { label: "Consulate application", time: "1–2 weeks", detail: "Apply at your nearest Brazilian consulate with passport, background check, and income proof" },
        { label: "Visa processing", time: "4–8 weeks", detail: "Consulate reviews application - processing times vary by location" },
        { label: "Arrive & register", time: "First 30 days in BR", detail: "Register with Federal Police, get CPF tax number, open bank account" },
      ],
    },
    glnServices: [
      { service: "Apartment search in Lagoa, Campeche, or Jurerê", detail: "We find vetted properties and negotiate leases in the best island neighborhoods" },
      { service: "Digital Nomad Visa - full application support", detail: "Income documentation, consulate filing, and Federal Police registration upon arrival" },
      { service: "School enrollment at local bilingual schools", detail: "We arrange tours, handle applications, and manage enrollment for your children" },
      { service: "CPF, bank account & health plan registration", detail: "Essential IDs, banking, and Unimed health coverage set up in your first week" },
      { service: "Airport pickup & island orientation", detail: "Our Florianópolis team meets you at Hercílio Luz airport and handles settling in" },
      { service: "Car rental, utilities, internet & home setup", detail: "Everything arranged so your island home is ready on day one" },
    ],
  },
};

// ─── COST OF LIVING DATA ─────────────────────────────────────
const US_CITY_COL_DATA = {
  "New York City": { state: "NY", housing: 4200, school: 2800, healthcare: 650, groceries: 1200, transport: 350, lifestyle: 1500 },
  "San Francisco": { state: "CA", housing: 4500, school: 2600, healthcare: 600, groceries: 1100, transport: 300, lifestyle: 1400 },
  "Los Angeles": { state: "CA", housing: 3200, school: 2200, healthcare: 550, groceries: 950, transport: 400, lifestyle: 1200 },
  "Miami": { state: "FL", housing: 3000, school: 1800, healthcare: 500, groceries: 850, transport: 350, lifestyle: 1100 },
  "Chicago": { state: "IL", housing: 2400, school: 1600, healthcare: 500, groceries: 800, transport: 250, lifestyle: 900 },
  "Austin": { state: "TX", housing: 2200, school: 1400, healthcare: 450, groceries: 750, transport: 300, lifestyle: 900 },
  "Denver": { state: "CO", housing: 2500, school: 1500, healthcare: 500, groceries: 800, transport: 280, lifestyle: 950 },
  "Seattle": { state: "WA", housing: 3000, school: 2200, healthcare: 550, groceries: 950, transport: 280, lifestyle: 1100 },
};

const DESTINATION_COL_DATA = {
  Lisbon: { housing: 2750, school: 1650, healthcare: 175, groceries: 750, transport: 225, lifestyle: 850 },
  "Mexico City": { housing: 2000, school: 1600, healthcare: 300, groceries: 550, transport: 175, lifestyle: 700 },
  "Mérida": { housing: 1300, school: 450, healthcare: 225, groceries: 400, transport: 140, lifestyle: 450 },
  "San Juan": { housing: 2650, school: 1250, healthcare: 450, groceries: 750, transport: 300, lifestyle: 750 },
  "Escazú": { housing: 1850, school: 1350, healthcare: 200, groceries: 650, transport: 250, lifestyle: 600 },
  "Panama City": { housing: 2000, school: 1250, healthcare: 300, groceries: 550, transport: 200, lifestyle: 650 },
  "Florianópolis": { housing: 1400, school: 525, healthcare: 175, groceries: 475, transport: 175, lifestyle: 500 },
};

// ─── ORIGIN COUNTRY COL (typical major-city costs in USD for non-US origins) ──
const ORIGIN_COUNTRY_COL = {
  "Canada": {
    label: "Canada", currency: "CAD", cities: {
      "Toronto": { housing: 2800, school: 1800, healthcare: 200, groceries: 850, transport: 280, lifestyle: 1000 },
      "Vancouver": { housing: 3200, school: 1900, healthcare: 200, groceries: 900, transport: 260, lifestyle: 1100 },
      "Montreal": { housing: 2000, school: 1400, healthcare: 180, groceries: 750, transport: 220, lifestyle: 800 },
      "Calgary": { housing: 2200, school: 1500, healthcare: 190, groceries: 800, transport: 300, lifestyle: 850 },
    },
  },
  "United Kingdom": {
    label: "UK", currency: "GBP", cities: {
      "London": { housing: 3500, school: 2500, healthcare: 250, groceries: 900, transport: 350, lifestyle: 1200 },
      "Manchester": { housing: 1800, school: 1600, healthcare: 200, groceries: 700, transport: 250, lifestyle: 800 },
      "Edinburgh": { housing: 2000, school: 1700, healthcare: 200, groceries: 750, transport: 240, lifestyle: 850 },
      "Bristol": { housing: 2100, school: 1600, healthcare: 200, groceries: 720, transport: 240, lifestyle: 800 },
    },
  },
  "Australia / NZ": {
    label: "Australia / NZ", currency: "AUD/NZD", cities: {
      "Sydney": { housing: 3200, school: 2200, healthcare: 300, groceries: 950, transport: 300, lifestyle: 1100 },
      "Melbourne": { housing: 2600, school: 2000, healthcare: 280, groceries: 900, transport: 280, lifestyle: 1000 },
      "Auckland": { housing: 2400, school: 1800, healthcare: 250, groceries: 850, transport: 260, lifestyle: 900 },
      "Brisbane": { housing: 2200, school: 1800, healthcare: 270, groceries: 850, transport: 260, lifestyle: 900 },
    },
  },
  "EU Country": {
    label: "EU", currency: "EUR", cities: {
      "Paris": { housing: 2800, school: 2200, healthcare: 200, groceries: 850, transport: 250, lifestyle: 1100 },
      "Amsterdam": { housing: 2600, school: 2000, healthcare: 250, groceries: 800, transport: 200, lifestyle: 950 },
      "Berlin": { housing: 1800, school: 1400, healthcare: 200, groceries: 650, transport: 200, lifestyle: 750 },
      "Madrid": { housing: 1600, school: 1500, healthcare: 180, groceries: 600, transport: 180, lifestyle: 700 },
    },
  },
  "Other": {
    label: "your home city", currency: "USD", cities: {
      "Typical Major City": { housing: 2500, school: 1800, healthcare: 400, groceries: 800, transport: 280, lifestyle: 900 },
    },
  },
};

// ─── TAX DATA ────────────────────────────────────────────────
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
  { min: 751600, max: Infinity, rate: 0.37 },
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
  { min: 1127927, max: Infinity, rate: 0.35 },
];

const BRAZIL_BRACKETS = [
  { min: 0, max: 26400, rate: 0 },
  { min: 26400, max: 33120, rate: 0.075 },
  { min: 33120, max: 43980, rate: 0.15 },
  { min: 43980, max: 54936, rate: 0.225 },
  { min: 54936, max: Infinity, rate: 0.275 },
];

const DESTINATION_TAX_PROGRAMS = {
  "San Juan": {
    programName: "Act 60 Incentive",
    programDesc: "4% flat corporate tax, 0% capital gains on PR-sourced income",
    effectiveRate: 0.04,
    method: "flat",
    caveat: "Must establish bona fide PR residency (183+ days/year). US federal tax still applies to non-PR-sourced income.",
  },
  Lisbon: {
    programName: "NHR Successor Regime",
    programDesc: "20% flat tax on qualifying foreign employment income for 10 years",
    effectiveRate: 0.20,
    method: "flat",
    caveat: "Program rules changed in 2024 - qualifying activities required. Consult a Portuguese tax advisor.",
  },
  "Panama City": {
    programName: "Territorial Tax System",
    programDesc: "0% tax on all foreign-sourced income",
    effectiveRate: 0,
    method: "territorial",
    caveat: "Panama only taxes Panama-sourced income. Remote work for US clients = $0 Panama tax.",
  },
  "Escazú": {
    programName: "Territorial Tax System",
    programDesc: "0% tax on foreign-sourced income",
    effectiveRate: 0,
    method: "territorial",
    caveat: "Costa Rica taxes only CR-sourced income. Remote workers earning from abroad pay $0 local income tax.",
  },
  "Mexico City": {
    programName: "Progressive Tax (Resident)",
    programDesc: "Rates from 1.92% to 35% on worldwide income as a tax resident",
    effectiveRate: null,
    method: "progressive",
    caveat: "Tax residents (183+ days) are taxed on worldwide income. US-Mexico tax treaty prevents double taxation.",
  },
};
DESTINATION_TAX_PROGRAMS["Mérida"] = DESTINATION_TAX_PROGRAMS["Mexico City"];
DESTINATION_TAX_PROGRAMS["Florianópolis"] = {
  programName: "Progressive Tax (Resident)",
  programDesc: "Rates from 0% to 27.5% on worldwide income as a tax resident",
  effectiveRate: null,
  method: "progressive",
  brackets: "brazil",
  caveat: "Tax residents (183+ days) are taxed on worldwide income. Digital Nomad Visa holders may qualify for simplified tax treatment. Consult a Brazilian tax advisor.",
};

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function CitySelector() {
  const [step, setStep] = useState(0); // 0 = intro, 1-6 = questions, 7 = loading, 8 = results
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [expandedSchools, setExpandedSchools] = useState({});
  const [selectedCity, setSelectedCity] = useState(null);
  const [leadForm, setLeadForm] = useState({ name: "", email: "", phone: "" });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [compareCity, setCompareCity] = useState("");
  const [taxIncome, setTaxIncome] = useState("");
  const [apiData, setApiData] = useState(null);

  // Load data from admin backend on mount (falls back to hardcoded constants if unavailable)
  useEffect(() => {
    loadAllData().then(data => { if (data) setApiData(data); });
  }, []);

  // Use API data if available, otherwise fall back to hardcoded constants
  const liveCityScoreData = apiData?.cities || CITY_SCORE_DATA;
  const liveDeepDiveData = apiData?.deepDive || DEEP_DIVE_DATA;
  const liveUsCityCOL = apiData?.usCityCOL || US_CITY_COL_DATA;
  const liveDestCOL = apiData?.destinationCOL || DESTINATION_COL_DATA;
  const liveStateTaxRates = apiData?.stateTaxRates || STATE_TAX_RATES;
  const liveFederalBrackets = apiData?.federalBrackets || FEDERAL_BRACKETS;
  const liveMexicoBrackets = apiData?.mexicoBrackets || MEXICO_BRACKETS;
  const liveBrazilBrackets = apiData?.brazilBrackets || BRAZIL_BRACKETS;
  const liveDestTaxPrograms = apiData?.destinationTaxPrograms || DESTINATION_TAX_PROGRAMS;

  const currentQ = step >= 1 && step <= TOTAL_QUESTIONS ? QUESTIONS[step - 1] : null;
  const progressPct = step === 0 ? 0 : step <= TOTAL_QUESTIONS ? (step / TOTAL_QUESTIONS) * 100 : 100;

  const handleStart = () => { setStep(1); setSelected(null); };

  // Auto-start on first render — skip the intro screen
  useEffect(() => {
    if (step === 0) handleStart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (label) => {
    if (currentQ?.multiSelect) {
      setSelected((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        if (arr.includes(label)) return arr.filter((l) => l !== label);
        if (arr.length >= currentQ.multiSelect) return arr;
        return [...arr, label];
      });
    } else {
      setSelected(label);
    }
  };

  const isSelected = (label) => {
    if (Array.isArray(selected)) return selected.includes(label);
    return selected === label;
  };

  const hasSelection = Array.isArray(selected) ? selected.length > 0 : !!selected;

  const handleNext = () => {
    if (!hasSelection) return;
    const value = Array.isArray(selected) ? selected.join(", ") : selected;
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);
    setSelected(null);
    if (step < TOTAL_QUESTIONS) {
      setStep(step + 1);
    } else {
      setStep(TOTAL_QUESTIONS + 1); // loading
      fetchResults(newAnswers);
    }
  };

  const toggleSchools = (city) => {
    setExpandedSchools((prev) => ({ ...prev, [city]: !prev[city] }));
  };

  const handleStartPlanning = (cityResult) => {
    setSelectedCity(cityResult);
    setLeadForm({ name: "", email: "", phone: "" });
    setLeadSubmitted(false);
    setCompareCity("");
    setTaxIncome("");
    setStep(TOTAL_QUESTIONS + 3); // deep-dive step
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    // In production, POST to API endpoint here
    setLeadSubmitted(true);
  };

  const buildPrompt = (profile) => `You are a senior international relocation advisor for Global Living Network, specializing in helping high-income families and professionals relocate to Latin America and Southern Europe.

A user has completed a relocation profile quiz. Based on their answers, recommend 4–7 specific cities ranked by fit.

IMPORTANT: Use real, accurate, current data. Real school names, real cost figures, real safety assessments. This is for live client use - accuracy matters.

User Profile:
- Citizenship: ${profile.citizenship}
- Top Priority: ${profile.priorities}
- Family Situation: ${profile.familySituation}
- Monthly Budget: ${profile.budget}
- Climate Preference: ${profile.climate}
- Timeline: ${profile.timeline}

City Pool (choose 4–6 from these based on fit):
- San Juan, Puerto Rico
- Lisbon, Portugal
- Porto, Portugal
- Cascais, Portugal
- Mexico City, Mexico
- Playa del Carmen, Mexico
- Mérida, Mexico
- Panama City, Panama
- San José / Escazú, Costa Rica
- Tamarindo, Costa Rica
- São Paulo, Brazil
- Rio de Janeiro, Brazil
- Florianópolis, Brazil
- Medellín, Colombia

Return ONLY a JSON array (no markdown, no backticks, no commentary) with this structure:
[
  {
    "city": "City Name",
    "country": "Country Name",
    "flag": "🇵🇹",
    "matchScore": 92,
    "costOfLivingIndex": 62,
    "safetyRating": "High",
    "healthcareQuality": "Excellent",
    "internetReliability": "Very Good",
    "expatCommunity": "Large & established",
    "climate": "Mediterranean - dry summers, mild wet winters",
    "aiSummary": "2–3 sentences personalized to THIS user's profile explaining why this city is a strong match. Be specific about their priorities, family situation, and budget.",
    "highlights": ["highlight 1", "highlight 2", "highlight 3", "highlight 4"],
    "schools": [
      {
        "name": "Real School Name",
        "type": "International",
        "curriculum": "IB",
        "grades": "Pre-K through 12",
        "tuitionUSD": "$12,000–$18,000/year",
        "note": "One sentence about the school - language of instruction, notable features."
      }
    ],
    "caveat": "One honest consideration or trade-off specific to this user's profile."
  }
]

Rules:
- Rank by matchScore (highest first). Scores should range from 60–97. Be honest - poor fits get lower scores.
- costOfLivingIndex: 100 = same as average US city. Lower = cheaper. Use real comparative data.
- safetyRating: "Very High", "High", "Moderate", or "Low"
- healthcareQuality: "Excellent", "Very Good", "Good", or "Adequate"
- internetReliability: "Excellent", "Very Good", "Good", or "Unreliable"
- expatCommunity: "Large & established", "Growing", "Small but active", or "Minimal"
- schools: Include 2–3 real schools per city. Use actual school names, actual curricula, actual approximate tuition ranges. If the user selected "Just me", "Me and my partner", or "Retiree" for family situation, return an empty schools array [].
- For users with families and teens, prioritize cities with strong international school options.
- For retirees, emphasize healthcare quality and cost of living.
- For budget-conscious users, recommend cities where their budget stretches furthest.`;

  const getMockResults = (profile) => {
    const hasKids =
      profile.familySituation?.includes("children") ||
      profile.familySituation?.includes("teens");
    const priorities = profile.priorities.split(", ");

    const scored = scoreCities(profile, liveCityScoreData);
    const ranked = normalizeScores(scored);

    return ranked.map((item) => {
      const cd = item.cityData;
      return {
        city: cd.city,
        country: cd.country,
        flag: cd.flag,
        matchScore: item.matchScore,
        costOfLivingIndex: cd.costOfLivingIndex,
        safetyRating: cd.safetyRating,
        healthcareQuality: cd.healthcareQuality,
        internetReliability: cd.internetReliability,
        expatCommunity: cd.expatCommunity,
        climate: cd.climate,
        aiSummary: buildAiSummary(cd, profile),
        highlights: buildHighlights(cd, priorities, profile),
        schools: hasKids ? cd.schoolsData : [],
        caveat: cd.caveat,
      };
    });
  };


  const LOADING_STEPS = [
    "Analyzing your priorities and family profile",
    "Evaluating cities across 7 countries",
    "Comparing cost of living and safety data",
    "Matching international schools to your family",
    "Generating your personalized city report",
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
        const text = data.content?.map((b) => b.text || "").join("") || "";
        const clean = text.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
      }

      loadingIntervals.forEach(clearTimeout);
      setLoadingStep(4);

      setTimeout(() => {
        setResults(parsed);
        setStep(TOTAL_QUESTIONS + 2); // results step
      }, 600);
    } catch (err) {
      loadingIntervals.forEach(clearTimeout);
      setError("We had trouble analyzing your profile. Please try again.");
      setStep(TOTAL_QUESTIONS);
    }
  };

  const restart = () => {
    setStep(1);
    setAnswers({});
    setSelected(null);
    setResults(null);
    setError(null);
    setExpandedSchools({});
    setSelectedCity(null);
    setLeadForm({ name: "", email: "", phone: "" });
    setLeadSubmitted(false);
    setCompareCity("");
    setTaxIncome("");
  };

  const safetyColor = (rating) =>
    rating === "Very High" || rating === "High"
      ? "metric-green"
      : rating === "Moderate"
        ? "metric-amber"
        : "metric-red";

  const healthColor = (quality) =>
    quality === "Excellent" || quality === "Very Good"
      ? "metric-green"
      : quality === "Good"
        ? "metric-amber"
        : "metric-red";

  const costColor = (index) =>
    index <= 45 ? "metric-green" : index <= 65 ? "metric-amber" : "metric-red";

  const internetColor = (reliability) =>
    reliability === "Excellent" || reliability === "Very Good"
      ? "metric-green"
      : reliability === "Good"
        ? "metric-amber"
        : "metric-red";

  // ── Cost of Living / Tax helpers ──
  const formatCurrency = (num) =>
    "$" + Math.round(num).toLocaleString();

  const parseCurrencyInput = (str) => {
    const cleaned = str.replace(/[^0-9]/g, "");
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  const calcFederalTax = (income) => {
    let tax = 0;
    for (const b of liveFederalBrackets) {
      if (income <= b.min) break;
      const max = b.max === null || b.max === undefined ? Infinity : b.max;
      tax += (Math.min(income, max) - b.min) * b.rate;
    }
    return tax;
  };

  const calcStateTax = (income, stateCode) => {
    const s = liveStateTaxRates[stateCode];
    if (!s) return 0;
    return income * (s.rate + s.localRate);
  };

  const calcDestinationTax = (income, cityName) => {
    const prog = liveDestTaxPrograms[cityName];
    if (!prog) return 0;
    if (prog.method === "territorial") return 0;
    if (prog.method === "flat") return income * prog.effectiveRate;
    if (prog.method === "progressive") {
      const brackets = prog.brackets === "brazil" ? liveBrazilBrackets : liveMexicoBrackets;
      let tax = 0;
      for (const b of brackets) {
        if (income <= b.min) break;
        const max = b.max === null || b.max === undefined ? Infinity : b.max;
        tax += (Math.min(income, max) - b.min) * b.rate;
      }
      return tax;
    }
    return 0;
  };

  const getColComparison = (originCosts, destCityName, hasKids) => {
    const dest = liveDestCOL[destCityName];
    if (!originCosts || !dest) return null;
    const categories = [
      { key: "housing", label: "Housing" },
      { key: "school", label: "International School", familyOnly: true },
      { key: "healthcare", label: "Healthcare" },
      { key: "groceries", label: "Groceries & Dining" },
      { key: "transport", label: "Transport" },
      { key: "lifestyle", label: "Lifestyle" },
    ].filter((c) => !c.familyOnly || hasKids);
    const items = categories.map((c) => {
      const originCost = originCosts[c.key];
      const destCost = dest[c.key];
      const pct = Math.round(((originCost - destCost) / originCost) * 100);
      return { category: c.label, originCost, destCost, savingsPct: pct };
    });
    const totalOrigin = items.reduce((s, i) => s + i.originCost, 0);
    const totalDest = items.reduce((s, i) => s + i.destCost, 0);
    return {
      items,
      totalOrigin,
      totalDest,
      totalSavings: totalOrigin - totalDest,
      overallPct: Math.round(((totalOrigin - totalDest) / totalOrigin) * 100),
    };
  };

  const isLoadingStep = step === TOTAL_QUESTIONS + 1;
  const isResultsStep = step === TOTAL_QUESTIONS + 2;
  const isDeepDiveStep = step === TOTAL_QUESTIONS + 3;

  return (
    <>
      <style>{style}</style>
      <div className="app">
        <a href="https://alignedops.io" target="_blank" rel="noopener noreferrer" className="ao-corner-link">
          <img src="/alignedops-logo.svg" alt="AlignedOps" className="ao-corner-logo" />
          <span className="ao-corner-text">Aligned<span>Ops</span></span>
        </a>

        {/* HEADER */}
        <div className="header header-compact">
          <a href="https://globallivingnetwork.com/about-us/" target="_blank" rel="noopener noreferrer">
            <img src="/gln-logo.png" alt="Global Living Network" className="header-logo" />
          </a>
          {step >= 1 && step <= TOTAL_QUESTIONS && (
            <>
              <a href="https://alignedops.io" target="_blank" rel="noopener noreferrer" className="built-by">
                <img src="/alignedops-logo.svg" alt="AlignedOps" className="built-by-logo" />
                <span className="built-by-label">Built by</span>
                <span className="built-by-text">Aligned<span>Ops</span></span>
              </a>
              <p className="header-sub" style={{ marginBottom: 20, maxWidth: 520 }}>
                Personalized city matches with cost of living, visa pathways,
                schools, and neighborhood data — in under two minutes.
              </p>
            </>
          )}
        </div>

        {/* PROGRESS BAR */}
        {step >= 1 && step <= TOTAL_QUESTIONS && (
          <div className="progress-bar">
            <div className="progress-steps">
              {STEP_LABELS.map((label, i) => (
                <div
                  key={i}
                  className={`progress-step ${i + 1 <= step ? "active" : ""}`}
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* QUESTIONS */}
        {currentQ && (
          <div className="question-card" key={step}>
            <div className="question-number">
              Question {step} of {TOTAL_QUESTIONS}
            </div>
            <div className="question-text">{currentQ.text}</div>
            <div className="question-hint">{currentQ.hint}</div>
            <div
              className={`options-grid ${currentQ.options.length <= 3 ? "single" : currentQ.options.length <= 5 ? "two-col" : ""}`}
            >
              {currentQ.options.map((opt) => (
                <button
                  key={opt.label}
                  className={`option-btn ${isSelected(opt.label) ? "selected" : ""}`}
                  onClick={() => handleSelect(opt.label)}
                >
                  <span className="option-icon">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
            {currentQ.multiSelect && (
              <div className="multi-select-counter">
                {Array.isArray(selected) ? selected.length : 0} of {currentQ.multiSelect} selected
              </div>
            )}
            <button
              className="next-btn"
              onClick={handleNext}
              disabled={!hasSelection}
            >
              {step < TOTAL_QUESTIONS
                ? "Continue →"
                : "Get My Recommendations →"}
            </button>
          </div>
        )}

        {/* LOADING */}
        {isLoadingStep && (
          <div className="loading-screen">
            <div className="spinner-ring" />
            <div className="loading-title">Building Your Plan</div>
            <div className="loading-sub">
              We're matching your situation to cities across 7 countries…
            </div>
            <div className="loading-steps">
              {LOADING_STEPS.map((label, i) => (
                <div
                  key={i}
                  className={`loading-step ${loadingStep > i ? "done" : loadingStep === i ? "active" : ""}`}
                >
                  <span className="step-icon">
                    {loadingStep > i ? "✓" : `${i + 1}`}
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && <div className="error-box">{error}</div>}

        {/* RESULTS */}
        {isResultsStep && results && (
          <>
            <div className="results-header">
              <div className="results-title">Your Personalized Relocation Plan</div>
              <div className="results-sub">
                {results.length} cities matched to your situation · Ranked by fit
              </div>
              <div className="profile-pill">
                <span>{answers.citizenship}</span>
                <span>{answers.priorities}</span>
                <span>{answers.familySituation}</span>
                <span>{answers.budget}</span>
              </div>
            </div>

            <div className="results-grid">
              {results.map((r, i) => (
                <div
                  key={r.city}
                  className={`city-card ${i === 0 ? "top-pick" : ""}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="card-header">
                    <div className="card-left">
                      <span className="flag">{r.flag}</span>
                      <div>
                        <div className="card-destination">
                          {r.city}, {r.country}
                        </div>
                        <div className="card-subtitle">{r.climate}</div>
                      </div>
                    </div>
                    <div className="card-right">
                      {i === 0 && (
                        <span className="top-badge">Best Match</span>
                      )}
                      <div className="match-score">
                        <span className="score-num">{r.matchScore}</span>
                        <span className="score-label">Match</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="ai-summary">{r.aiSummary}</div>

                    <div className="city-metrics">
                      <div className="stat-box">
                        <div className="stat-label">Cost of Living</div>
                        <div className={`stat-value ${costColor(r.costOfLivingIndex)}`}>
                          {r.costOfLivingIndex}/100
                        </div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-label">Safety</div>
                        <div className={`stat-value ${safetyColor(r.safetyRating)}`}>
                          {r.safetyRating}
                        </div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-label">Healthcare</div>
                        <div className={`stat-value ${healthColor(r.healthcareQuality)}`}>
                          {r.healthcareQuality}
                        </div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-label">Internet</div>
                        <div className={`stat-value ${internetColor(r.internetReliability)}`}>
                          {r.internetReliability}
                        </div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-label">Expat Community</div>
                        <div className="stat-value">
                          {r.expatCommunity}
                        </div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-label">Climate</div>
                        <div className="stat-value">
                          {r.climate?.split("-")[0]?.trim() || r.climate}
                        </div>
                      </div>
                    </div>

                    <div className="benefits-list">
                      {r.highlights?.map((h, j) => (
                        <span key={j} className="benefit-tag">
                          ✓ {h}
                        </span>
                      ))}
                    </div>

                    <div className="card-footer">
                      <div className="caveats">⚠ {r.caveat}</div>
                      <button
                        className="explore-btn"
                        onClick={() => handleStartPlanning(r)}
                      >
                        Start Planning {r.city} →
                      </button>
                    </div>
                  </div>

                  {/* SCHOOLS ACCORDION */}
                  {r.schools && r.schools.length > 0 && (
                    <div className="schools-section">
                      <button
                        className="schools-toggle"
                        onClick={() => toggleSchools(r.city)}
                      >
                        <span>
                          Top Schools in {r.city} ({r.schools.length})
                        </span>
                        <span
                          className={`schools-chevron ${expandedSchools[r.city] ? "open" : ""}`}
                        >
                          ▸
                        </span>
                      </button>
                      {expandedSchools[r.city] && (
                        <div className="schools-list">
                          {r.schools.map((s, k) => (
                            <div key={k} className="school-card">
                              <div className="school-name">{s.name}</div>
                              <div className="school-meta">
                                <span className="school-meta-tag">
                                  {s.type}
                                </span>
                                <span className="school-meta-tag">
                                  {s.curriculum}
                                </span>
                                <span className="school-meta-tag">
                                  {s.grades}
                                </span>
                              </div>
                              <div className="school-tuition">
                                {s.tuitionUSD}
                              </div>
                              <div className="school-note">{s.note}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="results-cta">
              <div className="cta-title">Ready to take the next step?</div>
              <div className="cta-sub">
                Click "Start Planning" on any city above to see a detailed
                relocation brief - budget breakdown, neighborhoods, visa steps,
                and what GLN handles to make your move happen.
              </div>
              <button className="restart-link" onClick={restart}>
                ← Explore different options
              </button>
            </div>
          </>
        )}

        {/* DEEP DIVE */}
        {isDeepDiveStep && selectedCity && (() => {
          const dd = liveDeepDiveData[selectedCity.city];
          if (!dd) return null;
          const hasKids =
            answers.familySituation?.includes("children") ||
            answers.familySituation?.includes("teens");
          const budgetItems = dd.budgetBreakdown.filter(
            (b) => !b.familyOnly || hasKids
          );
          return (
            <div className="deep-dive">
              <button
                className="dd-back"
                onClick={() => setStep(TOTAL_QUESTIONS + 2)}
              >
                ← Back to all cities
              </button>

              <div className="dd-hero">
                <div className="dd-hero-left">
                  <span className="dd-hero-flag">{selectedCity.flag}</span>
                  <div>
                    <div className="dd-hero-title">
                      Your Relocation Brief: {selectedCity.city}, {selectedCity.country}
                    </div>
                    <div className="dd-hero-subtitle">
                      {answers.citizenship} · {answers.familySituation} · {answers.budget}
                    </div>
                  </div>
                </div>
                <div className="match-score">
                  <span className="score-num">{selectedCity.matchScore}</span>
                  <span className="score-label">Match</span>
                </div>
              </div>

              {/* COST OF LIVING TRANSLATOR */}
              {(() => {
                const isUS = answers.citizenship === "United States";
                const originCountryData = !isUS ? ORIGIN_COUNTRY_COL[answers.citizenship] || ORIGIN_COUNTRY_COL["Other"] : null;
                const originCities = isUS ? liveUsCityCOL : (originCountryData?.cities || {});
                const originLabel = isUS ? "US" : (originCountryData?.label || "your home");
                const compareCosts = isUS ? liveUsCityCOL[compareCity] : originCities[compareCity];

                return (
                  <div className="dd-section">
                    <div className="dd-section-title">
                      {compareCity ? "Cost of Living Comparison" : "Monthly Budget Breakdown"}
                    </div>
                    <div className="col-selector">
                      <div className="col-selector-label">
                        {isUS ? "Compare costs with your current US city" : `Compare costs with your current city in ${originLabel}`}
                      </div>
                      <select
                        className="col-dropdown"
                        value={compareCity}
                        onChange={(e) => setCompareCity(e.target.value)}
                      >
                        <option value="">{isUS ? "Select your US city..." : `Select your ${originLabel} city...`}</option>
                        {Object.keys(originCities).map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    {compareCity ? (() => {
                      const comparison = getColComparison(compareCosts, selectedCity.city, hasKids);
                      if (!comparison) return null;
                      return (
                        <>
                          <div className="col-headline">
                            Your dollar goes <em>{comparison.overallPct}% further</em> in {selectedCity.city}
                          </div>
                          <div className="col-row-header">
                            <span>Category</span>
                            <span>In {compareCity.split(",")[0]}</span>
                            <span>In {selectedCity.city}</span>
                            <span style={{ textAlign: "right" }}>Savings</span>
                          </div>
                          <div className="col-comparison-grid">
                            {comparison.items.map((item, i) => (
                              <div key={i} className="col-row">
                                <span className="col-category">{item.category}</span>
                                <span className="col-us-cost">{formatCurrency(item.originCost)}</span>
                                <span className="col-dest-cost">{formatCurrency(item.destCost)}</span>
                                <span className={`col-savings ${item.savingsPct < 0 ? "negative" : ""}`}>
                                  {item.savingsPct > 0 ? `-${item.savingsPct}%` : `+${Math.abs(item.savingsPct)}%`}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="col-totals">
                            <div className="col-total-card">
                              <div className="col-total-label">Monthly Savings</div>
                              <div className="col-total-value">{formatCurrency(comparison.totalSavings)}/mo</div>
                            </div>
                            <div className="col-total-card">
                              <div className="col-total-label">Annual Savings</div>
                              <div className="col-total-value">{formatCurrency(comparison.totalSavings * 12)}/yr</div>
                            </div>
                          </div>
                          {!isUS && (
                            <div className="source-badge">
                              <span className="source-badge-dot" />
                              Estimates based on typical expat costs (USD) · Numbeo & GLN Research 2025
                            </div>
                          )}
                          {isUS && (liveDestCOL[selectedCity.city]?._meta?.source || liveUsCityCOL[compareCity]?._meta?.source) && (
                            <div className="source-badge">
                              <span className="source-badge-dot" />
                              Source: {liveDestCOL[selectedCity.city]?._meta?.source || liveUsCityCOL[compareCity]?._meta?.source || "GLN Research"}
                            </div>
                          )}
                        </>
                      );
                    })() : (
                      <>
                        <div className="budget-grid">
                          {budgetItems.map((b, i) => (
                            <div key={i} className="budget-item">
                              <div className="budget-category">{b.category}</div>
                              <div className="budget-amount">{b.amount}</div>
                              <div className="budget-note">{b.note}</div>
                            </div>
                          ))}
                        </div>
                        <div className="budget-total">
                          <span className="budget-total-label">Estimated Total</span>
                          <span className="budget-total-amount">{dd.totalRange}/mo</span>
                        </div>
                        {dd._meta?.budgetSource && (
                          <div className="source-badge">
                            <span className="source-badge-dot" />
                            Source: {dd._meta.budgetSource}
                            {dd._meta.lastUpdated && <> · Updated {new Date(dd._meta.lastUpdated + 'Z').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</>}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}

              {/* NEIGHBORHOODS */}
              <div className="dd-section">
                <div className="dd-section-title">Where to Live in {selectedCity.city}</div>
                <div className="neighborhoods-grid">
                  {dd.neighborhoods.map((n, i) => (
                    <div key={i} className="neighborhood-card">
                      <div className="neighborhood-header">
                        <span className="neighborhood-name">{n.name}</span>
                        <span className="neighborhood-vibe">{n.vibe}</span>
                      </div>
                      <div className="neighborhood-desc">{n.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SCHOOLS - only for families */}
              {hasKids && selectedCity.schools && selectedCity.schools.length > 0 && (
                <div className="dd-section">
                  <div className="dd-section-title">Top Schools in {selectedCity.city}</div>
                  <div className="neighborhoods-grid">
                    {selectedCity.schools.map((s, i) => (
                      <div key={i} className="school-card">
                        <div className="school-name">{s.name}</div>
                        <div className="school-meta">
                          <span className="school-meta-tag">{s.type}</span>
                          <span className="school-meta-tag">{s.curriculum}</span>
                          <span className="school-meta-tag">{s.grades}</span>
                        </div>
                        <div className="school-tuition">{s.tuitionUSD}</div>
                        <div className="school-note">{s.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VISA PATHWAY */}
              <div className="dd-section">
                <div className="dd-section-title">Your Visa Pathway</div>
                <div className="visa-type-badge">
                  <span className="visa-type-name">{dd.visaPathway.type}</span>
                  <span className="visa-type-time">· {dd.visaPathway.processingTime}</span>
                </div>
                <div className="visa-steps">
                  {dd.visaPathway.steps.map((s, i) => (
                    <div key={i} className="visa-step">
                      <div className="step-number">{i + 1}</div>
                      <div className="step-content">
                        <div className="step-label">{s.label}</div>
                        <div className="step-time">{s.time}</div>
                        <div className="step-detail">{s.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TAX CALCULATOR */}
              <div className="dd-section">
                <div className="dd-section-title">Tax Savings Estimate</div>
                <div className="tax-input-row">
                  <span className="tax-input-label">Your annual household income (USD)</span>
                  <input
                    className="tax-input"
                    type="text"
                    placeholder="$350,000"
                    value={taxIncome ? `$${parseCurrencyInput(taxIncome).toLocaleString()}` : ""}
                    onChange={(e) => setTaxIncome(e.target.value.replace(/[^0-9]/g, ""))}
                  />
                </div>

                {(() => {
                  const income = parseCurrencyInput(taxIncome);
                  if (!income || income < 50000) return (
                    <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                      Enter your annual household income above to see a side-by-side tax
                      comparison between {compareCity || "your current US location"} and {selectedCity.city}.
                    </div>
                  );

                  const stateCode = compareCity
                    ? liveUsCityCOL[compareCity]?.state
                    : "NY";
                  const stateName = liveStateTaxRates[stateCode]?.name || "your state";
                  const fedTax = calcFederalTax(income);
                  const stateTax = calcStateTax(income, stateCode);
                  const totalUSTax = fedTax + stateTax;
                  const usRate = ((totalUSTax / income) * 100).toFixed(1);
                  const destTax = calcDestinationTax(income, selectedCity.city);
                  const destProgram = liveDestTaxPrograms[selectedCity.city];
                  const destRate = ((destTax / income) * 100).toFixed(1);
                  const annualSavings = totalUSTax - destTax;

                  return (
                    <>
                      {destProgram && (
                        <>
                          <div className="tax-program-badge">
                            <span className="tax-program-name">{destProgram.programName}</span>
                          </div>
                          <div className="tax-program-desc">{destProgram.programDesc}</div>
                        </>
                      )}

                      <div className="tax-comparison">
                        <div className="tax-column">
                          <div className="tax-column-header">
                            Current: {compareCity || "United States"} ({stateName})
                          </div>
                          <div className="tax-line-item">
                            <span className="tax-line-label">Federal income tax</span>
                            <span className="tax-line-value">{formatCurrency(fedTax)}</span>
                          </div>
                          <div className="tax-line-item">
                            <span className="tax-line-label">{stateName} state{stateCode === "NY" ? " + NYC" : ""} tax</span>
                            <span className="tax-line-value">{formatCurrency(stateTax)}</span>
                          </div>
                          <div className="tax-line-item total">
                            <span className="tax-line-label">Total tax burden</span>
                            <span className="tax-line-value" style={{ color: "var(--red)" }}>{formatCurrency(totalUSTax)}</span>
                          </div>
                          <div className="tax-line-item">
                            <span className="tax-line-label">Effective rate</span>
                            <span className="tax-line-value">{usRate}%</span>
                          </div>
                        </div>

                        <div className="tax-vs">vs</div>

                        <div className="tax-column destination">
                          <div className="tax-column-header">
                            In {selectedCity.city}, {selectedCity.country}
                          </div>
                          <div className="tax-line-item">
                            <span className="tax-line-label">{destProgram?.programName || "Local income tax"}</span>
                            <span className="tax-line-value">{formatCurrency(destTax)}</span>
                          </div>
                          <div className="tax-line-item total">
                            <span className="tax-line-label">Total tax burden</span>
                            <span className="tax-line-value" style={{ color: "var(--green)" }}>{formatCurrency(destTax)}</span>
                          </div>
                          <div className="tax-line-item">
                            <span className="tax-line-label">Effective rate</span>
                            <span className="tax-line-value">{destRate}%</span>
                          </div>
                        </div>
                      </div>

                      {annualSavings > 0 && (
                        <div className="tax-savings-banner">
                          <div className="tax-savings-label">Estimated Annual Tax Savings</div>
                          <div className="tax-savings-amount">{formatCurrency(annualSavings)}</div>
                          <div className="tax-savings-note">per year by relocating to {selectedCity.city}</div>
                        </div>
                      )}

                      {destProgram?.caveat && (
                        <div className="tax-disclaimer">
                          ⚠ {destProgram.caveat}. This is a simplified estimate for illustration only - consult a qualified cross-border tax professional before making relocation decisions.
                        </div>
                      )}
                      {destProgram?._meta?.source && (
                        <div className="source-badge">
                          <span className="source-badge-dot" />
                          Source: {destProgram._meta.source}
                          {destProgram._meta.lastUpdated && <> · Updated {new Date(destProgram._meta.lastUpdated + 'Z').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</>}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* GLN SERVICES */}
              <div className="dd-section">
                <div className="dd-section-title">
                  What GLN Handles for Your {selectedCity.city} Move
                </div>
                <div className="gln-services-list">
                  {dd.glnServices
                    .filter((s) => {
                      if (!hasKids && s.service.toLowerCase().includes("school")) return false;
                      return true;
                    })
                    .map((s, i) => (
                    <div key={i} className="gln-service">
                      <div className="gln-check">✓</div>
                      <div className="gln-service-text">
                        <div className="gln-service-name">{s.service}</div>
                        <div className="gln-service-detail">{s.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LEAD CAPTURE */}
              <div className="lead-section">
                {!leadSubmitted ? (
                  <>
                    <div className="lead-title">
                      Make {selectedCity.city} Happen
                    </div>
                    <div className="lead-sub">
                      Tell us how to reach you and a GLN relocation advisor will
                      send your personalized {selectedCity.city} brief within 24
                      hours - with vetted housing options, visa next steps, and a
                      timeline built around your move.
                    </div>
                    <form className="lead-form" onSubmit={handleLeadSubmit}>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="Full name"
                        value={leadForm.name}
                        onChange={(e) =>
                          setLeadForm({ ...leadForm, name: e.target.value })
                        }
                        required
                      />
                      <input
                        className="form-input"
                        type="email"
                        placeholder="Email address"
                        value={leadForm.email}
                        onChange={(e) =>
                          setLeadForm({ ...leadForm, email: e.target.value })
                        }
                        required
                      />
                      <input
                        className="form-input"
                        type="tel"
                        placeholder="Phone number (optional)"
                        value={leadForm.phone}
                        onChange={(e) =>
                          setLeadForm({ ...leadForm, phone: e.target.value })
                        }
                      />
                      <button
                        className="form-submit"
                        type="submit"
                        disabled={!leadForm.name || !leadForm.email}
                      >
                        Get My Personalized {selectedCity.city} Plan
                      </button>
                      <div className="form-disclaimer">
                        No spam, no pressure. Your advisor will reach out within
                        24 hours with a custom relocation brief.
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="lead-success">
                    <div className="lead-success-icon">{selectedCity.flag}</div>
                    <div className="lead-success-title">
                      You're on your way to {selectedCity.city}!
                    </div>
                    <div className="lead-success-text">
                      A GLN relocation advisor will reach out within 24 hours
                      with your personalized {selectedCity.city} brief -
                      including vetted housing options, visa next steps,
                      {hasKids ? " school enrollment guidance," : ""} and a
                      timeline built around your {answers.timeline?.toLowerCase() || ""} move.
                    </div>
                  </div>
                )}
                <button className="restart-link" onClick={restart}>
                  ← Start over with new preferences
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}
