import { NavLink } from "react-router-dom";
import { FaHome, FaUsers, FaChartBar, FaCalendarAlt } from "react-icons/fa";
import { MdTaskAlt, MdSettings } from "react-icons/md";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useSelector } from "react-redux";

export default function AdminSidebar({ isOpen }) {
  const isDarkMode = useSelector((state) => state.settings.isDarkMode);

  const menuItems = [
    { name: "Home", icon: <FaHome size={20} />, path: "/admin/dashboard" },
    { name: "Employee Management", icon: <FaUsers size={20} />, path: "/admin/dashboard/emp-management" },
    { name: "Reports", icon: <FaChartBar size={20} />, path: "/admin/dashboard/reports" },
    { name: "Task", icon: <MdTaskAlt size={20} />, path: "/admin/dashboard/task" },
    { name: "Leave", icon: <FaCalendarAlt size={20} />, path: "/admin/dashboard/leave" },
    { name: "Attendance", icon: <AccessTimeIcon style={{ fontSize: 20 }} />, path: "/admin/dashboard/attendance" },
    { name: "Salary", icon: <AttachMoneyIcon style={{ fontSize: 20 }} />, path: "/admin/dashboard/salary" },
    { name: "Settings", icon: <MdSettings size={20} />, path: "/admin/dashboard/settings" },
  ];

  return (
    <div className={`${isDarkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-700"} shadow-lg h-full flex flex-col gap-4 w-full p-4`}>
      {/* Sidebar Header */}
      <div className={`text-[#007fff] font-semibold border-b pb-2 mt-4 px-2 ${isDarkMode ? "border-gray-700" : "border-blue-500"}`}>
        Admin Panel
      </div>

      {/* Menu Items */}
      <div className="flex flex-col mt-2 gap-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : `${isDarkMode ? "hover:bg-gray-700 hover:text-white" : "hover:bg-gray-100 hover:text-blue-600"}`
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
