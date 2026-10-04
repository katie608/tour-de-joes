import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";
import { useInterval } from "../hooks/useInterval";
import { FeedItem } from "../types";

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [teamFilter, setTeamFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [active, setActive] = useState<FeedItem | null>(null);

  function load() {
    const params = new URLSearchParams();
    if (teamFilter) params.set("team", teamFilter);
    apiFetch(`/feed${params.toString() ? `?${params}` : ""}`).then(setItems);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamFilter]);
  useInterval(load, 30000);

  const teamOptions = useMemo(() => {
    const map = new Map<number, string>();
    items.forEach((i) => map.set(i.teamId, i.teamName));
    return Array.from(map.entries());
  }, [items]);

  const filtered = typeFilter ? items.filter((i) => i.type === typeFilter) : items;

  function isVideo(url: string) {
    return /\.(mp4|mov|webm|m4v)$/i.test(url);
  }

  return (
    <div>
      <h2>Photo Feed</h2>
      <div className="filters">
        <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
          <option value="">All teams</option>
          {teamOptions.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          <option value="challenge">Challenges</option>
          <option value="visit">Store check-ins</option>
        </select>
      </div>

      {filtered.length === 0 && <p>No photos yet.</p>}

      <div className="feed-grid">
        {filtered.map((item) => (
          <div key={item.id} className="feed-grid__thumb" onClick={() => setActive(item)}>
            {isVideo(item.mediaUrl) ? (
              <video src={item.mediaUrl} muted playsInline />
            ) : (
              <img src={item.mediaUrl} alt={item.label} />
            )}
            {item.type === "visit" && (
              <div style={{ position: "absolute", bottom: 2, right: 4, fontSize: "0.65rem", background: "rgba(0,0,0,0.55)", color: "#fff", borderRadius: 4, padding: "1px 4px" }}>
                📍
              </div>
            )}
          </div>
        ))}
      </div>

      {active && (
        <div className="media-modal" onClick={() => setActive(null)}>
          <div className="media-modal__inner" onClick={(e) => e.stopPropagation()}>
            {isVideo(active.mediaUrl) ? (
              <video src={active.mediaUrl} controls autoPlay style={{ maxWidth: "100%", maxHeight: "65vh", borderRadius: "10px 10px 0 0" }} />
            ) : (
              <img src={active.mediaUrl} alt={active.label} style={{ maxWidth: "100%", maxHeight: "65vh", borderRadius: "10px 10px 0 0", display: "block" }} />
            )}
            <div className="media-modal__info" style={{ position: "relative" }}>
              <button onClick={() => setActive(null)} style={{ position: "absolute", top: -8, right: 0, background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "#888" }}>✕</button>
              <div className="card__title">{active.label}</div>
              <div className="card__meta">{active.type === "visit" ? "📍 Store check-in" : "🏆 Challenge"} · {active.teamName}</div>
              <div className="card__meta">{new Date(active.timestamp).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
