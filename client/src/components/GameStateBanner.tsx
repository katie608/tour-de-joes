import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import { useInterval } from "../hooks/useInterval";

type GameState = "pending" | "active" | "ended";

export default function GameStateBanner() {
  const [state, setState] = useState<GameState | null>(null);

  function load() {
    apiFetch("/game-state").then((d) => setState(d.state)).catch(() => {});
  }

  useEffect(() => { load(); }, []);
  useInterval(load, 15000);

  if (!state || state === "active") return null;

  return (
    <div style={{
      background: state === "ended" ? "#c62828" : "#e65100",
      color: "#fff",
      textAlign: "center",
      padding: "10px 16px",
      fontWeight: 600,
      fontSize: "0.95rem",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {state === "pending" ? "⏳ The game hasn't started yet — stand by!" : "🏁 The game has ended! Final scores are in."}
    </div>
  );
}
