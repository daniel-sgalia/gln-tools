import { useState, useEffect, useRef } from "react";

// Strip diacritics for accent-insensitive matching
const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// ISO 3166-1 alpha-2 → flag emoji
const codeToFlag = (code) => String.fromCodePoint(...code.split("").map(c => 0x1F1E6 + c.charCodeAt(0) - 65));

// Complete country list — sorted alphabetically by name
const COUNTRIES = [
  "AF Afghanistan","AL Albania","DZ Algeria","AD Andorra","AO Angola","AG Antigua and Barbuda",
  "AR Argentina","AM Armenia","AU Australia","AT Austria","AZ Azerbaijan","BS Bahamas","BH Bahrain",
  "BD Bangladesh","BB Barbados","BY Belarus","BE Belgium","BZ Belize","BJ Benin","BT Bhutan",
  "BO Bolivia","BA Bosnia and Herzegovina","BW Botswana","BR Brazil","BN Brunei","BG Bulgaria",
  "BF Burkina Faso","BI Burundi","CV Cabo Verde","KH Cambodia","CM Cameroon","CA Canada",
  "CF Central African Republic","TD Chad","CL Chile","CN China","CO Colombia","KM Comoros",
  "CG Congo","CD Congo (DRC)","CR Costa Rica","CI Côte d'Ivoire","HR Croatia","CU Cuba","CY Cyprus",
  "CZ Czech Republic","DK Denmark","DJ Djibouti","DM Dominica","DO Dominican Republic","EC Ecuador",
  "EG Egypt","SV El Salvador","GQ Equatorial Guinea","ER Eritrea","EE Estonia","SZ Eswatini",
  "ET Ethiopia","FJ Fiji","FI Finland","FR France","GA Gabon","GM Gambia","GE Georgia","DE Germany",
  "GH Ghana","GR Greece","GD Grenada","GT Guatemala","GN Guinea","GW Guinea-Bissau","GY Guyana",
  "HT Haiti","HN Honduras","HU Hungary","IS Iceland","IN India","ID Indonesia","IR Iran","IQ Iraq",
  "IE Ireland","IL Israel","IT Italy","JM Jamaica","JP Japan","JO Jordan","KZ Kazakhstan","KE Kenya",
  "KI Kiribati","KP North Korea","KR South Korea","KW Kuwait","KG Kyrgyzstan","LA Laos","LV Latvia",
  "LB Lebanon","LS Lesotho","LR Liberia","LY Libya","LI Liechtenstein","LT Lithuania","LU Luxembourg",
  "MG Madagascar","MW Malawi","MY Malaysia","MV Maldives","ML Mali","MT Malta","MH Marshall Islands",
  "MR Mauritania","MU Mauritius","MX Mexico","FM Micronesia","MD Moldova","MC Monaco","MN Mongolia",
  "ME Montenegro","MA Morocco","MZ Mozambique","MM Myanmar","NA Namibia","NR Nauru","NP Nepal",
  "NL Netherlands","NZ New Zealand","NI Nicaragua","NE Niger","NG Nigeria","MK North Macedonia",
  "NO Norway","OM Oman","PK Pakistan","PW Palau","PA Panama","PG Papua New Guinea","PY Paraguay",
  "PE Peru","PH Philippines","PL Poland","PT Portugal","PR Puerto Rico","QA Qatar","RO Romania",
  "RU Russia","RW Rwanda","KN Saint Kitts and Nevis","LC Saint Lucia","VC Saint Vincent and the Grenadines",
  "WS Samoa","SM San Marino","ST São Tomé and Príncipe","SA Saudi Arabia","SN Senegal","RS Serbia",
  "SC Seychelles","SL Sierra Leone","SG Singapore","SK Slovakia","SI Slovenia","SB Solomon Islands",
  "SO Somalia","ZA South Africa","SS South Sudan","ES Spain","LK Sri Lanka","SD Sudan","SR Suriname",
  "SE Sweden","CH Switzerland","SY Syria","TW Taiwan","TJ Tajikistan","TZ Tanzania","TH Thailand",
  "TL Timor-Leste","TG Togo","TO Tonga","TT Trinidad and Tobago","TN Tunisia","TR Turkey",
  "TM Turkmenistan","TV Tuvalu","UG Uganda","UA Ukraine","AE United Arab Emirates","GB United Kingdom",
  "US United States","UY Uruguay","UZ Uzbekistan","VU Vanuatu","VA Vatican City","VE Venezuela",
  "VN Vietnam","YE Yemen","ZM Zambia","ZW Zimbabwe",
].map(s => {
  const code = s.slice(0, 2);
  const name = s.slice(3);
  return { code, name, flag: codeToFlag(code) };
});

function toKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function CitiesList({ onEditCity, showToast }) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newCity, setNewCity] = useState({ country: "", city_name: "", key: "" });
  const [creating, setCreating] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  // Filtered suggestions — accent-insensitive
  const filteredSuggestions = newCity.city_name.trim()
    ? citySuggestions.filter(c => normalize(c).includes(normalize(newCity.city_name))).slice(0, 20)
    : [];

  // Fetch city suggestions when country changes
  useEffect(() => {
    if (!newCity.country) { setCitySuggestions([]); return; }
    let cancelled = false;
    fetch("https://countriesnow.space/api/v0.1/countries/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: newCity.country }),
    })
      .then(r => r.json())
      .then(data => {
        if (!cancelled && data.data) {
          // Deduplicate by normalized form, preferring accented version
          const seen = new Map();
          for (const city of data.data) {
            const nk = normalize(city);
            const existing = seen.get(nk);
            if (!existing || (city !== existing && city.length >= existing.length && /[^\x00-\x7F]/.test(city))) seen.set(nk, city);
          }
          setCitySuggestions(Array.from(seen.values()).sort());
        }
      })
      .catch(() => { if (!cancelled) setCitySuggestions([]); });
    return () => { cancelled = true; };
  }, [newCity.country]);

  const loadCities = () => {
    fetch("/api/admin/cities", { credentials: "include" })
      .then(r => r.json())
      .then(data => { setCities(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(loadCities, []);

  const selectedCountry = COUNTRIES.find(c => c.name === newCity.country);

  const handleCreate = async () => {
    if (!newCity.city_name.trim() || !newCity.country) {
      showToast("City name and country are required", "error");
      return;
    }
    const key = newCity.key || toKey(newCity.city_name);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/cities", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          city_name: newCity.city_name.trim(),
          country: newCity.country,
          flag: selectedCountry?.flag || "🏳️",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`${newCity.city_name} created`);
        setShowAdd(false);
        setNewCity({ country: "", city_name: "", key: "" });
        onEditCity(data.id);
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to create city", "error");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (city) => {
    if (!window.confirm(`Delete "${city.city_name}, ${city.country}"?\n\nThis will permanently remove the city and all its data (schools, neighborhoods, budgets, visa info, etc.).`)) return;
    const res = await fetch(`/api/admin/cities/${city.id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      showToast(`${city.city_name} deleted`);
      loadCities();
    } else {
      showToast("Failed to delete city", "error");
    }
  };

  if (loading) return <div style={{ color: "rgba(240,235,225,0.5)" }}>Loading cities...</div>;

  return (
    <div>
      <div className="admin-header">
        <div>
          <div className="admin-title">Destination Cities</div>
          <div className="admin-subtitle">{cities.length} cities managed</div>
        </div>
        <button className="admin-btn" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "Cancel" : "+ Add City"}
        </button>
      </div>

      {showAdd && (
        <div className="admin-card" style={{ marginBottom: 20 }}>
          <h3>New City</h3>
          <div className="admin-field-row">
            <div className="admin-field">
              <label className="admin-label">Country</label>
              <select className="admin-select" value={newCity.country}
                onChange={e => setNewCity(prev => ({ ...prev, country: e.target.value }))}>
                <option value="">Select country...</option>
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>
            <div className="admin-field" style={{ position: "relative" }}>
              <label className="admin-label">City Name</label>
              <input className="admin-input" placeholder="e.g. Barcelona" autoComplete="off"
                value={newCity.city_name}
                onChange={e => { setNewCity(prev => ({ ...prev, city_name: e.target.value, key: toKey(e.target.value) })); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div ref={suggestionsRef} style={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
                  background: "#0E1C30", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6,
                  maxHeight: 200, overflowY: "auto", marginTop: 2,
                }}>
                  {filteredSuggestions.map(c => (
                    <div key={c} style={{
                      padding: "8px 12px", cursor: "pointer", fontSize: 14, color: "#F0EBE1",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(201,169,110,0.15)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      onMouseDown={() => {
                        setNewCity(prev => ({ ...prev, city_name: c, key: toKey(c) }));
                        setShowSuggestions(false);
                      }}>
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="admin-field-row">
            <div className="admin-field">
              <label className="admin-label">Key (auto-generated)</label>
              <input className="admin-input" value={newCity.key}
                onChange={e => setNewCity(prev => ({ ...prev, key: e.target.value }))}
                style={{ fontFamily: "monospace", fontSize: 13 }} />
            </div>
            <div className="admin-field" style={{ display: "flex", alignItems: "flex-end" }}>
              {selectedCountry && (
                <div style={{ fontSize: 32, marginBottom: 4 }}>{selectedCountry.flag}</div>
              )}
            </div>
          </div>
          <button className="admin-btn" onClick={handleCreate} disabled={creating} style={{ marginTop: 8 }}>
            {creating ? "Creating..." : "Create City"}
          </button>
        </div>
      )}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>City</th>
              <th>Country</th>
              <th>CoL Index</th>
              <th>Safety</th>
              <th>Source</th>
              <th>Last Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cities.map(city => (
              <tr key={city.id}>
                <td style={{ fontWeight: 500 }}>{city.flag} {city.city_name}</td>
                <td>{city.country}</td>
                <td>{city.cost_of_living_index || "—"}</td>
                <td>{city.safety_rating || "—"}</td>
                <td style={{ fontSize: 12, color: "rgba(240,235,225,0.5)" }}>{city.source || "—"}</td>
                <td style={{ fontSize: 12, color: "rgba(240,235,225,0.5)" }}>
                  {city.last_updated ? new Date(city.last_updated + 'Z').toLocaleDateString() : "—"}
                </td>
                <td style={{ display: "flex", gap: 6 }}>
                  <button className="admin-btn admin-btn-sm" onClick={() => onEditCity(city.id)}>Edit</button>
                  <button className="admin-btn-outline admin-btn-sm admin-btn-danger" onClick={() => handleDelete(city)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
