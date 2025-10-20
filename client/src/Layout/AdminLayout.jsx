// src/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/AdminNavbar"; //Admin Navbar
import Sidebar from "../components/sidebar/AdminSidebar"; // Admin Sidebar

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* <Navbar /> */}
        <main className="p-4 flex-1 overflow-y-auto">
          {/* nested component render  */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
