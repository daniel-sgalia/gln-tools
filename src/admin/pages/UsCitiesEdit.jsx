import { useState, useEffect } from "react";

const US_STATES = [
  "AL Alabama","AK Alaska","AZ Arizona","AR Arkansas","CA California","CO Colorado",
  "CT Connecticut","DE Delaware","FL Florida","GA Georgia","HI Hawaii","ID Idaho",
  "IL Illinois","IN Indiana","IA Iowa","KS Kansas","KY Kentucky","LA Louisiana",
  "ME Maine","MD Maryland","MA Massachusetts","MI Michigan","MN Minnesota","MS Mississippi",
  "MO Missouri","MT Montana","NE Nebraska","NV Nevada","NH New Hampshire","NJ New Jersey",
  "NM New Mexico","NY New York","NC North Carolina","ND North Dakota","OH Ohio","OK Oklahoma",
  "OR Oregon","PA Pennsylvania","RI Rhode Island","SC South Carolina","SD South Dakota",
  "TN Tennessee","TX Texas","UT Utah","VT Vermont","VA Virginia","WA Washington",
  "WV West Virginia","WI Wisconsin","WY Wyoming","DC District of Columbia","PR Puerto Rico",
].map(s => ({ code: s.slice(0, 2), name: s.slice(3) }));

export default function UsCitiesEdit({ showToast }) {
  const [cities, setCities] = useState([]);
  const [saving, setSaving] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newCity, setNewCity] = useState({ city_name: "", state_code: "" });
  const [creating, setCreating] = useState(false);

  const loadCities = () => {
    fetch("/api/admin/us-cities", { credentials: "include" })
      .then(r => r.json()).then(setCities);
  };

  useEffect(loadCities, []);

  const updateCity = (id, field, value) => {
    setCities(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const saveCity = async (city) => {
    setSaving(city.id);
    try {
      await fetch(`/api/admin/us-cities/${city.id}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(city),
      });
      showToast(`${city.city_name} updated`);
    } finally { setSaving(null); }
  };

  const handleCreate = async () => {
    if (!newCity.city_name.trim() || !newCity.state_code) {
      showToast("City name and state are required", "error");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/us-cities", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCity),
      });
      if (res.ok) {
        showToast(`${newCity.city_name}, ${newCity.state_code} added`);
        setShowAdd(false);
        setNewCity({ city_name: "", state_code: "" });
        loadCities();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to create city", "error");
      }
    } finally { setCreating(false); }
  };

  const handleDelete = async (city) => {
    if (!window.confirm(`Delete "${city.city_name}, ${city.state_code}"?\n\nThis will permanently remove this city's cost of living data.`)) return;
    const res = await fetch(`/api/admin/us-cities/${city.id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      showToast(`${city.city_name} deleted`);
      loadCities();
    } else {
      showToast("Failed to delete city", "error");
    }
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <div className="admin-title">US Cost of Living Data</div>
          <div className="admin-subtitle">{cities.length} comparison cities</div>
        </div>
        <button className="admin-btn" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "Cancel" : "+ Add City"}
        </button>
      </div>

      {showAdd && (
        <div className="admin-card" style={{ marginBottom: 20 }}>
          <h3>New US City</h3>
          <div className="admin-field-row">
            <div className="admin-field">
              <label className="admin-label">City Name</label>
              <input className="admin-input" placeholder="e.g. Denver" value={newCity.city_name}
                onChange={e => setNewCity(prev => ({ ...prev, city_name: e.target.value }))} />
            </div>
            <div className="admin-field">
              <label className="admin-label">State</label>
              <select className="admin-select" value={newCity.state_code}
                onChange={e => setNewCity(prev => ({ ...prev, state_code: e.target.value }))}>
                <option value="">Select state...</option>
                {US_STATES.map(s => (
                  <option key={s.code} value={s.code}>{s.code} — {s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button className="admin-btn" onClick={handleCreate} disabled={creating} style={{ marginTop: 8 }}>
            {creating ? "Creating..." : "Add City"}
          </button>
        </div>
      )}

      {cities.map(city => (
        <div key={city.id} className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>{city.city_name}, {city.state_code}</h3>
            <button className="admin-btn-outline admin-btn-sm admin-btn-danger" onClick={() => handleDelete(city)}>Delete</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {["housing", "school", "healthcare", "groceries", "transport", "lifestyle"].map(field => (
              <div key={field} className="admin-field">
                <label className="admin-label">{field} ($/mo)</label>
                <input className="admin-input" type="number" value={city[field] || ""}
                  onChange={e => updateCity(city.id, field, parseInt(e.target.value))} />
              </div>
            ))}
          </div>
          <div className="admin-source-row" style={{ marginTop: 8 }}>
            <div>
              <label className="admin-source-label">Source</label>
              <input className="admin-source-input" value={city.source || ""} onChange={e => updateCity(city.id, "source", e.target.value)} placeholder="e.g. Numbeo 2026" />
            </div>
            <div>
              <label className="admin-source-label">Source URL</label>
              <input className="admin-source-input" value={city.source_url || ""} onChange={e => updateCity(city.id, "source_url", e.target.value)} />
            </div>
          </div>
          <button className="admin-btn admin-btn-sm" onClick={() => saveCity(city)} disabled={saving === city.id} style={{ marginTop: 12 }}>
            {saving === city.id ? "Saving..." : "Save"}
          </button>
        </div>
      ))}
    </div>
  );
}
