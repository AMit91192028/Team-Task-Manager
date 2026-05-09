import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "./AppLayout.css";

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="app-shell__content">
        <Topbar onMenuClick={() => setIsSidebarOpen((value) => !value)} />
        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
