import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { useInterval } from "../hooks/useInterval";
import { ScoreEntry } from "../types";

interface TeamEvent {
  type: "challenge" | "visit" | "deposit";
  timestamp: string;
  label: string;
  points: number;
}

interface TeamLog {
  teamName: string;
  events: TeamEvent[];
}

export default function ScoresPage() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [activeLog, setActiveLog] = useState<TeamLog | null>(null);
  const [loadingLog, setLoadingLog] = useState(false);

  function load() {
    apiFetch("/scores").then(setScores);
  }

  useEffect(() => { load(); }, []);
  useInterval(load, 30000);

  async function openLog(teamId: number) {
    setLoadingLog(true);
    try {
      const data = await apiFetch(`/scores/team/${teamId}/events`);
      setActiveLog(data);
    } finally {
      setLoadingLog(false);
    }
  }

  function pointsLabel(event: TeamEvent) {
    if (event.type === "deposit") return `−${Math.abs(event.points)} pts spent`;
    return `+${event.points} pts`;
  }

  return (
    <div>
      <h2>Scores</h2>
      {scores.map((s) => (
        <div
          key={s.teamId}
          className={`card ${s.isLeader ? "leader" : ""}`}
          style={{ cursor: "pointer" }}
          onClick={() => openLog(s.teamId)}
        >
          <div className="card__title">
            #{s.rank} {s.teamName} {s.isLeader ? "👑" : ""}
          </div>
          <div className="card__meta">
            {s.storesControlled} store{s.storesControlled === 1 ? "" : "s"} controlled · {s.totalPointsEarned} pts earned · {s.unspentPoints} unspent
          </div>
        </div>
      ))}

      {(activeLog || loadingLog) && (
        <div className="confirm-overlay" onClick={() => setActiveLog(null)}>
          <div className="confirm-box" style={{ maxHeight: "80vh", overflowY: "auto", width: "min(92vw, 500px)" }} onClick={(e) => e.stopPropagation()}>
            {loadingLog ? (
              <p>Loading...</p>
            ) : activeLog && (
              <>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.75rem" }}>{activeLog.teamName}</div>
                {activeLog.events.length === 0 && <p className="card__meta">No activity yet.</p>}
                {activeLog.events.map((ev, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "0.4rem 0", borderBottom: "1px solid #eee", gap: "0.5rem" }}>
                    <div>
                      <div style={{ fontSize: "0.9rem" }}>{ev.label}</div>
                      <div className="card__meta" style={{ fontSize: "0.75rem" }}>{new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                    <div style={{ fontSize: "0.85rem", whiteSpace: "nowrap", color: ev.type === "deposit" ? "#c62828" : "#2e7d32", fontWeight: 600 }}>
                      {pointsLabel(ev)}
                    </div>
                  </div>
                ))}
                <button className="btn" style={{ marginTop: "1rem", width: "100%" }} onClick={() => setActiveLog(null)}>Close</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
