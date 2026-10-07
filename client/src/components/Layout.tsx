import { NavLink, Outlet, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TeamStatusBar from "./TeamStatusBar";
import GameStateBanner from "./GameStateBanner";

export function PublicLayout() {
  const { team, isAdmin, loading } = useAuth();

  if (loading) return <div className="page-loading">Loading...</div>;

  const loggedIn = !!team || isAdmin;

  return (
    <div className="app-shell">
      <div className="public-header">
        <span className="public-header__title">Tour de Joes</span>
        <div className="public-header__links">
          <NavLink to="/feed">Feed</NavLink>
          <NavLink to="/scores">Scores</NavLink>
          {loggedIn ? (
            <NavLink to="/">My Team</NavLink>
          ) : (
            <Link to="/login">Log in</Link>
          )}
        </div>
      </div>
      <main className="app-content" style={{ paddingBottom: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}

export function ProtectedLayout() {
  const { team, isAdmin, loading } = useAuth();

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!team && !isAdmin) return <Navigate to="/login" replace />;
  if (isAdmin && window.location.pathname === "/") return <Navigate to="/admin" replace />;

  return (
    <div className="app-shell">
      {!isAdmin && <GameStateBanner />}
      <TeamStatusBar />
      <main className="app-content">
        <Outlet />
      </main>
      <nav className="bottom-nav">
        {!isAdmin && (
          <>
            <NavLink to="/" end>Challenges</NavLink>
            <NavLink to="/stores">Stores</NavLink>
            <NavLink to="/feed">Feed</NavLink>
            <NavLink to="/scores">Scores</NavLink>
            <NavLink to="/rules">Rules</NavLink>
          </>
        )}
        {isAdmin && <NavLink to="/admin">Admin</NavLink>}
      </nav>
    </div>
  );
}
