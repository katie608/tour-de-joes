import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import { useInterval } from "../hooks/useInterval";
import { ScoreEntry } from "../types";

export default function ScoresPage() {
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  function load() {
    apiFetch("/scores").then(setScores);
  }

  useEffect(() => { load(); }, []);
  useInterval(load, 30000);

  return (
    <div>
      <h2>Scores</h2>
      {scores.map((s) => (
        <Link key={s.teamId} to={`/scores/team/${s.teamId}`} style={{ textDecoration: "none", color: "inherit" }}>
          <div className={`card ${s.isLeader ? "leader" : ""}`}>
            <div className="card__title">
              #{s.rank} {s.teamName} {s.isLeader ? "👑" : ""}
            </div>
            <div className="card__meta">
              {s.storesControlled} store{s.storesControlled === 1 ? "" : "s"} controlled · {s.totalPointsEarned} pts earned · {s.unspentPoints} unspent
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
