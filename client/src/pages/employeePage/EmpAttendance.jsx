import React, { useState, useEffect } from "react";
import { LogIn, LogOut, Calendar, UserStar, Check } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";

export default function EmpAttendance() {
  // helper: local yyyy-mm-dd (uses user's local timezone)
  const getLocalDate = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // helper: normalize any date string/ISO from backend to local yyyy-mm-dd
  const toLocalDateStr = (dateLike) => {
    if (!dateLike) return null;
    const d = new Date(dateLike);
    if (isNaN(d)) {
      // if it's already date-only like "2025-10-19", try to return it directly
      const maybe = String(dateLike).split("T")[0];
      return maybe;
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const [loginTime, setLoginTime] = useState(null);
  const [checkoutTime, setCheckoutTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [history, setHistory] = useState([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [hasLoggedInToday, setHasLoggedInToday] = useState(false);

  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user && !token) navigate("/employee-login");
  }, [user, token, navigate]);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchHistory = async () => {
    try {
      const res = await API.get("/attendance/me");
      const arr = Array.isArray(res.data) ? res.data : [];
      // sort by date descending (robust)
      const sortedHistory = arr.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(sortedHistory);

      // Find record matching selectedDate using local-normalized date
      const todayRec = sortedHistory.find((r) => {
        const rDate = toLocalDateStr(r.date);
        return rDate === selectedDate;
      });

      if (todayRec) {
        setLoginTime(todayRec.login || null);
        setCheckoutTime(todayRec.logout || null);
        setHasLoggedInToday(!!todayRec.login);
      } else {
        setLoginTime(null);
        setCheckoutTime(null);
        setHasLoggedInToday(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching attendance records");
    }
  };

  const getRemark = (login, logout) => {
    if (!login || !logout) return "Incomplete";
    const [loginHour, loginMin] = login.split(":").map(Number);
    const [logoutHour, logoutMin] = logout.split(":").map(Number);
    const loginMins = loginHour * 60 + loginMin;
    const logoutMins = logoutHour * 60 + logoutMin;
    if (loginMins > 10 * 60 + 10) return "Late Login"; // After 10:10 AM
    if (logoutMins < 16 * 60) return "Half Day";
    if (logoutMins < 17 * 60 + 45) return "Early Checkout";
    return "Present";
  };

  const handleLogin = async () => {
    if (selectedDate !== getLocalDate()) {
      toast.error("Can only mark attendance for today");
      return;
    }

    if (hasLoggedInToday) {
      toast("✅ Already logged in today! No API call made.");
      return;
    }

    try {
      const now = new Date();
      const absentTime = new Date();
      absentTime.setHours(13, 30, 0, 0); // 1:30 PM

      if (now > absentTime) {
        toast.error("Cannot check-in after 1:30 PM. You will be marked absent.");
        return;
      }

      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setLoginTime(timeStr);

      await API.post("/attendance/checkin", { date: selectedDate, login: timeStr });
      toast.success(`✅ Logged in successfully at ${timeStr}`);
      setHasLoggedInToday(true);

      // Refresh history to sync with backend
      await fetchHistory();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to mark login");
      setLoginTime(null);
      setHasLoggedInToday(false);
    }
  };

  const handleCheckout = async () => {
    if (selectedDate !== getLocalDate()) {
      toast.error("Can only mark attendance for today");
      return;
    }
    try {
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setCheckoutTime(now);

      await API.post("/attendance/checkout", { date: selectedDate, logout: now });
      const remark = getRemark(loginTime, now);
      if (remark === "Half Day") toast.error("🟡 Half Day — checkout before 4:00 PM");
      else if (remark === "Early Checkout") toast("⚠️ Early checkout before 5:45 PM", { icon: "🕔" });
      else toast.success(`🕒 Checked out successfully at ${now}`);

      // Optimistically update local history and then re-fetch
      setHistory((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((r) => toLocalDateStr(r.date) === selectedDate);
        if (idx >= 0) {
          copy[idx] = { ...copy[idx], logout: now };
        } else {
          copy.unshift({ date: selectedDate, login: loginTime, logout: now });
        }
        return copy.sort((a, b) => new Date(b.date) - new Date(a.date));
      });

      await fetchHistory();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to mark checkout");
    }
  };

  if (!user && !token) return null;

  return (
    <div className="flex justify-center items-start w-full">
      <Toaster />
      <div className="w-full max-w-md sm:max-w-lg md:max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col items-center mb-6">
          <UserStar className="text-green-500 w-12 h-12 mb-2" />
          <h1 className="text-3xl font-bold text-center">Attendance Tracker</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm text-center mt-1">Mark your login & checkout time every day.</p>
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-2 font-medium mb-2 ">
            <Calendar className="text-[#007fff]" size={20} /> Select Date (View Only)
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#007fff] focus:outline-none"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={getLocalDate()}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button
            onClick={handleLogin}
            disabled={!!loginTime}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-2 rounded-lg font-semibold text-white transition ${loginTime ? "bg-green-400 dark:bg-green-700 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
          >
            <LogIn size={20} /> {loginTime ? "Logged In" : "Login"}
          </button>
          <button
            onClick={handleCheckout}
            disabled={!loginTime || !!checkoutTime}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-2 rounded-lg font-semibold text-white transition ${!loginTime || checkoutTime ? "bg-red-400 dark:bg-red-800 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
          >
            <LogOut size={20} /> {checkoutTime ? "Checked Out" : "Checkout"}
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
          <h2 className="text-lg font-semibold  mb-3 flex items-center gap-2">
            <Check className="text-green-600" /> Today’s Summary
          </h2>
          <div className="space-y-2 ">
            <p><span className="font-semibold">Date:</span> {selectedDate}</p>
            <p><span className="font-semibold">Login Time:</span> <span className={loginTime ? "text-green-600 font-medium" : ""}>{loginTime || "-"}</span></p>
            <p><span className="font-semibold">Checkout Time:</span> <span className={checkoutTime ? "text-red-600 font-medium" : ""}>{checkoutTime || "-"}</span></p>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setIsSummaryOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg font-semibold bg-[#007fff] hover:bg-blue-700 text-white w-full sm:w-auto"
          >
            <Check size={20} /> View Last 10 Days
          </button>
        </div>

        {isSummaryOpen && (
          <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 pt-20 px-4 overflow-auto">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md sm:max-w-lg rounded-xl shadow-xl p-6 relative">
              <h2 className="text-2xl font-bold mb-2">Attendance Summary</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Last 10 Days Overview</p>
              {history.length === 0 ? (
                <p className="text-center ">No records yet</p>
              ) : (
                <div className="space-y-2 overflow-x-auto">
                  {history.slice(0, 10).map((r, i) => {
                    const remark = getRemark(r.login, r.logout);
                    const color =
                      remark === "Late Login"
                        ? "text-red-500"
                        : remark === "Half Day"
                        ? "text-yellow-500"
                        : remark === "Early Checkout"
                        ? "text-red-400"
                        : remark === "Present"
                        ? "text-green-600"
                        : "text-gray-500";
                    return (
                      <div
                        key={i}
                        className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm sm:text-base"
                      >
                        <span className="font-medium  w-1/3">{toLocalDateStr(r.date)}</span>
                        <span className="text-green-600 font-semibold w-1/4">{r.login || "-"}</span>
                        <span className="text-red-600 font-semibold w-1/4">{r.logout || "-"}</span>
                        <span className={`font-semibold w-1/3 ${color}`}>{remark}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <button
                onClick={() => setIsSummaryOpen(false)}
                className="mt-6 w-full py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
