import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, ApiError } from "../api";

export default function AddStorePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/stores", { method: "POST", body: JSON.stringify({ name, location }) });
      navigate("/stores");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add store");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2>Add a Store</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Store name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input
          placeholder="Address / location label"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        {error && <div className="error-text">{error}</div>}
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Store"}
        </button>
      </form>
    </div>
  );
}
