import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../utils/api";
import { User, CalendarCheck, ClipboardList, FileText, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const reduxUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchUser();
    fetchRecords();
  }, []);

  async function fetchUser() {
    try {
      const res = await API.get("/profile");
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchRecords() {
    try {
      const res = await API.get("/attendance/me");
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good Morning"
      : today.getHours() < 17
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <div className="w-full p-4 md:p-6">
      {/* Greeting Card */}
      <div className="bg-blue-600 text-white rounded-xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold">
            {greeting}, {reduxUser?.name || user?.name || "Employee"} 👋
          </h2>
          <p className="text-sm md:text-base mt-2 text-blue-100">
            Welcome to your dashboard! Manage your profile, attendance, and tasks here.
          </p>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
        <Card icon={<User />} color="blue" title="Profile" text="View your profile info" path="/employee/profile" />
        <Card icon={<CalendarCheck />} color="green" title="Attendance" text="Check your attendance" path="/employee/attendance" />
        <Card icon={<ClipboardList />} color="red" title="Tasks" text="View and manage your tasks" path="/employee/tasks" />
        <Card icon={<Calendar />} color="purple" title="Leave" text="Apply or view leaves" path="/employee/leave" />
        <Card icon={<FileText />} color="yellow" title="Salary Slips" text="View salary details" path="/employee/salary-slip" />
      </div>
    </div>
  );
}

// Individual Card Component
function Card({ icon, color, title, text, path }) {
  const colorMap = {
    blue: "border-blue-500 text-blue-600",
    green: "border-green-500 text-green-600",
    red: "border-red-500 text-red-600",
    purple: "border-purple-500 text-purple-600",
    yellow: "border-yellow-500 text-yellow-600",
  };

  return (
    <Link to={path} className="w-full">
      <div
        className={`
          bg-white rounded-xl shadow-md p-5 flex items-center gap-4 border-l-4
          ${colorMap[color].split(" ")[0]} 
          cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300
        `}
      >
        <div className={`p-3 bg-gray-100 rounded-full ${colorMap[color].split(" ")[1]}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>
          <p className="text-sm text-gray-500">{text}</p>
        </div>
      </div>
    </Link>
  );
}
