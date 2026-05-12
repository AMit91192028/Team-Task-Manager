import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import "./Sidebar.css";

const baseLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/projects", label: "Projects" },
  { to: "/my-tasks", label: "My Tasks" }
];

const adminLinks = [
  { to: "/overdue-members", label: "Overdue Members" }
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const links = isAdmin ? [...baseLinks, ...adminLinks] : baseLinks;

  return (
    <>
      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar__brand">
          <span className="sidebar__logo">TM</span>
          <div>
            <strong>Team Task Manager</strong>
            <p>Company task workspace</p>
          </div>
        </div>

        <nav className="sidebar__nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <p>Signed in as</p>
          <strong>{user?.name}</strong>
          <span>{user?.role}</span>
        </div>
      </aside>

      {isOpen ? <button className="sidebar__backdrop" onClick={onClose} /> : null}
    </>
  );
}
