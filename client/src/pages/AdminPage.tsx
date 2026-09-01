import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "../api";
import { StoreSummary } from "../types";

interface TeamRow {
  id: number;
  name: string;
  unspentPoints: number;
}

export default function AdminPage() {
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  function load() {
    apiFetch("/stores").then(setStores);
    apiFetch("/scores").then((scores) =>
      setTeams(scores.map((s: any) => ({ id: s.teamId, name: s.teamName, unspentPoints: s.unspentPoints })))
    );
  }

  useEffect(() => {
    load();
  }, []);

  async function deleteStore(id: number, name: string) {
    if (!window.confirm(`Delete store "${name}"? This removes all its deposit records.`)) return;
    setError(null);
    try {
      await apiFetch(`/admin/stores/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete store");
    }
  }

  async function deleteTeam(id: number, name: string) {
    if (!window.confirm(`Delete team "${name}"? This removes their completions and deposits.`)) return;
    setError(null);
    try {
      await apiFetch(`/admin/teams/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete team");
    }
  }

  return (
    <div>
      <h2>Admin Panel</h2>
      {error && <div className="error-text">{error}</div>}

      <h3>Stores</h3>
      {stores.map((s) => (
        <div key={s.id} className="card">
          <div className="card__title">{s.name}</div>
          <div className="card__meta">{s.location}</div>
          <button className="btn btn--danger" onClick={() => deleteStore(s.id, s.name)}>
            Delete Store
          </button>
        </div>
      ))}

      <h3>Teams</h3>
      {teams.map((t) => (
        <div key={t.id} className="card">
          <div className="card__title">{t.name}</div>
          <div className="card__meta">{t.unspentPoints} unspent pts</div>
          <button className="btn btn--danger" onClick={() => deleteTeam(t.id, t.name)}>
            Delete Team
          </button>
        </div>
      ))}
    </div>
  );
}
