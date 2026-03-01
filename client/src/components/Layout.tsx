import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <img src="/c1.png" alt="BCDVS logo" />
          <h2>BCDVS</h2>
        </div>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/dashboard/users">User Management</Link>
          <Link to="/dashboard/vehicles">Vehicle Registration</Link>
          <Link to="/dashboard/hash">Hash & Blockchain</Link>
          <Link to="/dashboard/audit">Smart Contract & Audit</Link>
          <Link to="/dashboard/scanner">Camera Scanner</Link>
        </nav>
      </aside>
      <main className="content">
        <header className="topbar">
          <div>
            <p>{user?.fullName}</p>
            <small>{user?.role}</small>
          </div>
          <button onClick={handleLogout}>Logout</button>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
