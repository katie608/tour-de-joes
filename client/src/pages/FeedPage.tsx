import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api";
import { useInterval } from "../hooks/useInterval";
import { FeedItem } from "../types";

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [teamFilter, setTeamFilter] = useState("");
  const [challengeFilter, setChallengeFilter] = useState("");
  const [active, setActive] = useState<FeedItem | null>(null);

  function load() {
    const params = new URLSearchParams();
    if (teamFilter) params.set("team", teamFilter);
    if (challengeFilter) params.set("challenge", challengeFilter);
    apiFetch(`/feed${params.toString() ? `?${params}` : ""}`).then(setItems);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamFilter, challengeFilter]);
  useInterval(load, 30000);

  const teamOptions = useMemo(() => {
    const map = new Map<number, string>();
    items.forEach((i) => map.set(i.teamId, i.teamName));
    return Array.from(map.entries());
  }, [items]);

  const challengeOptions = useMemo(() => {
    const map = new Map<number, string>();
    items.forEach((i) => map.set(i.challengeId, i.challengeName));
    return Array.from(map.entries());
  }, [items]);

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
        <select value={challengeFilter} onChange={(e) => setChallengeFilter(e.target.value)}>
          <option value="">All challenges</option>
          {challengeOptions.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>

      {items.length === 0 && <p>No photos yet.</p>}

      <div className="feed-grid">
        {items.map((item) => (
          <div key={item.id} className="feed-grid__thumb" onClick={() => setActive(item)}>
            {isVideo(item.mediaUrl) ? (
              <video src={item.mediaUrl} muted playsInline />
            ) : (
              <img src={item.mediaUrl} alt={item.challengeName} />
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
              <img src={active.mediaUrl} alt={active.challengeName} style={{ maxWidth: "100%", maxHeight: "65vh", borderRadius: "10px 10px 0 0", display: "block" }} />
            )}
            <div className="media-modal__info">
              <div className="card__title">{active.challengeName}</div>
              <div className="card__meta">{active.teamName}</div>
              <div className="card__meta">{new Date(active.timestamp).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
