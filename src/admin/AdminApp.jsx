import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { adminFetch } from "./api";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./pages/Dashboard";
import CitiesList from "./pages/CitiesList";
import CityEdit from "./pages/CityEdit";
import UsCitiesEdit from "./pages/UsCitiesEdit";
import TaxDataEdit from "./pages/TaxDataEdit";
import AuditLog from "./pages/AuditLog";

const style = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
.admin-app { font-family: 'Outfit', sans-serif; background: #07101F; color: #F0EBE1; min-height: 100vh; display: flex; }
.admin-sidebar { width: 220px; background: #0E1C30; border-right: 1px solid rgba(255,255,255,0.08); padding: 24px 0; flex-shrink: 0; position: fixed; top: 0; left: 0; bottom: 0; display: flex; flex-direction: column; }
.admin-sidebar-logo { padding: 0 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 16px; font-size: 18px; font-weight: 600; color: #C9A96E; letter-spacing: 0.5px; }
.admin-sidebar-nav { display: flex; flex-direction: column; gap: 2px; padding: 0 8px; flex: 1; }
.admin-nav-item { padding: 10px 12px; border-radius: 8px; cursor: pointer; color: rgba(240,235,225,0.6); font-size: 14px; font-weight: 400; transition: all 0.15s; display: flex; align-items: center; gap: 10px; }
.admin-nav-item:hover { background: rgba(255,255,255,0.04); color: #F0EBE1; }
.admin-nav-item.active { background: rgba(201,169,110,0.12); color: #C9A96E; font-weight: 500; }
.admin-nav-icon { font-size: 16px; width: 20px; text-align: center; }
.admin-sidebar-footer { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.08); }
.admin-user-info { font-size: 12px; color: rgba(240,235,225,0.45); margin-bottom: 8px; }
.admin-logout-btn { background: none; border: 1px solid rgba(255,255,255,0.1); color: rgba(240,235,225,0.6); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-family: inherit; width: 100%; }
.admin-logout-btn:hover { border-color: rgba(255,255,255,0.2); color: #F0EBE1; }
.admin-main { margin-left: 220px; flex: 1; padding: 32px; min-height: 100vh; }
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.admin-title { font-size: 24px; font-weight: 600; color: #F0EBE1; }
.admin-subtitle { font-size: 14px; color: rgba(240,235,225,0.45); margin-top: 4px; }

/* Shared admin components */
.admin-card { background: #0E1C30; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; margin-bottom: 20px; }
.admin-card h3 { font-size: 16px; font-weight: 600; color: #C9A96E; margin-bottom: 16px; }
.admin-table { width: 100%; border-collapse: collapse; }
.admin-table th { text-align: left; padding: 10px 12px; font-size: 12px; font-weight: 500; color: rgba(240,235,225,0.45); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.admin-table td { padding: 12px; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.04); color: #F0EBE1; }
.admin-table tr:hover td { background: rgba(255,255,255,0.02); }
.admin-btn { background: linear-gradient(135deg, #C9A96E, #E8C98A); color: #07101F; border: none; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity 0.15s; }
.admin-btn:hover { opacity: 0.9; }
.admin-btn-outline { background: none; border: 1px solid rgba(201,169,110,0.3); color: #C9A96E; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; }
.admin-btn-outline:hover { border-color: #C9A96E; background: rgba(201,169,110,0.08); }
.admin-btn-sm { padding: 5px 10px; font-size: 12px; }
.admin-btn-danger { background: rgba(224,92,92,0.15); border: 1px solid rgba(224,92,92,0.3); color: #E05C5C; }
.admin-btn-danger:hover { background: rgba(224,92,92,0.25); }
.admin-input { background: #162540; border: 1px solid rgba(255,255,255,0.1); color: #F0EBE1; padding: 8px 12px; border-radius: 8px; font-size: 14px; font-family: inherit; width: 100%; }
.admin-input:focus { outline: none; border-color: rgba(201,169,110,0.4); }
.admin-input::placeholder { color: rgba(240,235,225,0.25); }
.admin-select { background: #162540; border: 1px solid rgba(255,255,255,0.1); color: #F0EBE1; padding: 8px 12px; border-radius: 8px; font-size: 14px; font-family: inherit; width: 100%; }
.admin-label { font-size: 12px; font-weight: 500; color: rgba(240,235,225,0.6); margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.5px; }
.admin-field { margin-bottom: 16px; }
.admin-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.admin-source-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px; padding: 8px 12px; background: rgba(201,169,110,0.06); border-radius: 6px; border: 1px solid rgba(201,169,110,0.1); }
.admin-source-label { font-size: 11px; color: #C9A96E; margin-bottom: 4px; display: block; }
.admin-source-input { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #F0EBE1; padding: 5px 8px; border-radius: 4px; font-size: 12px; font-family: inherit; width: 100%; }
.admin-source-input:focus { outline: none; border-color: rgba(201,169,110,0.3); }
.admin-tabs { display: flex; gap: 2px; margin-bottom: 24px; background: rgba(255,255,255,0.04); border-radius: 10px; padding: 3px; }
.admin-tab { padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500; color: rgba(240,235,225,0.5); transition: all 0.15s; border: none; background: none; font-family: inherit; }
.admin-tab:hover { color: #F0EBE1; }
.admin-tab.active { background: rgba(201,169,110,0.15); color: #C9A96E; }
.admin-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: rgba(240,235,225,0.4); padding: 2px 0; }
.admin-badge-gold { color: rgba(201,169,110,0.6); }
.admin-toast { position: fixed; top: 20px; right: 20px; padding: 12px 20px; border-radius: 8px; font-size: 14px; z-index: 9999; animation: slideIn 0.3s ease; }
.admin-toast.success { background: rgba(76,175,130,0.15); border: 1px solid rgba(76,175,130,0.3); color: #4CAF82; }
.admin-toast.error { background: rgba(224,92,92,0.15); border: 1px solid rgba(224,92,92,0.3); color: #E05C5C; }
@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

/* Range slider styling */
input[type="range"].admin-range { -webkit-appearance: none; appearance: none; height: 6px; border-radius: 3px; outline: none; border: none; padding: 0; cursor: pointer; }
input[type="range"].admin-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #C9A96E; cursor: pointer; border: 2px solid #07101F; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
input[type="range"].admin-range::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #C9A96E; cursor: pointer; border: 2px solid #07101F; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
`;

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "cities", label: "Cities", icon: "🌍" },
  { id: "us-cities", label: "US Cost of Living", icon: "🇺🇸" },
  { id: "tax", label: "Tax Data", icon: "💰" },
  { id: "audit", label: "Audit Log", icon: "📋" },
];

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [editCityId, setEditCityId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Check existing session and fetch user profile
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            const res = await adminFetch("/api/auth/me");
            if (res.ok) {
              setUser(await res.json());
            }
          } catch {}
        }
      } catch (err) {
        console.warn("Auth init failed:", err.message);
      } finally {
        setLoading(false);
      }
    };
    initAuth();

    // Listen for auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          const res = await adminFetch("/api/auth/me");
          if (res.ok) setUser(await res.json());
        } catch {}
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const navigateToCity = (cityId) => {
    setEditCityId(cityId);
    setPage("city-edit");
  };

  if (loading) {
    return <div style={{ background: "#07101F", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#C9A96E", fontFamily: "Outfit, sans-serif" }}>Loading...</div>;
  }

  if (!user) {
    return <AdminLogin onLogin={setUser} />;
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <AdminDashboard onNavigate={setPage} />;
      case "cities": return <CitiesList onEditCity={navigateToCity} showToast={showToast} />;
      case "city-edit": return <CityEdit cityId={editCityId} onBack={() => setPage("cities")} showToast={showToast} />;
      case "us-cities": return <UsCitiesEdit showToast={showToast} />;
      case "tax": return <TaxDataEdit showToast={showToast} />;
      case "audit": return <AuditLog />;
      default: return <AdminDashboard onNavigate={setPage} />;
    }
  };

  return (
    <>
      <style>{style}</style>
      <div className="admin-app">
        <div className="admin-sidebar">
          <div className="admin-sidebar-logo">GLN Admin</div>
          <div className="admin-sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.id}
                className={`admin-nav-item ${page === item.id ? "active" : ""}`}
                onClick={() => { setPage(item.id); setEditCityId(null); }}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
          <div className="admin-sidebar-footer">
            <div className="admin-user-info">{user.displayName || user.display_name} ({user.role})</div>
            <button className="admin-logout-btn" onClick={handleLogout}>Log out</button>
          </div>
        </div>
        <div className="admin-main">
          {renderPage()}
        </div>
        {toast && <div className={`admin-toast ${toast.type}`}>{toast.message}</div>}
      </div>
    </>
  );
}
