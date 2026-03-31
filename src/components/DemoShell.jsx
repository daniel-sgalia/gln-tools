import { useState } from "react";
import AdminApp from "../admin/AdminApp";

const style = `
.demo-cog-cta {
  position: fixed;
  top: 46px;
  right: 20px;
  z-index: 10000;
  pointer-events: auto;
  white-space: nowrap;
}
.demo-cog-cta a {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #C9A96E;
  border: 1px solid rgba(201,169,110,0.35);
  border-radius: 8px;
  padding: 8px 16px;
  background: rgba(201,169,110,0.06);
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}
.demo-cog-cta a:hover {
  border-color: rgba(201,169,110,0.6);
  background: rgba(201,169,110,0.12);
  color: #E8C98A;
}
.demo-cog-cta svg {
  width: 18px;
  height: 18px;
}
.demo-topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10001;
  background: #C8FF3E;
  padding: 8px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: 'Outfit', sans-serif;
}
.demo-topbar-label {
  font-family: 'Sora', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #0C0C0E;
  letter-spacing: 1.5px;
}
.demo-topbar-text {
  font-size: 12px;
  color: rgba(12,12,14,0.6);
}
.demo-topbar-sep {
  font-size: 12px;
  color: rgba(12,12,14,0.3);
  margin: 0 4px;
}
.demo-topbar-cta {
  font-size: 12px;
  color: #0C0C0E;
  text-decoration: none;
  font-weight: 600;
}
.demo-topbar-cta:hover { text-decoration: underline; }
.demo-topbar-cta-btn {
  font-size: 11px;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  color: #C8FF3E;
  background: #0C0C0E;
  text-decoration: none;
  padding: 4px 14px;
  border-radius: 4px;
  letter-spacing: 0.3px;
}
.demo-topbar-cta-btn:hover { background: #1a1a1e; }
`;

export default function DemoShell({ children }) {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <>
      <style>{style}</style>

      {!showAdmin && (
        <div className="demo-cog-cta">
          <a onClick={() => setShowAdmin(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Demo Admin Portal
          </a>
        </div>
      )}

      {showAdmin && (
        <div className="demo-cog-cta">
          <a onClick={() => setShowAdmin(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Tool
          </a>
        </div>
      )}

      <div className="demo-topbar" style={{ position: 'fixed' }}>
        <span className="demo-topbar-text">Is your intake process costing you leads?</span>
        <a href="https://book.alignedops.io/30-minute-meeting" target="_blank" rel="noopener noreferrer" className="demo-topbar-cta-btn">Book a call</a>
        <span className="demo-topbar-sep">|</span>
        <a href="mailto:hello@alignedops.io" className="demo-topbar-cta">hello@alignedops.io</a>
        <span className="demo-topbar-label" style={{ position: 'absolute', left: 24 }}>DEMO MODE</span>
      </div>

      <div style={{ display: showAdmin ? "none" : "block", paddingTop: 36 }}>
        {children}
      </div>
      <div style={{ display: showAdmin ? "block" : "none", paddingTop: 36 }}>
        <AdminApp demoMode onBack={() => setShowAdmin(false)} />
      </div>
    </>
  );
}
