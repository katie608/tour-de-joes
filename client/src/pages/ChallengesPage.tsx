import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import { Challenge } from "../types";

const SCROLL_KEY = "challenges_scroll";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const didRestore = useRef(false);

  useEffect(() => {
    apiFetch("/challenges")
      .then(setChallenges)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && !didRestore.current) {
      didRestore.current = true;
      const saved = sessionStorage.getItem(SCROLL_KEY);
      if (saved) {
        window.scrollTo(0, Number(saved));
        sessionStorage.removeItem(SCROLL_KEY);
      }
    }
  }, [loading]);

  function saveScroll() {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
  }

  function toggleExpand(e: React.MouseEvent, id: number) {
    e.preventDefault();
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (loading) return <p>Loading challenges...</p>;

  return (
    <div>
      <h2>Challenges</h2>
      {challenges.map((c) => {
        const isExpanded = expanded.has(c.id);
        return (
          <div key={c.id} className={`card ${c.isComplete ? "completed" : ""}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
              <Link to={`/challenges/${c.id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }} onClick={saveScroll}>
                <div className="card__title">{c.title}</div>
                <div className="card__meta">
                  {c.pointValue} pts
                  {c.repeatable && c.repeatLimit ? ` · ${c.completedCount} / ${c.repeatLimit}` : ""}
                </div>
              </Link>
              <button
                onClick={(e) => toggleExpand(e, c.id)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: "2px 4px", color: "var(--color-text-muted, #888)", flexShrink: 0 }}
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? "▲" : "▼"}
              </button>
            </div>
            {isExpanded && (
              <div style={{ marginTop: "0.6rem", fontSize: "0.9rem", lineHeight: 1.5, borderTop: "1px solid var(--color-border, #eee)", paddingTop: "0.6rem" }}>
                {c.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
