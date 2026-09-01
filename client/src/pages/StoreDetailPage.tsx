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
    setCheckInMsg(null);
    try {
      await apiFetch(`/stores/${id}/visit`, { method: "POST" });
      setCheckInMsg("+10 points awarded for visiting!");
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
          ? `Controlled by ${store.controllingTeamName} (${store.topPoints} pts · ${store.gapToOvertake} to overtake)`
          : "Unclaimed — deposit points to take control!"}
      </p>

      <div style={{ marginBottom: 16 }}>
        {store.visited ? (
          <div style={{ color: "#2e7d32", fontWeight: 600 }}>✓ You've visited this store (+10 pts already awarded)</div>
        ) : (
          <button className="btn btn--secondary" onClick={handleCheckIn}>
            Check In Here (+10 pts)
          </button>
        )}
        {checkInMsg && <div className="card__meta" style={{ marginTop: 6 }}>{checkInMsg}</div>}
      </div>

      <h3>Deposits</h3>
      {store.deposits.length === 0 && <p>No deposits yet.</p>}
      {store.deposits.map((d) => (
        <div key={d.teamId} className="deposit-row">
          <span>{d.teamName}</span>
          <span>{d.points} pts</span>
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
