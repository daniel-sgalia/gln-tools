import { useState, useEffect } from "react";

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/data/all").then(r => r.json()).then(data => {
      setStats({
        cities: Object.keys(data.cities).length,
        usCities: Object.keys(data.usCityCOL).length,
        taxPrograms: Object.keys(data.destinationTaxPrograms).length,
      });
    });
  }, []);

  return (
    <div>
      <div className="admin-header">
        <div>
          <div className="admin-title">Dashboard</div>
          <div className="admin-subtitle">Overview of managed data</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Destination Cities", value: stats?.cities || "—", page: "cities", icon: "🌍" },
          { label: "US Comparison Cities", value: stats?.usCities || "—", page: "us-cities", icon: "🇺🇸" },
          { label: "Tax Programs", value: stats?.taxPrograms || "—", page: "tax", icon: "💰" },
        ].map(card => (
          <div key={card.label} className="admin-card" style={{ cursor: "pointer" }} onClick={() => onNavigate(card.page)}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#C9A96E" }}>{card.value}</div>
            <div style={{ fontSize: 14, color: "rgba(240,235,225,0.5)", marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
