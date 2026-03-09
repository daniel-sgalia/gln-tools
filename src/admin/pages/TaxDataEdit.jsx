import { useState, useEffect } from "react";
import { adminFetch } from "../api";

const KNOWN_SOURCES = {
  states: { label: "Tax Foundation", url: "https://taxfoundation.org/data/all/state/state-income-tax-rates-2025/" },
  federal_us: { label: "IRS Revenue Procedure", url: "https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments-for-tax-year-2025" },
  mexico: { label: "SAT Mexico", url: "https://www.sat.gob.mx/" },
  brazil: { label: "Receita Federal", url: "https://www.gov.br/receitafederal/" },
};

export default function TaxDataEdit({ showToast }) {
  const [stateRates, setStateRates] = useState([]);
  const [bracketSets, setBracketSets] = useState([]);
  const [bracketData, setBracketData] = useState({});
  const [saving, setSaving] = useState(null);
  const [refreshing, setRefreshing] = useState(null);
  const [tab, setTab] = useState("states");

  const loadStateRates = () => adminFetch("/api/admin/tax?action=state-rates").then(r => r.json()).then(setStateRates);

  const loadBracketSets = async () => {
    const res = await adminFetch("/api/admin/tax?action=bracket-sets");
    const sets = await res.json();
    setBracketSets(sets);
    for (const set of sets) {
      const bRes = await adminFetch(`/api/admin/tax?action=brackets&set=${set}`);
      const brackets = await bRes.json();
      setBracketData(prev => ({ ...prev, [set]: brackets }));
    }
  };

  const loadBrackets = async (set) => {
    const res = await adminFetch(`/api/admin/tax?action=brackets&set=${set}`);
    const brackets = await res.json();
    setBracketData(prev => ({ ...prev, [set]: brackets }));
  };

  useEffect(() => {
    loadStateRates();
    loadBracketSets();
  }, []);

  const refreshTab = async (tabId) => {
    setRefreshing(tabId);
    try {
      if (tabId === "states") await loadStateRates();
      else await loadBrackets(tabId);
      showToast("Data refreshed");
    } finally {
      setRefreshing(null);
    }
  };

  const saveStateRate = async (rate) => {
    setSaving(rate.id);
    try {
      await adminFetch(`/api/admin/tax?action=state-rate&id=${rate.id}`, {
        method: "PUT",
        body: JSON.stringify(rate),
      });
      showToast(`${rate.state_name} tax rate updated`);
    } finally { setSaving(null); }
  };

  const saveBrackets = async (set) => {
    const brackets = bracketData[set];
    if (!brackets) return;
    setSaving(set);
    try {
      await adminFetch(`/api/admin/tax?action=brackets&set=${set}`, {
        method: "PUT",
        body: JSON.stringify({ brackets: brackets.map(b => ({ min: b.min_income, max: b.max_income, rate: b.rate })) }),
      });
      showToast(`${set} brackets updated`);
    } finally { setSaving(null); }
  };

  const updateBracket = (set, index, field, value) => {
    setBracketData(prev => {
      const updated = [...(prev[set] || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [set]: updated };
    });
  };

  const addBracketRow = (set) => {
    setBracketData(prev => {
      const existing = prev[set] || [];
      const lastMax = existing.length > 0 ? (existing[existing.length - 1].max_income ?? 0) : 0;
      return { ...prev, [set]: [...existing, { min_income: lastMax, max_income: null, rate: 0 }] };
    });
  };

  const removeBracketRow = (set, index) => {
    setBracketData(prev => ({
      ...prev,
      [set]: prev[set].filter((_, i) => i !== index),
    }));
  };

  const formatSetName = (set) => {
    if (set === "federal_us") return "US Federal";
    return set.charAt(0).toUpperCase() + set.slice(1);
  };

  const source = tab === "states" ? KNOWN_SOURCES.states : KNOWN_SOURCES[tab];

  const allTabs = ["states", ...bracketSets];

  return (
    <div>
      <div className="admin-header">
        <div>
          <div className="admin-title">Tax Data</div>
          <div className="admin-subtitle">US state rates and international tax brackets</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {source && (
            <a href={source.url} target="_blank" rel="noopener noreferrer"
              className="admin-btn-outline admin-btn-sm"
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
              Source: {source.label} ↗
            </a>
          )}
          <button className="admin-btn-outline admin-btn-sm" onClick={() => refreshTab(tab)} disabled={!!refreshing}>
            {refreshing === tab ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        {allTabs.map(id => (
          <button key={id} className={`admin-tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
            {id === "states" ? "State Rates" : formatSetName(id)}
          </button>
        ))}
      </div>

      {tab === "states" && (
        <div className="admin-card">
          <h3>US State Tax Rates</h3>
          <table className="admin-table">
            <thead><tr><th>State</th><th>Code</th><th>Rate</th><th>Local Rate</th><th>Source</th><th></th></tr></thead>
            <tbody>
              {stateRates.map((rate, i) => (
                <tr key={rate.id}>
                  <td>{rate.state_name}</td>
                  <td>{rate.state_code}</td>
                  <td><input className="admin-input" type="number" step="0.001" value={rate.rate} style={{ width: 80 }} onChange={e => {
                    const updated = [...stateRates]; updated[i] = { ...rate, rate: parseFloat(e.target.value) }; setStateRates(updated);
                  }} /></td>
                  <td><input className="admin-input" type="number" step="0.001" value={rate.local_rate} style={{ width: 80 }} onChange={e => {
                    const updated = [...stateRates]; updated[i] = { ...rate, local_rate: parseFloat(e.target.value) }; setStateRates(updated);
                  }} /></td>
                  <td><input className="admin-source-input" value={rate.source || ""} style={{ width: 120 }} onChange={e => {
                    const updated = [...stateRates]; updated[i] = { ...rate, source: e.target.value }; setStateRates(updated);
                  }} /></td>
                  <td><button className="admin-btn admin-btn-sm" onClick={() => saveStateRate(rate)} disabled={saving === rate.id}>Save</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab !== "states" && bracketData[tab] && (
        <div className="admin-card">
          <h3>{formatSetName(tab)} Tax Brackets</h3>
          <table className="admin-table">
            <thead><tr><th>Min Income</th><th>Max Income</th><th>Rate</th><th></th></tr></thead>
            <tbody>
              {bracketData[tab].map((b, i) => (
                <tr key={b.id || i}>
                  <td><input className="admin-input" type="number" value={b.min_income} onChange={e =>
                    updateBracket(tab, i, "min_income", parseFloat(e.target.value))
                  } /></td>
                  <td><input className="admin-input" type="number" value={b.max_income ?? ""} placeholder="∞" onChange={e =>
                    updateBracket(tab, i, "max_income", e.target.value ? parseFloat(e.target.value) : null)
                  } /></td>
                  <td><input className="admin-input" type="number" step="0.001" value={b.rate} onChange={e =>
                    updateBracket(tab, i, "rate", parseFloat(e.target.value))
                  } /></td>
                  <td><button className="admin-btn-outline admin-btn-sm admin-btn-danger" onClick={() => removeBracketRow(tab, i)}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="admin-btn" onClick={() => saveBrackets(tab)} disabled={saving === tab}>
              {saving === tab ? "Saving..." : "Save Brackets"}
            </button>
            <button className="admin-btn-outline" onClick={() => addBracketRow(tab)}>+ Add Row</button>
          </div>
        </div>
      )}
    </div>
  );
}
