import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars, FaHome, FaUsers, FaChartBar, FaCalendarAlt,
} from "react-icons/fa";
import { MdTaskAlt } from "react-icons/md";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { MdSettings } from "react-icons/md";

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const menuItems = [
    { name: "Home", icon: <FaHome />, path: "/admin/dashboard" },
    { name: "Employee Management", icon: <FaUsers />, path: "/admin/dashboard/emp-management" },
    { name: "Reports", icon: <FaChartBar />, path: "/admin/dashboard/reports" },
    { name: "Task", icon: <MdTaskAlt />, path: "/admin/dashboard/task" },
    { name: "Leave Management", icon: <FaCalendarAlt />, path: "/admin/dashboard/leave" },
    { name: "Attendance Tracker", icon: <AccessTimeIcon />, path: "/admin/dashboard/attendance" },
    { name: "Salary Management", icon: <AttachMoneyIcon />, path: "/admin/dashboard/salary" },
    { name: "Settings", icon: <MdSettings/>, path: "/admin/dashboard/settings" },
  ];

  return (
    <div
      className={`h-screen bg-[#007fff] text-white fixed top-0 left-0 flex flex-col p-4 transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <button
        onClick={toggleSidebar}
        className="text-white mb-6 mr-4 self-end focus:outline-none"
      >
        <FaBars size={20} />
      </button>

      <h1 className="flex items-center justify-center gap-2 mb-8 font-bold text-white text-xl transition-all duration-300">
        <SupervisorAccountIcon />
        <span
          className={`transition-all duration-300 ${
            isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
          }`}
        >
          Admin
        </span>
      </h1>

      <ul className="flex flex-col gap-3">
        {menuItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                location.pathname === item.path
                  ? "bg-blue-500"
                  : "hover:bg-blue-400"
              }`}
            >
              {item.icon}
              <span
                className={`transition-all duration-300 ${
                  isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                {item.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminSidebar;