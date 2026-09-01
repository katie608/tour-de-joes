import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../api";

interface TeamRow {
  id: number;
  name: string;
  unspentPoints: number;
  phoneNumber: string | null;
}

interface StoreRow {
  id: number;
  name: string;
  location: string;
}

interface CompletionRow {
  id: number;
  teamId: number;
  teamName: string;
  challengeId: number;
  challengeTitle: string;
  pointValue: number;
  timestamp: string;
  mediaUrl: string | null;
}

type Tab = "teams" | "stores" | "completions";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("teams");
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [completions, setCompletions] = useState<CompletionRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreLocation, setNewStoreLocation] = useState("");
  const [filterTeam, setFilterTeam] = useState<string>("");

  function loadTeams() {
    apiFetch("/admin/teams").then(setTeams).catch(() => {});
  }
  function loadStores() {
    apiFetch("/admin/stores").then(setStores).catch(() => {});
  }
  function loadCompletions() {
    apiFetch("/admin/completions").then(setCompletions).catch(() => {});
  }

  useEffect(() => {
    loadTeams();
    loadStores();
    loadCompletions();
  }, []);

  async function act(fn: () => Promise<void>) {
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    }
  }

  async function deleteTeam(id: number, name: string) {
    if (!window.confirm(`Delete team "${name}"? This removes all their completions and deposits.`)) return;
    await act(async () => {
      await apiFetch(`/admin/teams/${id}`, { method: "DELETE" });
      loadTeams();
      loadCompletions();
    });
  }

  async function resetPoints(id: number, name: string) {
    if (!window.confirm(`Reset unspent points for "${name}" to 0?`)) return;
    await act(async () => {
      await apiFetch(`/admin/teams/${id}/reset-points`, { method: "POST" });
      loadTeams();
    });
  }

  async function deleteStore(id: number, name: string) {
    if (!window.confirm(`Delete store "${name}"? This removes all its deposit records.`)) return;
    await act(async () => {
      await apiFetch(`/admin/stores/${id}`, { method: "DELETE" });
      loadStores();
    });
  }

  async function addStore(e: React.FormEvent) {
    e.preventDefault();
    await act(async () => {
      await apiFetch("/admin/stores", {
        method: "POST",
        body: JSON.stringify({ name: newStoreName, location: newStoreLocation }),
      });
      setNewStoreName("");
      setNewStoreLocation("");
      loadStores();
    });
  }

  async function deleteCompletion(id: number, teamName: string, challengeTitle: string) {
    if (!window.confirm(`Delete completion: "${challengeTitle}" by ${teamName}? Points will be refunded.`)) return;
    await act(async () => {
      await apiFetch(`/admin/completions/${id}`, { method: "DELETE" });
      loadCompletions();
      loadTeams();
    });
  }

  const filteredCompletions = filterTeam
    ? completions.filter((c) => c.teamName === filterTeam)
    : completions;

  return (
    <div style={{ padding: "1rem", maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ marginBottom: "1rem" }}>Admin Panel</h2>

      {error && <div className="error-text" style={{ marginBottom: "1rem" }}>{error}</div>}

      <div className="tabs" style={{ marginBottom: "1rem" }}>
        <button className={tab === "teams" ? "active" : ""} onClick={() => setTab("teams")}>
          Teams ({teams.length})
        </button>
        <button className={tab === "stores" ? "active" : ""} onClick={() => setTab("stores")}>
          Stores ({stores.length})
        </button>
        <button className={tab === "completions" ? "active" : ""} onClick={() => setTab("completions")}>
          Completions ({completions.length})
        </button>
      </div>

      {tab === "teams" && (
        <div>
          {teams.map((t) => (
            <div key={t.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <div className="card__title">{t.name}</div>
                <div className="card__meta">
                  {t.unspentPoints} unspent pts
                  {t.phoneNumber && ` · ${t.phoneNumber}`}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn" style={{ fontSize: "0.8rem", padding: "6px 10px" }} onClick={() => resetPoints(t.id, t.name)}>
                  Reset pts
                </button>
                <button className="btn btn--danger" style={{ fontSize: "0.8rem", padding: "6px 10px" }} onClick={() => deleteTeam(t.id, t.name)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
          {teams.length === 0 && <div className="card__meta">No teams yet.</div>}
        </div>
      )}

      {tab === "stores" && (
        <div>
          <form onSubmit={addStore} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
            <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Add Store</div>
            <input
              placeholder="Store name"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              required
            />
            <input
              placeholder="Location (e.g. Boston, MA)"
              value={newStoreLocation}
              onChange={(e) => setNewStoreLocation(e.target.value)}
            />
            <button className="btn" type="submit">Add Store</button>
          </form>

          {stores.map((s) => (
            <div key={s.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="card__title">{s.name}</div>
                <div className="card__meta">{s.location}</div>
              </div>
              <button className="btn btn--danger" style={{ fontSize: "0.8rem", padding: "6px 10px" }} onClick={() => deleteStore(s.id, s.name)}>
                Delete
              </button>
            </div>
          ))}
          {stores.length === 0 && <div className="card__meta">No stores yet.</div>}
        </div>
      )}

      {tab === "completions" && (
        <div>
          <div style={{ marginBottom: "0.75rem" }}>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1px solid #ccc", fontSize: "0.9rem" }}
            >
              <option value="">All teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          {filteredCompletions.map((c) => (
            <div key={c.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
              <div style={{ flex: 1 }}>
                <div className="card__title" style={{ fontSize: "0.95rem" }}>{c.challengeTitle}</div>
                <div className="card__meta">
                  {c.teamName} · +{c.pointValue} pts · {new Date(c.timestamp).toLocaleString()}
                </div>
                {c.mediaUrl && (
                  <a href={c.mediaUrl} target="_blank" rel="noreferrer" style={{ fontSize: "0.8rem", color: "var(--color-primary)" }}>
                    View media
                  </a>
                )}
              </div>
              <button className="btn btn--danger" style={{ fontSize: "0.8rem", padding: "6px 10px", flexShrink: 0 }} onClick={() => deleteCompletion(c.id, c.teamName, c.challengeTitle)}>
                Delete
              </button>
            </div>
          ))}
          {filteredCompletions.length === 0 && <div className="card__meta">No completions.</div>}
        </div>
      )}
    </div>
  );
}
