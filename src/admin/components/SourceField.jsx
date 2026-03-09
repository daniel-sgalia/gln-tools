export default function SourceField({ source, sourceUrl, onSourceChange, onUrlChange }) {
  return (
    <div className="admin-source-row">
      <div>
        <label className="admin-source-label">Source Attribution</label>
        <input className="admin-source-input" value={source || ""} onChange={e => onSourceChange(e.target.value)} placeholder="e.g. Numbeo 2026, GLN Research" />
      </div>
      <div>
        <label className="admin-source-label">Source URL</label>
        <input className="admin-source-input" value={sourceUrl || ""} onChange={e => onUrlChange(e.target.value)} placeholder="https://..." />
      </div>
    </div>
  );
}
