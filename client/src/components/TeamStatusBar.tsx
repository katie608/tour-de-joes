import { useAuth } from "../context/AuthContext";

export default function TeamStatusBar() {
  const { team, isAdmin, logout } = useAuth();

  return (
    <header className="status-bar">
      {isAdmin ? (
        <span className="status-bar__name">Admin</span>
      ) : team ? (
        <>
          <span className="status-bar__name">{team.name}</span>
          <div className="status-bar__stats">
            <span className="status-bar__stat">{team.unspentPoints} pts</span>
            <span className="status-bar__stat">{team.controlledStores} store{team.controlledStores === 1 ? "" : "s"}</span>
          </div>
        </>
      ) : null}
      <button className="status-bar__logout" onClick={logout}>
        Log out
      </button>
    </header>
  );
}
