import { useEffect, useState } from "react";
import { apiFetch } from "../api";

interface ArchiveItem {
  id: string;
  mediaUrl: string;
  teamName: string;
  label: string;
  type: "challenge" | "visit";
  timestamp: string;
  gameLabel: string | null;
}

export default function ArchivePage() {
  const [grouped, setGrouped] = useState<Record<string, ArchiveItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ArchiveItem | null>(null);

  useEffect(() => {
    apiFetch("/archive").then(setGrouped).finally(() => setLoading(false));
  }, []);

  function isVideo(url: string) {
    return /\.(mp4|mov|webm|m4v)$/i.test(url);
  }

  if (loading) return <p>Loading archive...</p>;

  const games = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (games.length === 0) {
    return <p style={{ color: "#888" }}>No archived games yet. Photos are saved here when you reset the game.</p>;
  }

  return (
    <div>
      <h2>Photo Archive</h2>
      {games.map((game) => (
        <div key={game} style={{ marginBottom: 32 }}>
          <h3 style={{ marginBottom: 8, color: "#c8102e" }}>{game}</h3>
          <div className="feed-grid">
            {grouped[game].map((item) => (
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
        </div>
      ))}

      {active && (
        <div className="media-modal" onClick={() => setActive(null)}>
          <div className="media-modal__inner" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setActive(null)} style={{ position: "absolute", top: -36, right: 0, background: "none", border: "none", fontSize: "1.8rem", cursor: "pointer", color: "#fff", lineHeight: 1 }}>✕</button>
            {isVideo(active.mediaUrl) ? (
              <video src={active.mediaUrl} controls autoPlay style={{ maxWidth: "100%", maxHeight: "65vh", borderRadius: "10px 10px 0 0" }} />
            ) : (
              <img src={active.mediaUrl} alt={active.label} style={{ maxWidth: "100%", maxHeight: "65vh", borderRadius: "10px 10px 0 0", display: "block" }} />
            )}
            <div className="media-modal__info">
              <div className="card__title">{active.label}</div>
              <div className="card__meta">{active.type === "visit" ? "📍 Store check-in" : "Challenge"} · {active.teamName}</div>
              <div className="card__meta">{new Date(active.timestamp).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
