import { NavLink } from "react-router-dom";

// FontAwesome
import { FaHome, FaUsers, FaChartBar, FaCalendarAlt } from "react-icons/fa";

// Material Design Icons
import { MdTaskAlt, MdSettings } from "react-icons/md";

// MUI Icons
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

export default function AdminSidebar({ isOpen }) {
  const menuItems = [
    { name: "Home", icon: <FaHome size={20} />, path: "/admin/dashboard" },
    {
      name: "Employee Management",
      icon: <FaUsers size={20} />,
      path: "/admin/dashboard/emp-management",
    },
    { name: "Reports", icon: <FaChartBar size={20} />, path: "/admin/dashboard/reports" },
    { name: "Task", icon: <MdTaskAlt size={20} />, path: "/admin/dashboard/task" },
    { name: "Leave", icon: <FaCalendarAlt size={20} />, path: "/admin/dashboard/leave" },
    {
      name: "Attendance",
      icon: <AccessTimeIcon style={{ fontSize: 20 }} />,
      path: "/admin/dashboard/attendance",
    },
    {
      name: "Salary",
      icon: <AttachMoneyIcon style={{ fontSize: 20 }} />,
      path: "/admin/dashboard/salary",
    },
    { name: "Settings", icon: <MdSettings size={20} />, path: "/admin/dashboard/settings" },
  ];

  return (
    <div className="bg-white shadow-lg h-full flex flex-col gap-4 w-64 p-4 fixed top-[64px]">
      {/* Sidebar Header */}
      <div className="text-[#007fff] text-lg font-semibold border-b pb-2 mt-4 px-2">
        Admin Panel
      </div>

      {/* Menu Items */}
      <div className="flex flex-col mt-2 gap-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                isActive ? "bg-[#007fff] text-white" : "text-gray-700 hover:text-[#007fff]"
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
