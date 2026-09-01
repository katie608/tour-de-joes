import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import { useInterval } from "../hooks/useInterval";
import { StoreSummary } from "../types";

export default function StoresPage() {
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    apiFetch("/stores")
      .then(setStores)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);
  useInterval(load, 30000);

  if (loading) return <p>Loading stores...</p>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <h2 style={{ margin: 0 }}>Stores</h2>
        <Link to="/add-store" className="btn" style={{ width: "auto", padding: "6px 14px", fontSize: "0.9rem" }}>
          + Add Store
        </Link>
      </div>

      {stores.map((s) => (
        <Link key={s.id} to={`/stores/${s.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="store-card__info">
              <div className="card__title">
                {s.name}
                {s.visited && <span className="store-card__visited" style={{ marginLeft: 8 }}>✓ Visited</span>}
              </div>
              <div className="card__meta">{s.location}</div>
            </div>
            <div className={`store-card__control ${s.controllingTeamName ? "store-card__control--claimed" : ""}`}>
              {s.controllingTeamName ? (
                <>
                  <span className="store-card__controller">🏆 {s.controllingTeamName}</span>
                  <span className="store-card__gap">{s.gapToOvertake} pt{s.gapToOvertake === 1 ? "" : "s"} to overtake</span>
                </>
              ) : (
                <span className="store-card__unclaimed">Unclaimed — be the first!</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
