import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../api";

interface TeamEvent {
  type: "challenge" | "visit" | "deposit";
  timestamp: string;
  label: string;
  points: number;
}

interface TeamLog {
  teamName: string;
  latestSelfie: string | null;
  events: TeamEvent[];
}

export default function TeamLogPage() {
  const { id } = useParams();
  const [log, setLog] = useState<TeamLog | null>(null);

  useEffect(() => {
    apiFetch(`/scores/team/${id}/events`).then(setLog);
  }, [id]);

  if (!log) return <p>Loading...</p>;

  function pointsLabel(event: TeamEvent) {
    if (event.type === "deposit") return `−${Math.abs(event.points)} pts spent`;
    return `+${event.points} pts`;
  }

  return (
    <div>
      <Link className="back-link" to="/scores">&larr; Back to Scores</Link>
      <h2>{log.teamName}</h2>

      {log.latestSelfie && (
        <div style={{ marginBottom: "1rem" }}>
          <img
            src={log.latestSelfie}
            alt={`${log.teamName} selfie`}
            style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 10 }}
          />
          <div className="card__meta" style={{ marginTop: 4 }}>Most recent store selfie</div>
        </div>
      )}

      <h3>Activity Log</h3>
      {log.events.length === 0 && <p className="card__meta">No activity yet.</p>}
      {log.events.map((ev, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "0.5rem 0", borderBottom: "1px solid var(--color-border, #eee)", gap: "0.5rem" }}>
          <div>
            <div style={{ fontSize: "0.9rem" }}>{ev.label}</div>
            <div className="card__meta" style={{ fontSize: "0.75rem" }}>
              {new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          <div style={{ fontSize: "0.85rem", whiteSpace: "nowrap", color: ev.type === "deposit" ? "#c62828" : "#2e7d32", fontWeight: 600 }}>
            {pointsLabel(ev)}
          </div>
        </div>
      ))}
    </div>
  );
}
