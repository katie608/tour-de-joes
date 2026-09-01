import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TeamStatusBar from "./TeamStatusBar";

export function ProtectedLayout() {
  const { team, isAdmin, loading } = useAuth();

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!team && !isAdmin) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <TeamStatusBar />
      <main className="app-content">
        <Outlet />
      </main>
      <nav className="bottom-nav">
        {!isAdmin && (
          <>
            <NavLink to="/" end>
              Challenges
            </NavLink>
            <NavLink to="/stores">Stores</NavLink>
            <NavLink to="/feed">Feed</NavLink>
            <NavLink to="/scores">Scores</NavLink>
          </>
        )}
        {isAdmin && <NavLink to="/admin">Admin</NavLink>}
      </nav>
    </div>
  );
}
