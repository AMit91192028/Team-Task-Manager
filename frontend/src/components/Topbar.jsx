import useAuth from "../hooks/useAuth";
import "./Topbar.css";

export default function Topbar({ onMenuClick }) {
  const { logout, user } = useAuth();

  return (
    <header className="topbar">
      <button className="topbar__menu" onClick={onMenuClick}>
        Menu
      </button>

      <div className="topbar__meta">
        <div>
          <span className="topbar__eyebrow">Workspace</span>
          <strong>{user?.role === "admin" ? "Admin Console" : "Member Space"}</strong>
        </div>

        <button className="topbar__logout" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
