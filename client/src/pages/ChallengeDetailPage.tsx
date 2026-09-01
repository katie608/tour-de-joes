import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiFetch, ApiError } from "../api";
import { useAuth } from "../context/AuthContext";
import { Challenge } from "../types";

export default function ChallengeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch(`/challenges/${id}`).then(setChallenge);
  }, [id]);

  if (!challenge) return <p>Loading...</p>;

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      let body: FormData | undefined;
      if (challenge!.mediaRequired) {
        if (!file) {
          setError("Please choose a photo or video to upload.");
          setSubmitting(false);
          return;
        }
        body = new FormData();
        body.append("media", file);
      }
      await apiFetch(`/challenges/${id}/complete`, { method: "POST", body });
      await refresh();
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link className="back-link" to="/">
        &larr; Back to Challenges
      </Link>
      <h2>{challenge.title}</h2>
      <p>{challenge.description}</p>
      <p>
        <strong>{challenge.pointValue} points</strong>
        {challenge.repeatable && challenge.repeatLimit
          ? ` · Repeatable up to ${challenge.repeatLimit} times (completed ${challenge.completedCount}/${challenge.repeatLimit})`
          : ""}
      </p>

      {challenge.mediaRequired && !challenge.isComplete && (
        <input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      )}

      {error && <div className="error-text">{error}</div>}

      <button className="btn" onClick={handleSubmit} disabled={challenge.isComplete || submitting}>
        {challenge.isComplete ? "Completed" : submitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}
