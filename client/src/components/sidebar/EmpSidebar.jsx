import { NavLink } from "react-router-dom";
import {
  Briefcase,
  Home as HomeIcon,
  User,
  Settings,
  BedSingle,
  IndianRupee,
  FileText,
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
    <div className="bg-white shadow-lg h-full flex flex-col gap-4 w-64 p-4">
      <div className="flex items-center text-[#007fff] text-lg font-semibold border-b pb-2 px-4 mt-5">
        <Briefcase size={22} className="min-w-[24px]" />
        <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2 whitespace-nowrap">
          My Dashboard
        </span>
      </div>

      <div className="flex flex-col mt-2 gap-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-[#007fff] text-white"
                  : "text-gray-700 hover:text-[#007fff]"
              }`
            }
          >
            <div className="min-w-[24px] flex justify-center">{item.icon}</div>
            <span className="whitespace-nowrap">
              {item.name}
            </span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}