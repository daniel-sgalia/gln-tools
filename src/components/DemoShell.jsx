import { useState } from "react";
import AdminApp from "../admin/AdminApp";

const style = `
.demo-gear-btn {
  position: fixed;
  top: 46px;
  right: 20px;
  z-index: 10000;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(14, 28, 48, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(201, 169, 110, 0.25);
  color: #C9A96E;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  padding: 0;
}
.demo-gear-btn:hover {
  border-color: rgba(201, 169, 110, 0.6);
  transform: scale(1.08);
  background: rgba(14, 28, 48, 0.95);
}
.demo-gear-btn:hover .demo-gear-icon {
  transform: rotate(45deg);
}
.demo-gear-btn.active {
  background: rgba(201, 169, 110, 0.15);
  border-color: rgba(201, 169, 110, 0.5);
}
.demo-gear-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}
.demo-mode-badge {
  position: fixed;
  top: 52px;
  right: 68px;
  z-index: 10000;
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #C9A96E;
  opacity: 0;
  transform: translateX(8px);
  transition: all 0.3s ease;
  pointer-events: none;
}
.demo-mode-badge.visible {
  opacity: 1;
  transform: translateX(0);
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
`;

export default function DemoShell({ children }) {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <>
      <style>{style}</style>

      <span className={`demo-mode-badge ${showAdmin ? "visible" : ""}`}>
        ADMIN
      </span>

      <button
        className={`demo-gear-btn ${showAdmin ? "active" : ""}`}
        onClick={() => setShowAdmin(!showAdmin)}
        title={showAdmin ? "Back to tool" : "Open admin"}
      >
        <svg className="demo-gear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <div className="demo-topbar">
        <span className="demo-topbar-label">DEMO MODE</span>
        <span className="demo-topbar-text">&mdash; Want to whitelabel this tool?</span>
        <a href="https://book.alignedops.io/30-minute-meeting" target="_blank" rel="noopener noreferrer" className="demo-topbar-cta">Book a call</a>
        <span className="demo-topbar-sep">|</span>
        <a href="mailto:hello@alignedops.io" className="demo-topbar-cta">hello@alignedops.io</a>
      </div>

      <div style={{ display: showAdmin ? "none" : "block" }}>
        {children}
      </div>
      <div style={{ display: showAdmin ? "block" : "none" }}>
        <AdminApp demoMode onBack={() => setShowAdmin(false)} />
      </div>
    </>
  );
}
