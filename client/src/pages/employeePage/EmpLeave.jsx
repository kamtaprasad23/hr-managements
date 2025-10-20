import React, { useState, useEffect } from "react";
import { Calendar, Check, X, PlusCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import API from "../../utils/api";

export default function LeaveCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState("");
  const [form, setForm] = useState({ date: "", reason: "" });
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [summary, setSummary] = useState({
    totalLeaves: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });

  const monthName = new Date(year, month).toLocaleString("default", {
    month: "long",
  });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Fetch leaves when component mounts
  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await API.get("/leave/");
      setLeaves(res.data || []);
    } catch (err) {
      toast.error("Error fetching leaves");
    }
  };

  const fetchLeaveSummary = async () => {
    try {
      const res = await API.get("/leave/summary");
      setSummary(res.data);
      setIsSummaryModalOpen(true);
    } catch (err) {
      toast.error("Error fetching leave summary");
    }
  };

  const handleDayClick = (day) => {
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split("T")[0];
    const isSunday = date.getDay() === 0;

    if (date < today) {
      toast.error("Cannot apply leave for past days!");
      return;
    }
    if (isSunday) {
      toast.error("Sunday is a week off!");
      return;
    }

    const existingLeave = leaves.find((l) => l.date === dateString);
    if (existingLeave) {
      toast(`Leave status: ${existingLeave.status}`, {
        icon:
          existingLeave.status === "Approved"
            ? "✅"
            : existingLeave.status === "Rejected"
            ? "❌"
            : "🕓",
      });
      return;
    }

    setForm({ date: dateString, reason: "" });
    setSelectedDate(dateString);
    setIsApplyModalOpen(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/leave/", form);

      // Send admin notification
      await API.post("/notifications/", {
        title: "New Leave Applied",
        message: `Employee applied leave on ${form.date}.`,
        type: "task",
        userId: "ADMIN_ID_HERE", // replace if needed
      });

      toast.success("Leave applied successfully");
      setIsApplyModalOpen(false);
      fetchLeaves();
      setForm({ date: "", reason: "" });
    } catch (err) {
      toast.error("Error applying leave");
    }
  };

  const getBadgeClasses = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-500 text-white";
      case "Rejected":
        return "bg-red-500 text-white";
      case "Pending":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalCells = daysInMonth + firstDayOfMonth;

    for (let i = 0; i < totalCells; i++) {
      if (i < firstDayOfMonth) {
        days.push(<div key={`empty-${i}`} className="h-20"></div>);
      } else {
        const day = i - firstDayOfMonth + 1;
        const date = new Date(year, month, day);
        const dateString = date.toISOString().split("T")[0];
        const isSunday = date.getDay() === 0;
        const leave = leaves.find((l) => l.date === dateString);

        days.push(
          <div
            key={day}
            onClick={() => handleDayClick(day)}
            className={`border rounded-xl h-20 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition ${
              isSunday ? "bg-gray-200" : "bg-white"
            }`}
          >
            <span className="font-semibold">{day}</span>
            {isSunday ? (
              <span className="mt-1 text-xs text-gray-600">WEEK OFF</span>
            ) : leave ? (
              <span
                className={`mt-1 px-2 py-1 rounded-full text-xs font-medium ${getBadgeClasses(
                  leave.status
                )}`}
              >
                {leave.status.toUpperCase()}
              </span>
            ) : (
              <span className="mt-1 text-xs text-gray-500">WORKING</span>
            )}
          </div>
        );
      }
    }
    return days;
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen rounded-2xl">
      <Toaster />

      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
        <Calendar /> {monthName} {year}
      </h1>
      <p className="text-gray-600 mb-6">Tap a date to apply or view leave</p>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center font-semibold mb-2 text-gray-700">
        <div className="hidden sm:block">Sunday</div><div className="sm:hidden">Sun</div>
        <div className="hidden sm:block">Monday</div><div className="sm:hidden">Mon</div>
        <div className="hidden sm:block">Tuesday</div><div className="sm:hidden">Tue</div>
        <div className="hidden sm:block">Wednesday</div><div className="sm:hidden">Wed</div>
        <div className="hidden sm:block">Thursday</div><div className="sm:hidden">Thu</div>
        <div className="hidden sm:block">Friday</div><div className="sm:hidden">Fri</div>
        <div className="hidden sm:block">Saturday</div><div className="sm:hidden">Sat</div>
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6 flex-wrap">
        <button
          onClick={() => {
            setForm({ date: today.toISOString().split("T")[0], reason: "" });
            setIsApplyModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#007fff] hover:bg-[#006ae0] text-white rounded-xl shadow-lg px-4 py-2 cursor-pointer transition-all text-sm sm:text-base"
        >
          <PlusCircle /> Apply Leave
        </button>

        <button
          onClick={fetchLeaveSummary}
          className="flex items-center gap-2 bg-black text-white rounded-xl shadow-lg px-4 py-2 cursor-pointer transition-all text-sm sm:text-base"
        >
          <Check /> Leave Summary
        </button>
      </div>

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4 transition-all">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setIsApplyModalOpen(false)}
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-4">Apply Leave</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="flex flex-col">
                <span className="font-medium text-gray-600">Select Date</span>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 mt-1 w-full"
                  min={today.toISOString().split("T")[0]}
                  required
                />
              </label>
              <label className="flex flex-col">
                <span className="font-medium text-gray-600">Reason</span>
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 mt-1 w-full"
                  rows={3}
                  required
                />
              </label>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="flex items-center gap-1 px-5 py-2 rounded-lg font-semibold bg-gray-400 hover:bg-gray-500 text-white"
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-5 py-2 rounded-lg font-semibold bg-[#007fff] hover:bg-blue-700 text-white"
                >
                  <Check size={16} /> Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Summary Modal */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4 transition-all">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setIsSummaryModalOpen(false)}
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-4">Leave Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Leaves:</span>
                <span className="font-semibold text-blue-700">
                  {summary.totalLeaves}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Approved:</span>
                <span className="font-semibold text-green-600">
                  {summary.approved}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rejected:</span>
                <span className="font-semibold text-red-600">
                  {summary.rejected}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Pending:</span>
                <span className="font-semibold text-yellow-600">
                  {summary.pending}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}