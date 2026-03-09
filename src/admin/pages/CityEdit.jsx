import { useState, useEffect } from "react";
import SourceField from "../components/SourceField";

const TABS = ["General", "Scores", "Schools", "Deep Dive", "Cost of Living", "Tax Program"];

export default function CityEdit({ cityId, onBack, showToast }) {
  const [city, setCity] = useState(null);
  const [tab, setTab] = useState("General");
  const [saving, setSaving] = useState(false);
  const [bracketSets, setBracketSets] = useState([]);

  const loadCity = () => {
    fetch(`/api/admin/cities/${cityId}`, { credentials: "include" })
      .then(r => r.json())
      .then(setCity);
  };

  useEffect(loadCity, [cityId]);

  useEffect(() => {
    fetch("/api/admin/tax/bracket-sets", { credentials: "include" })
      .then(r => r.json())
      .then(setBracketSets)
      .catch(() => {});
  }, []);

  if (!city) return <div style={{ color: "rgba(240,235,225,0.5)" }}>Loading...</div>;

  const saveGeneral = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/cities/${cityId}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(city),
      });
      if (res.ok) { showToast("City updated"); loadCity(); }
    } finally { setSaving(false); }
  };

  const saveScores = async () => {
    setSaving(true);
    const scores = {};
    city.scores.forEach(s => { scores[s.dimension] = parseInt(s.score); });
    try {
      const res = await fetch(`/api/admin/cities/${cityId}/scores`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores, source: city.source }),
      });
      if (res.ok) showToast("Scores updated");
    } finally { setSaving(false); }
  };

  const saveSchool = async (school) => {
    const method = school.id ? "PUT" : "POST";
    const url = school.id ? `/api/admin/cities/schools/${school.id}` : `/api/admin/cities/${cityId}/schools`;
    await fetch(url, {
      method, credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(school),
    });
    showToast("School saved");
    loadCity();
  };

  const deleteSchool = async (schoolId) => {
    await fetch(`/api/admin/cities/schools/${schoolId}`, { method: "DELETE", credentials: "include" });
    showToast("School removed");
    loadCity();
  };

  const saveBudget = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/cities/${cityId}/budget`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: city.budgetBreakdowns.map(b => ({
            category: b.category, amount: b.amount, note: b.note, familyOnly: !!b.family_only,
          })),
          totalRange: city.budgetTotal?.total_range || "",
          source: city.source,
        }),
      });
      showToast("Budget updated");
    } finally { setSaving(false); }
  };

  const saveCol = async () => {
    if (!city.destinationCol) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/cities/${cityId}/col`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(city.destinationCol),
      });
      showToast("Cost of living updated");
    } finally { setSaving(false); }
  };

  const saveTaxProgram = async () => {
    if (!city.taxProgram) return;
    setSaving(true);
    try {
      const tp = city.taxProgram;
      await fetch(`/api/admin/cities/${cityId}/tax-program`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programName: tp.program_name, programDesc: tp.program_desc,
          effectiveRate: tp.effective_rate, method: tp.method,
          bracketsRef: tp.brackets_ref, caveat: tp.caveat, source: tp.source,
        }),
      });
      showToast("Tax program updated");
    } finally { setSaving(false); }
  };

  const updateField = (field, value) => setCity(prev => ({ ...prev, [field]: value }));
  const updateScore = (dimension, value) => {
    setCity(prev => ({
      ...prev,
      scores: prev.scores.map(s => s.dimension === dimension ? { ...s, score: value } : s),
    }));
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <button className="admin-btn-outline admin-btn-sm" onClick={onBack} style={{ marginBottom: 8 }}>← Back to cities</button>
          <div className="admin-title">{city.flag} {city.city_name}, {city.country}</div>
          <div className="admin-subtitle">
            Last updated: {city.last_updated ? new Date(city.last_updated + 'Z').toLocaleString() : "never"}
            {city.source && <> · Source: {city.source}</>}
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        {TABS.map(t => (
          <button key={t} className={`admin-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* GENERAL TAB */}
      {tab === "General" && (
        <div className="admin-card">
          <h3>General Information</h3>
          <div className="admin-field-row">
            <div className="admin-field">
              <label className="admin-label">City Name</label>
              <input className="admin-input" value={city.city_name} onChange={e => updateField("city_name", e.target.value)} />
            </div>
            <div className="admin-field">
              <label className="admin-label">Country</label>
              <input className="admin-input" value={city.country} onChange={e => updateField("country", e.target.value)} />
            </div>
          </div>
          <div className="admin-field-row">
            <div className="admin-field">
              <label className="admin-label">Flag Emoji</label>
              <input className="admin-input" value={city.flag} onChange={e => updateField("flag", e.target.value)} />
            </div>
            <div className="admin-field">
              <label className="admin-label">Cost of Living Index</label>
              <input className="admin-input" type="number" value={city.cost_of_living_index || ""} onChange={e => updateField("cost_of_living_index", parseInt(e.target.value))} />
            </div>
          </div>
          <div className="admin-field-row">
            <div className="admin-field">
              <label className="admin-label">Safety Rating</label>
              <select className="admin-select" value={city.safety_rating || ""} onChange={e => updateField("safety_rating", e.target.value)}>
                <option value="Very High">Very High</option><option value="High">High</option>
                <option value="Moderate">Moderate</option><option value="Low">Low</option>
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Healthcare Quality</label>
              <select className="admin-select" value={city.healthcare_quality || ""} onChange={e => updateField("healthcare_quality", e.target.value)}>
                <option value="Excellent">Excellent</option><option value="Very Good">Very Good</option>
                <option value="Good">Good</option><option value="Adequate">Adequate</option>
              </select>
            </div>
          </div>
          <div className="admin-field-row">
            <div className="admin-field">
              <label className="admin-label">Internet Reliability</label>
              <select className="admin-select" value={city.internet_reliability || ""} onChange={e => updateField("internet_reliability", e.target.value)}>
                <option value="Excellent">Excellent</option><option value="Very Good">Very Good</option>
                <option value="Good">Good</option><option value="Unreliable">Unreliable</option>
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Expat Community</label>
              <select className="admin-select" value={city.expat_community || ""} onChange={e => updateField("expat_community", e.target.value)}>
                <option value="Large & established">Large & established</option>
                <option value="Growing">Growing</option>
                <option value="Small but active">Small but active</option>
                <option value="Minimal">Minimal</option>
              </select>
            </div>
          </div>
          <div className="admin-field">
            <label className="admin-label">Climate Description</label>
            <input className="admin-input" value={city.climate_description || ""} onChange={e => updateField("climate_description", e.target.value)} />
          </div>
          <div className="admin-field">
            <label className="admin-label">Caveat</label>
            <textarea className="admin-input" rows={3} value={city.caveat || ""} onChange={e => updateField("caveat", e.target.value)} style={{ resize: "vertical" }} />
          </div>
          <SourceField source={city.source} sourceUrl={city.source_url}
            onSourceChange={v => updateField("source", v)} onUrlChange={v => updateField("source_url", v)} />
          <div style={{ marginTop: 20 }}>
            <button className="admin-btn" onClick={saveGeneral} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </div>
      )}

      {/* SCORES TAB */}
      {tab === "Scores" && (
        <div className="admin-card">
          <h3>Scoring Dimensions (0–10)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {city.scores?.map(s => (
              <div key={s.dimension} className="admin-field" style={{ marginBottom: 8 }}>
                <label className="admin-label">{s.dimension}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input className="admin-range" type="range" min="0" max="10" value={s.score}
                    onChange={e => updateScore(s.dimension, parseInt(e.target.value))}
                    style={{ flex: 1, background: `linear-gradient(to right, #C9A96E 0%, #C9A96E ${s.score * 10}%, #162540 ${s.score * 10}%, #162540 100%)` }} />
                  <span style={{ minWidth: 28, textAlign: "center", color: "#C9A96E", fontWeight: 600 }}>{s.score}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20 }}>
            <button className="admin-btn" onClick={saveScores} disabled={saving}>{saving ? "Saving..." : "Save Scores"}</button>
          </div>
        </div>
      )}

      {/* SCHOOLS TAB */}
      {tab === "Schools" && (
        <div className="admin-card">
          <h3>International Schools</h3>
          {city.schools?.map((school, i) => (
            <div key={school.id} style={{ padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 8, marginBottom: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="admin-field-row">
                <div className="admin-field">
                  <label className="admin-label">School Name</label>
                  <input className="admin-input" value={school.name} onChange={e => {
                    const updated = [...city.schools]; updated[i] = { ...school, name: e.target.value }; setCity(prev => ({ ...prev, schools: updated }));
                  }} />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Type</label>
                  <input className="admin-input" value={school.type} onChange={e => {
                    const updated = [...city.schools]; updated[i] = { ...school, type: e.target.value }; setCity(prev => ({ ...prev, schools: updated }));
                  }} />
                </div>
              </div>
              <div className="admin-field-row">
                <div className="admin-field">
                  <label className="admin-label">Curriculum</label>
                  <input className="admin-input" value={school.curriculum} onChange={e => {
                    const updated = [...city.schools]; updated[i] = { ...school, curriculum: e.target.value }; setCity(prev => ({ ...prev, schools: updated }));
                  }} />
                </div>
                <div className="admin-field">
                  <label className="admin-label">Tuition (USD)</label>
                  <input className="admin-input" value={school.tuition_usd} onChange={e => {
                    const updated = [...city.schools]; updated[i] = { ...school, tuition_usd: e.target.value }; setCity(prev => ({ ...prev, schools: updated }));
                  }} />
                </div>
              </div>
              <div className="admin-field">
                <label className="admin-label">Grades</label>
                <input className="admin-input" value={school.grades} onChange={e => {
                  const updated = [...city.schools]; updated[i] = { ...school, grades: e.target.value }; setCity(prev => ({ ...prev, schools: updated }));
                }} />
              </div>
              <div className="admin-field">
                <label className="admin-label">Note</label>
                <textarea className="admin-input" rows={2} value={school.note || ""} onChange={e => {
                  const updated = [...city.schools]; updated[i] = { ...school, note: e.target.value }; setCity(prev => ({ ...prev, schools: updated }));
                }} style={{ resize: "vertical" }} />
              </div>
              <SourceField source={school.source} sourceUrl={school.source_url}
                onSourceChange={v => { const updated = [...city.schools]; updated[i] = { ...school, source: v }; setCity(prev => ({ ...prev, schools: updated })); }}
                onUrlChange={v => { const updated = [...city.schools]; updated[i] = { ...school, source_url: v }; setCity(prev => ({ ...prev, schools: updated })); }} />
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="admin-btn admin-btn-sm" onClick={() => saveSchool(school)}>Save</button>
                <button className="admin-btn-outline admin-btn-sm admin-btn-danger" onClick={() => deleteSchool(school.id)}>Remove</button>
              </div>
            </div>
          ))}
          <button className="admin-btn-outline" style={{ marginTop: 12 }} onClick={() => {
            setCity(prev => ({ ...prev, schools: [...(prev.schools || []), { name: "", type: "", curriculum: "", grades: "", tuition_usd: "", note: "", source: "", source_url: "" }] }));
          }}>+ Add School</button>
        </div>
      )}

      {/* DEEP DIVE TAB */}
      {tab === "Deep Dive" && (
        <>
          <div className="admin-card">
            <h3>Monthly Budget Breakdown</h3>
            {city.budgetBreakdowns?.map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 8, marginBottom: 8, alignItems: "end" }}>
                <div>
                  {i === 0 && <label className="admin-label">Category</label>}
                  <input className="admin-input" value={item.category} onChange={e => {
                    const updated = [...city.budgetBreakdowns]; updated[i] = { ...item, category: e.target.value }; setCity(prev => ({ ...prev, budgetBreakdowns: updated }));
                  }} />
                </div>
                <div>
                  {i === 0 && <label className="admin-label">Amount</label>}
                  <input className="admin-input" value={item.amount} onChange={e => {
                    const updated = [...city.budgetBreakdowns]; updated[i] = { ...item, amount: e.target.value }; setCity(prev => ({ ...prev, budgetBreakdowns: updated }));
                  }} />
                </div>
                <div>
                  {i === 0 && <label className="admin-label">Note</label>}
                  <input className="admin-input" value={item.note || ""} onChange={e => {
                    const updated = [...city.budgetBreakdowns]; updated[i] = { ...item, note: e.target.value }; setCity(prev => ({ ...prev, budgetBreakdowns: updated }));
                  }} />
                </div>
              </div>
            ))}
            <div className="admin-field" style={{ marginTop: 12 }}>
              <label className="admin-label">Total Range</label>
              <input className="admin-input" value={city.budgetTotal?.total_range || ""} onChange={e => setCity(prev => ({ ...prev, budgetTotal: { ...prev.budgetTotal, total_range: e.target.value } }))} />
            </div>
            <button className="admin-btn" onClick={saveBudget} disabled={saving} style={{ marginTop: 12 }}>{saving ? "Saving..." : "Save Budget"}</button>
          </div>

          <div className="admin-card">
            <h3>Neighborhoods</h3>
            {city.neighborhoods?.map((nh, i) => (
              <div key={nh.id || i} style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 8, marginBottom: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="admin-field-row">
                  <div className="admin-field">
                    <label className="admin-label">Name</label>
                    <input className="admin-input" value={nh.name} onChange={e => {
                      const updated = [...city.neighborhoods]; updated[i] = { ...nh, name: e.target.value }; setCity(prev => ({ ...prev, neighborhoods: updated }));
                    }} />
                  </div>
                  <div className="admin-field">
                    <label className="admin-label">Vibe</label>
                    <input className="admin-input" value={nh.vibe} onChange={e => {
                      const updated = [...city.neighborhoods]; updated[i] = { ...nh, vibe: e.target.value }; setCity(prev => ({ ...prev, neighborhoods: updated }));
                    }} />
                  </div>
                </div>
                <div className="admin-field">
                  <label className="admin-label">Description</label>
                  <textarea className="admin-input" rows={2} value={nh.description} onChange={e => {
                    const updated = [...city.neighborhoods]; updated[i] = { ...nh, description: e.target.value }; setCity(prev => ({ ...prev, neighborhoods: updated }));
                  }} style={{ resize: "vertical" }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* COST OF LIVING TAB */}
      {tab === "Cost of Living" && city.destinationCol && (
        <div className="admin-card">
          <h3>Destination Cost of Living (monthly, USD)</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {["housing", "school", "healthcare", "groceries", "transport", "lifestyle"].map(field => (
              <div key={field} className="admin-field">
                <label className="admin-label">{field}</label>
                <input className="admin-input" type="number" value={city.destinationCol[field] || ""} onChange={e => {
                  setCity(prev => ({ ...prev, destinationCol: { ...prev.destinationCol, [field]: parseInt(e.target.value) } }));
                }} />
              </div>
            ))}
          </div>
          <SourceField source={city.destinationCol.source} sourceUrl={city.destinationCol.source_url}
            onSourceChange={v => setCity(prev => ({ ...prev, destinationCol: { ...prev.destinationCol, source: v } }))}
            onUrlChange={v => setCity(prev => ({ ...prev, destinationCol: { ...prev.destinationCol, source_url: v } }))} />
          <button className="admin-btn" onClick={saveCol} disabled={saving} style={{ marginTop: 16 }}>{saving ? "Saving..." : "Save Cost of Living"}</button>
        </div>
      )}

      {/* TAX PROGRAM TAB */}
      {tab === "Tax Program" && city.taxProgram && (
        <div className="admin-card">
          <h3>Destination Tax Program</h3>
          <div className="admin-field-row">
            <div className="admin-field">
              <label className="admin-label">Program Name</label>
              <input className="admin-input" value={city.taxProgram.program_name || ""} onChange={e =>
                setCity(prev => ({ ...prev, taxProgram: { ...prev.taxProgram, program_name: e.target.value } }))} />
            </div>
            <div className="admin-field">
              <label className="admin-label">Method</label>
              <select className="admin-select" value={city.taxProgram.method || ""} onChange={e =>
                setCity(prev => ({ ...prev, taxProgram: { ...prev.taxProgram, method: e.target.value } }))}>
                <option value="flat">Flat Rate</option>
                <option value="territorial">Territorial</option>
                <option value="progressive">Progressive</option>
              </select>
            </div>
          </div>
          <div className="admin-field">
            <label className="admin-label">Program Description</label>
            <input className="admin-input" value={city.taxProgram.program_desc || ""} onChange={e =>
              setCity(prev => ({ ...prev, taxProgram: { ...prev.taxProgram, program_desc: e.target.value } }))} />
          </div>
          {city.taxProgram.method === "progressive" ? (
            <div className="admin-field-row">
              <div className="admin-field">
                <label className="admin-label">Effective Rate (decimal, e.g. 0.04)</label>
                <input className="admin-input" type="number" step="0.001" value={city.taxProgram.effective_rate ?? ""} onChange={e =>
                  setCity(prev => ({ ...prev, taxProgram: { ...prev.taxProgram, effective_rate: e.target.value ? parseFloat(e.target.value) : null } }))} />
              </div>
              <div className="admin-field">
                <label className="admin-label">Bracket Set</label>
                <input className="admin-input" list="bracket-sets-list"
                  placeholder="e.g. spain, colombia (or pick existing)"
                  value={city.taxProgram.brackets_ref || ""}
                  onChange={e => setCity(prev => ({ ...prev, taxProgram: { ...prev.taxProgram, brackets_ref: e.target.value || null } }))} />
                <datalist id="bracket-sets-list">
                  {bracketSets.filter(s => s !== "federal_us").map(s => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <div style={{ fontSize: 11, color: "rgba(240,235,225,0.4)", marginTop: 4 }}>
                  Pick an existing set or type a new name. New sets appear on Tax Data page after saving brackets there.
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-field">
              <label className="admin-label">Effective Rate (decimal, e.g. 0.04)</label>
              <input className="admin-input" type="number" step="0.001" value={city.taxProgram.effective_rate ?? ""} onChange={e =>
                setCity(prev => ({ ...prev, taxProgram: { ...prev.taxProgram, effective_rate: e.target.value ? parseFloat(e.target.value) : null } }))} />
            </div>
          )}
          <div className="admin-field">
            <label className="admin-label">Caveat</label>
            <textarea className="admin-input" rows={3} value={city.taxProgram.caveat || ""} onChange={e =>
              setCity(prev => ({ ...prev, taxProgram: { ...prev.taxProgram, caveat: e.target.value } }))} style={{ resize: "vertical" }} />
          </div>
          <SourceField source={city.taxProgram.source} sourceUrl={city.taxProgram.source_url}
            onSourceChange={v => setCity(prev => ({ ...prev, taxProgram: { ...prev.taxProgram, source: v } }))}
            onUrlChange={v => setCity(prev => ({ ...prev, taxProgram: { ...prev.taxProgram, source_url: v } }))} />
          <button className="admin-btn" onClick={saveTaxProgram} disabled={saving} style={{ marginTop: 16 }}>{saving ? "Saving..." : "Save Tax Program"}</button>
        </div>
      )}
    </div>
  );
}
