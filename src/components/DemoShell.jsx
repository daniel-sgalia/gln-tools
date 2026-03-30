import { useState } from "react";
import AdminApp from "../admin/AdminApp";

const style = `
.demo-gear-btn {
  position: fixed;
  top: 20px;
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
  top: 26px;
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
.demo-note {
  position: fixed;
  top: 68px;
  right: 16px;
  z-index: 10000;
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  color: rgba(240,235,225,0.7);
  text-align: right;
  max-width: 150px;
  line-height: 1.5;
  pointer-events: none;
  background: rgba(14, 28, 48, 0.8);
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.08);
}
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

      <div className="demo-note">
        Demo only. In production, admin is behind a separate login.
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
