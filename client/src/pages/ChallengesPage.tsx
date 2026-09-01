import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import { Challenge } from "../types";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/challenges")
      .then(setChallenges)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading challenges...</p>;

  return (
    <div>
      <h2>Challenges</h2>
      {challenges.map((c) => (
        <Link key={c.id} to={`/challenges/${c.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <div className={`card ${c.isComplete ? "completed" : ""}`}>
            <div className="card__title">{c.title}</div>
            <div className="card__meta">
              {c.pointValue} pts
              {c.repeatable && c.repeatLimit ? ` · ${c.completedCount} / ${c.repeatLimit}` : ""}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
