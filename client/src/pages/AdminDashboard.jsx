import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import { Gift, Cake, CalendarDays } from "lucide-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import dayjs from "dayjs";

export default function AdminHome() {
  const [dashboard, setDashboard] = useState({
    totalEmployees: 0,
    leaveReports: 0,
    attendance: { total: 0, onTime: 0, absent: 0, late: 0 },
    leaves: { pending: 0, approved: 0, rejected: 0 },
  });
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishesLoading, setWishesLoading] = useState({});
  const [error, setError] = useState("");
  const user = useSelector((state) => state.auth.user); // From Redux

  const attendanceGrid = Array(20)
    .fill("")
    .map(() => Math.floor(Math.random() * 200));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await API.get("/admin/dashboard");
        setDashboard({
          totalEmployees: data.totalEmployees || 0,
          attendance: data.attendance || { total: 0, onTime: 0, absent: 0, late: 0 },
          leaves: data.leaves || { pending: 0, approved: 0, rejected: 0 },
          leaveReports: data.leaves?.pending || 0, // Set leaveReports to pending count
        });
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const res = await API.get("/admin/birthdays");
        setBirthdays(res.data); // The server now sends only today's birthdays
      } catch (err) {
        console.error("Error fetching birthday data:", err);
      }
    };
    fetchBirthdays();
  }, []);

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good Morning"
      : today.getHours() < 17
      ? "Good Afternoon"
      : "Good Evening";

  const handleSendWishes = async (employeeId, employeeName) => {
    setWishesLoading(prev => ({ ...prev, [employeeId]: true }));
    try {
      await API.post(`/admin/birthday-wish/${employeeId}`);
      toast.success(`Birthday wish sent to ${employeeName}!`);
    } catch (err) {
      // Provide more specific feedback to the user.
      const errorMessage = err.response?.data?.message || "Failed to send birthday wish.";
      console.error("Error sending birthday wish:", err.response?.data || err.message);
      toast.error(errorMessage);
    } finally {
      setWishesLoading(prev => ({ ...prev, [employeeId]: false }));
    }
  };

  return (
    <main className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <h2 className="col-span-full text-2xl font-bold">{greeting}, {user?.name || "Admin"}</h2>
      {error && (
        <p className="text-red-600 text-center mb-4 bg-red-100 p-2 rounded col-span-full">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-600 text-center col-span-full">Loading...</p>
      ) : (
        <>
          {/* Total Employees Card */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-700">Total Employees</h3>
            <p className="text-3xl font-bold mt-4 text-gray-900">
              {dashboard.totalEmployees}
            </p>
            <Link to="/admin/dashboard/emp-management">
              <button className="mt-6 w-full bg-[#007fff] text-white py-2 rounded hover:bg-blue-700 transition-colors">
                View Details
              </button>
            </Link>
          </div>

          {/* Leave Reports Card */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-700">Leave Reports</h3>
            <p className="text-3xl font-bold mt-4 text-gray-900">
              {dashboard.leaveReports}
            </p>
            <Link to="/admin/dashboard/leave">
              <button className="mt-6 w-full bg-[#007fff] text-white py-2 rounded hover:bg-blue-700 transition-colors">
                View Details
              </button>
            </Link>
          </div>

          {/* Attendance Report */}
          <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-1">
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Attendance Report
            </h3>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <p className="text-2xl font-bold">{dashboard.attendance.total}</p>
                <p className="text-gray-500 text-sm">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{dashboard.attendance.onTime}</p>
                <p className="text-gray-500 text-sm">On Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{dashboard.attendance.absent}</p>
                <p className="text-gray-500 text-sm">Absent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{dashboard.attendance.late}</p>
                <p className="text-gray-500 text-sm">Late</p>
              </div>
            </div>

            <div className="grid grid-cols-10 gap-1 mt-4">
              {attendanceGrid.map((val, idx) => (
                <div
                  key={idx}
                  className="h-6 w-6 rounded"
                  style={{
                    backgroundColor: `rgb(0, 127, ${Math.min(
                      255,
                      Math.floor((val / 200) * 255)
                    )})`,
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Birthday Events Section */}
          <div className="col-span-full mt-10 bg-gradient-to-br from-pink-50 to-yellow-50 rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center text-pink-600 mb-10 flex items-center justify-center gap-2">
              <Cake className="text-pink-500 w-8 h-8" />
              Special Birthday Events 🎉
            </h1>

            {birthdays.length === 0 ? (
              <p className="text-center text-gray-500 text-lg">
                No birthday events found.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                {birthdays.map((person) => (
                  <div
                    key={person._id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 text-center border border-pink-100"
                  >
                    <img
                      src={person.image || "https://i.pravatar.cc/150"}
                      alt={person.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover shadow-md border-4 border-pink-200"
                    />
                    <h2 className="text-xl font-semibold mt-4 text-gray-800">
                      {person.name}
                    </h2>
                    <p className="text-sm text-gray-500 flex justify-center items-center gap-1 mt-1">
                      <CalendarDays className="w-4 h-4 text-pink-400" />{" "}
                      {person.date}
                    </p>
                    <p className="mt-4 text-gray-600 italic">"{person.message}"</p>

                    <button
                      onClick={() => handleSendWishes(person._id, person.name)}
                      disabled={wishesLoading[person._id]}
                      className="mt-6 bg-pink-500 text-white px-5 py-2 rounded-full flex items-center gap-2 mx-auto hover:bg-pink-600 transition-all duration-200 shadow-md"
                    >
                      <Gift className="w-4 h-4" /> 
                      {wishesLoading[person._id] ? "Sending..." : "Send Wishes"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}