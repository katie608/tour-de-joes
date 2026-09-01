import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api";

type Mode = "login" | "register" | "admin";

export default function LoginPage() {
  const { team, isAdmin, login, register, adminLogin } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (team || isAdmin) return <Navigate to="/" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") await login(name, password);
      else if (mode === "register") await register(name, password, phone);
      else await adminLogin(name, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <h1>Trader Joe's Scavenger Hunt</h1>
      <div className="tabs">
        <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
          Team Login
        </button>
        <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
          New Team
        </button>
        <button className={mode === "admin" ? "active" : ""} onClick={() => setMode("admin")}>
          Admin
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          placeholder={mode === "admin" ? "Username" : "Team name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={mode === "register" ? "Password (optional)" : "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={mode === "admin"}
        />
        {mode === "register" && (
          <input
            type="tel"
            placeholder="Phone number for store alerts (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        )}
        {error && <div className="error-text">{error}</div>}
        <button className="btn" type="submit" disabled={busy}>
          {mode === "login" ? "Log In" : mode === "register" ? "Create Team" : "Admin Log In"}
        </button>
      </form>
    </div>
  );
}
