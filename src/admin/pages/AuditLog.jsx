import { useState, useEffect } from "react";
import { adminFetch } from "../api";

export default function AuditLog() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [tableFilter, setTableFilter] = useState("");
  const PAGE_SIZE = 25;

  const loadEntries = () => {
    const params = new URLSearchParams({ limit: PAGE_SIZE, offset: page * PAGE_SIZE });
    if (tableFilter) params.set("table", tableFilter);
    adminFetch(`/api/admin/audit?${params}`)
      .then(r => r.json())
      .then(data => { setEntries(data.rows); setTotal(data.total); });
  };

  useEffect(loadEntries, [page, tableFilter]);

  const tables = [...new Set(entries.map(e => e.table_name))].sort();

  return (
    <div>
      <div className="admin-header">
        <div>
          <div className="admin-title">Audit Log</div>
          <div className="admin-subtitle">{total} total changes recorded</div>
        </div>
      </div>

      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <select className="admin-select" style={{ width: 200 }} value={tableFilter} onChange={e => { setTableFilter(e.target.value); setPage(0); }}>
          <option value="">All tables</option>
          {["cities", "city_scores", "schools", "neighborhoods", "budget_breakdowns", "destination_col", "destination_tax_programs", "state_tax_rates", "tax_brackets", "us_cities"].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Table</th><th>Record</th><th>Field</th><th>Old Value</th><th>New Value</th></tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr key={entry.id}>
                <td style={{ fontSize: 12, color: "rgba(240,235,225,0.5)", whiteSpace: "nowrap" }}>
                  {new Date(entry.timestamp + 'Z').toLocaleString()}
                </td>
                <td style={{ fontSize: 13 }}>{entry.user_email || "—"}</td>
                <td><span style={{ color: entry.action === "create" ? "#4CAF82" : entry.action === "delete" ? "#E05C5C" : "#C9A96E" }}>{entry.action}</span></td>
                <td style={{ fontSize: 12 }}>{entry.table_name}</td>
                <td>{entry.record_label || `#${entry.record_id}`}</td>
                <td style={{ fontSize: 12, color: "rgba(240,235,225,0.6)" }}>{entry.field_name || "—"}</td>
                <td style={{ fontSize: 12, color: "rgba(240,235,225,0.4)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {entry.old_value ? JSON.parse(entry.old_value) : "—"}
                </td>
                <td style={{ fontSize: 12, color: "#C9A96E", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {entry.new_value ? JSON.parse(entry.new_value) : "—"}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: "center", color: "rgba(240,235,225,0.3)", padding: 40 }}>No audit entries found</td></tr>
            )}
          </tbody>
        </table>

        {total > PAGE_SIZE && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
            <button className="admin-btn-outline admin-btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
            <span style={{ fontSize: 13, color: "rgba(240,235,225,0.5)", alignSelf: "center" }}>
              Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}
            </span>
            <button className="admin-btn-outline admin-btn-sm" disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
