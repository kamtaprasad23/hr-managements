import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/sidebar/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

export default function AdminDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex bg-white">
      <AdminSidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div
        className="transition-all duration-300 p-6 min-h-screen w-full"
        style={{ marginLeft: isSidebarOpen ? "16rem" : "5rem" }}
      >
        <AdminNavbar />
        <div className="mt-6">
          <Outlet /> {/* Here child page will render */}
        </div>
      </div>
    </div>
  );
}