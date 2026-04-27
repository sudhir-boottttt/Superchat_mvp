import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout() {
  const { user, isAuthenticated, clearAuth } = useAuth();

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="brand">
          SuperChat
        </Link>

        <nav className="nav">
          <NavLink to="/" className="nav-link">
            Live
          </NavLink>

          {user?.role === "creator" && (
            <NavLink to="/dashboard" className="nav-link">
              Dashboard
            </NavLink>
          )}

          {isAuthenticated ? (
            <>
              <span className="user-chip">{user?.name}</span>
              <button className="ghost-button" onClick={clearAuth}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">
                Login
              </NavLink>
              <NavLink to="/register" className="nav-link button-link">
                Join
              </NavLink>
            </>
          )}
        </nav>
      </header>

      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
