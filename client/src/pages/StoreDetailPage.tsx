import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch, ApiError } from "../api";
import { useAuth } from "../context/AuthContext";
import { StoreDetail } from "../types";

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
        <p>{message}</p>
        <div className="confirm-box__buttons">
          <button className="btn btn--secondary" onClick={onCancel}>No, cancel</button>
          <button className="btn" onClick={onConfirm}>Yes, I'm here</button>
        </div>
      </div>
    </div>
  );
}

export default function StoreDetailPage() {
  const { id } = useParams();
  const { team, refresh } = useAuth();
  const [store, setStore] = useState<StoreDetail | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showDepositConfirm, setShowDepositConfirm] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  function load() {
    apiFetch(`/stores/${id}`).then(setStore);
  }

  useEffect(() => {
    load();
  }, [id]);

  if (!store) return <p>Loading...</p>;

  async function submitDeposit() {
    setShowDepositConfirm(false);
    setError(null);
    const points = Number(amount);
    setSubmitting(true);
    try {
      await apiFetch(`/stores/${id}/deposit`, { method: "POST", body: JSON.stringify({ points }) });
      setAmount("");
      load();
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Deposit failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const points = Number(amount);
    if (!Number.isInteger(points) || points <= 0) {
      setError("Enter a positive whole number of points.");
      return;
    }
    if (team && points > team.unspentPoints) {
      setError("You don't have that many unspent points.");
      return;
    }
    setShowDepositConfirm(true);
  }

  async function handleCheckIn() {
    if (!selfieFile) {
      setCheckInMsg("Please choose a team selfie photo first.");
      return;
    }
    setCheckInMsg(null);
    const body = new FormData();
    body.append("media", selfieFile);
    try {
      await apiFetch(`/stores/${id}/visit`, { method: "POST", body });
      setCheckInMsg("+10 points awarded for visiting!");
      setSelfieFile(null);
      load();
      await refresh();
    } catch (err) {
      setCheckInMsg(err instanceof ApiError ? err.message : "Check-in failed");
    }
  }

  return (
    <div>
      {showDepositConfirm && (
        <ConfirmDialog
          message="You must be physically located at this store to put down points on it. Are you at this store right now?"
          onConfirm={submitDeposit}
          onCancel={() => setShowDepositConfirm(false)}
        />
      )}

      <Link className="back-link" to="/stores">
        &larr; Back to Stores
      </Link>
      <h2>{store.name}</h2>
      <p className="card__meta">{store.location}</p>
      <p>
        {store.controllingTeamName
          ? `Controlled by ${store.controllingTeamName} (${store.topPoints} pts${team && store.deposits.find((d) => d.teamId === team.id)?.points === store.topPoints ? "" : ` · ${store.gapToOvertake} to overtake`})`
          : "Unclaimed — deposit points to take control!"}
      </p>

      {store.controllerSelfieUrl && (
        <div style={{ margin: "0.75rem 0" }}>
          <img
            src={store.controllerSelfieUrl}
            alt={`${store.controllingTeamName} selfie`}
            style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 10 }}
          />
          <div className="card__meta" style={{ marginTop: 4 }}>📍 {store.controllingTeamName}'s arrival selfie</div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        {store.visited ? (
          <div style={{ color: "#2e7d32", fontWeight: 600 }}>✓ You've visited this store (+10 pts already awarded)</div>
        ) : (
          <div>
            <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.9rem" }}>
              Team selfie (required to check in)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
              style={{ marginBottom: "0.5rem" }}
            />
            <button className="btn btn--secondary" onClick={handleCheckIn}>
              Check In Here (+10 pts)
            </button>
          </div>
        )}
        {checkInMsg && <div className="card__meta" style={{ marginTop: 6 }}>{checkInMsg}</div>}
      </div>

      <h3>Deposits</h3>
      {store.deposits.length === 0 && <p>No deposits yet.</p>}
      {store.deposits.map((d) => (
        <div key={d.teamId} className="deposit-row">
          <span>{d.teamName}</span>
          <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <span>{d.points} pts</span>
            {d.updatedAt && <span style={{ fontSize: "0.75rem", color: "#888" }}>{new Date(d.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
          </span>
        </div>
      ))}

      <h3>Deposit Points</h3>
      <form onSubmit={handleDeposit}>
        <input
          type="number"
          min={1}
          placeholder={`Your unspent points: ${team?.unspentPoints ?? 0}`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {error && <div className="error-text">{error}</div>}
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "Depositing..." : "Deposit"}
        </button>
      </form>
    </div>
  );
}
