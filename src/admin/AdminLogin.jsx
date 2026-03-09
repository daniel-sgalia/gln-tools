import { useState } from "react";

const loginStyle = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garant:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap');
.login-page { background: #07101F; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Outfit', sans-serif; }
.login-card { background: #0E1C30; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 48px 40px; width: 100%; max-width: 400px; }
.login-logo { font-family: 'Cormorant Garant', serif; font-size: 28px; font-weight: 700; color: #C9A96E; text-align: center; margin-bottom: 8px; }
.login-subtitle { font-size: 14px; color: rgba(240,235,225,0.45); text-align: center; margin-bottom: 32px; }
.login-field { margin-bottom: 20px; }
.login-label { font-size: 12px; font-weight: 500; color: rgba(240,235,225,0.6); margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.5px; }
.login-input { background: #162540; border: 1px solid rgba(255,255,255,0.1); color: #F0EBE1; padding: 12px 16px; border-radius: 10px; font-size: 15px; font-family: inherit; width: 100%; box-sizing: border-box; }
.login-input:focus { outline: none; border-color: rgba(201,169,110,0.4); }
.login-input::placeholder { color: rgba(240,235,225,0.25); }
.login-btn { background: linear-gradient(135deg, #C9A96E, #E8C98A); color: #07101F; border: none; padding: 12px; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; width: 100%; margin-top: 8px; }
.login-btn:hover { opacity: 0.9; }
.login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.login-error { background: rgba(224,92,92,0.1); border: 1px solid rgba(224,92,92,0.2); color: #E05C5C; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
`;

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{loginStyle}</style>
      <div className="login-page">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-logo">Global Living Network</div>
          <div className="login-subtitle">Admin Dashboard</div>
          {error && <div className="login-error">{error}</div>}
          <div className="login-field">
            <label className="login-label">Email</label>
            <input className="login-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@gln.com" required />
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <input className="login-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </>
  );
}
