import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import EmpNavbar from "../components/EmpNavbar";
import EmpSidebar from "../components/sidebar/EmpSidebar";

export default function EmployeeLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on navigation for mobile
  useState(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [location]);

  return (
    <div className="bg-gray-100 min-h-screen flex">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:flex md:flex-shrink-0
          transition-transform duration-300 ease-in-out z-50
        `}
      >
        <EmpSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <EmpNavbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
