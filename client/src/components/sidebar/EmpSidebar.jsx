import { NavLink } from "react-router-dom";
import {
  Home as HomeIcon,
  Briefcase,
  FileText,
  BedSingle,
  User,
  IndianRupee,
  Settings,
} from "lucide-react";

export default function EmpSidebar() {
  const menuItems = [
    { name: "Home", icon: <HomeIcon size={20} />, path: "/employee" },
    { name: "Attendance", icon: <Briefcase size={20} />, path: "/employee/attendance" },
    { name: "Tasks", icon: <FileText size={20} />, path: "/employee/tasks" },
    { name: "Leave", icon: <BedSingle size={20} />, path: "/employee/leave" },
    { name: "Profile", icon: <User size={20} />, path: "/employee/profile" },
    { name: "Salary Slip", icon: <IndianRupee size={20} />, path: "/employee/salary-slip" },
    { name: "Settings", icon: <Settings size={20} />, path: "/employee/setting" },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 shadow-lg h-full flex flex-col gap-6 w-64 p-4">
      {/* Header */}
      <div className="text-[#007fff] dark:text-[#3B82F6] text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-3 px-2">
        Employee Panel
      </div>

      {/* Menu Items */}
      <div className="flex flex-col mt-4 gap-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                isActive
                  ? "bg-[#007fff] text-white dark:bg-blue-600"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#007fff] dark:hover:text-white"
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
