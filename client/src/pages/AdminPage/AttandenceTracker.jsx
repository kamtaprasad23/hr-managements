import React from "react";
import { useEffect, useState } from "react";
import API from "../../utils/api";
import {Close,Email,Phone, Visibility, CalendarMonth, People, CheckCircle, Cancel, AccessTime } from "@mui/icons-material";

import { toast, Toaster } from "react-hot-toast";

const AttendanceTracker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const attendanceSummary = [
    { title: "Total Employees", value: employees.length, icon: <People className="text-blue-500" /> },
    {
      title: "Present",
      value: employees.filter((e) => e.status === "Present").length,
      icon: <CheckCircle className="text-green-500" />,
    },
    {
      title: "Absent",
      value: employees.filter((e) => e.status === "Absent").length,
      icon: <Cancel className="text-red-500" />,
    },
    {
      title: "On Leave",
      value: employees.filter((e) => e.status === "On Leave").length,
      icon: <AccessTime className="text-yellow-500" />,
    },
  ];

  // useEffect(() => {
  //   const fetchAttendance = async () => {
  //     setLoading(true);
  //     try {
  //       console.log("🔄 Fetching attendance for date:", selectedDate.toISOString().split("T")[0]);
  //       const formattedDate = selectedDate.toISOString().split("T")[0];
  //       const res = await API.get(`/attendance?date=${formattedDate}`);
  //       console.log("✅ Attendance Response:", res.data);

  //       const formatted = res.data.map((a) => ({
  //         id: a.user?._id || "",
  //         name: a.user?.name || "Unknown",
  //         Department: a.user?.department || "-",
  //         status: a.status || "Absent",
  //         role: a.user?.role || "-",
  //         joinDate: a.user?.joinDate ? new Date(a.user.joinDate).toLocaleDateString() : "-",
  //         email: a.user?.email || "-",
  //         phone: a.user?.phone || "-",
  //         totalAttendance: a.user?.totalAttendance || 0,
  //         avgCheckIn: a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : "-",
  //         avgCheckOut: a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : "-",
  //         history: a.user?.history || [],
  //       }));
  //       setEmployees(formatted);
  //       setError("");
  //     } catch (err) {
  //       console.error("❌ Fetch Attendance Error:", err);
  //       setError(err.response?.data?.message || "Failed to fetch attendance");
  //       toast.error(err.response?.data?.message || "Failed to fetch attendance");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchAttendance();
  //   const interval = setInterval(fetchAttendance, 30000);

  //   return () => clearInterval(interval);
  // }, [selectedDate]);
useEffect(() => {
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const res = await API.get(`/attendance?date=${formattedDate}`);
      
      const formatted = res.data.map((a) => ({
        id: a.user?._id || "",
        name: a.user?.name || "Unknown",
        Department: a.user?.department || "-",
        status: a.status || "Absent",
        role: a.user?.role || "-",
        joinDate: a.user?.joinDate ? new Date(a.user.joinDate).toLocaleDateString() : "-",
        email: a.user?.email || "-",
        phone: a.user?.phone || "-",
        totalAttendance: a.user?.totalAttendance || 0,
        avgCheckIn: a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : "-",
        avgCheckOut: a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : "-",
        history: a.user?.history || [],
      }));
      
      setEmployees(formatted);
      setError("");
    } catch (err) {
      console.error("❌ Fetch Attendance Error:", err);
      setError(err.response?.data?.message || "Failed to fetch attendance");
      toast.error(err.response?.data?.message || "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  // 👇 Run only once when component mounts
  fetchAttendance();

}, []); // ← empty dependency array means run only once

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present": return "bg-green-100 text-green-800";
      case "Absent": return "bg-red-100 text-red-800";
      case "On Leave": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen  p-6">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold ">📅 Attendance Tracker</h1>
        <div>
          <label className="text-sm font-medium  mr-2">Select Date:</label>
          <input
            type="date"
            value={selectedDate.toISOString().split("T")[0]}
            onChange={handleDateChange}
            className="p-2 border  rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className=" border border-red-200 rounded-lg p-4 mb-4">
          <p className=" font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2  px-4 py-1 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="">Loading attendance data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {attendanceSummary.map((summary, index) => (
              <div
                key={index}
                className=" shadow rounded-lg p-4 flex items-center gap-4"
              >
                <div>{summary.icon}</div>
                <div>
                  <h3 className="text-sm font-medium ">{summary.title}</h3>
                  <p className="text-2xl font-semibold">{summary.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Attendance Table */}
          <div className=" shadow-lg rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold">Employee Attendance</h3>
              <p className=" mt-1">Total: {employees.length} employees</p>
            </div>
            {employees.length === 0 ? (
              <div className="p-8 text-center">
                <CalendarMonth className="mx-auto h-12 w-12 mb-4" />
                <p>No attendance data for this date</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                        Check-In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Check-Out
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className=" divide-y divide-gray-200">
                    {employees.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-400">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium ">{employee.name}</div>
                          <div className="text-sm ">{employee.role}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm ">
                          {employee.Department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              employee.status
                            )}`}
                          >
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {employee.avgCheckIn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm ">
                          {employee.avgCheckOut}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedEmployee(employee)}
                            className=" text-blue-600 hover:text-blue-900"
                          >
                            <Visibility fontSize="small" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-opacity-50 flex bg-gradient-to-r from-fuchsia-500 to-cyan-500 items-center justify-center z-50 p-4">
          <div className=" rounded-lg p-6 max-w-md w-full bg-white text-black">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Employee Details</h2>
              <button
                onClick={() => setSelectedEmployee(null)}
                className=" hover:text-gray-700"
              >
                <Close fontSize="small" />
              </button>
            </div>
            <div className="space-y-3">
              <p>
                <strong>Name:</strong> {selectedEmployee.name}
              </p>
              <p>
                <strong>Department:</strong> {selectedEmployee.Department}
              </p>
              <p>
                <strong>Role:</strong> {selectedEmployee.role}
              </p>
              <p>
                <strong>Join Date:</strong> {selectedEmployee.joinDate}
              </p>
              <p className="flex items-center gap-2">
                <Email fontSize="small" />
                <strong>Email:</strong> {selectedEmployee.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone fontSize="small" />
                <strong>Phone:</strong> {selectedEmployee.phone}
              </p>
              <p>
                <strong>Total Attendance:</strong> {selectedEmployee.totalAttendance}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    selectedEmployee.status
                  )}`}
                >
                  {selectedEmployee.status}
                </span>
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedEmployee(null)}
                className=" px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracker;