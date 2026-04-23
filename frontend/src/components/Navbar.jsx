import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">⚡ Portfolio</Link>

      <ul className="navbar-links">
        <li><NavLink to="/portfolio">Projects</NavLink></li>
        {user ? (
          <>
            <li><NavLink to="/dashboard">Dashboard</NavLink></li>
            {isAdmin && <li><NavLink to="/admin">Admin</NavLink></li>}
          </>
        ) : (
          <>
            <li><NavLink to="/login">Login</NavLink></li>
            <li><NavLink to="/register">Register</NavLink></li>
          </>
        )}
      </ul>

      {user && (
        <div className="navbar-user">
          <span>{user.name}</span>
          <span className={`badge badge-${user.role.toLowerCase()}`}>{user.role}</span>
          <button className="btn btn-secondary" onClick={logout} style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
