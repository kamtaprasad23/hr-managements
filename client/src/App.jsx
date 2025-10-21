import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setDarkMode } from "./features/auth/settingsSlice";

import ProtectedRoute from "./components/ProtectedRoute";

// Admin pages
import LoginSelection from "./pages/LoginSelection";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import EmployeeLogin from "./pages/EmployeeLogin";
import AdminDashboardLayout from "./Layout/AdminDashboardLayout";
import AdminHome from "./pages/AdminDashboard";
import AdminEmpManagement from "./pages/AdminPage/AdminEmployeeManagement";
import AdminEmpReports from "./pages/AdminPage/AdminEmployeeReports";
import AdminTask from "./pages/AdminPage/AdminTask";
import AdminLeaveManagement from "./pages/AdminPage/AdminLeaveManagement";
import AttendanceTracker from "./pages/AdminPage/AttandenceTracker";
import SalaryManagement from "./pages/AdminPage/SalaryManagement";
import AdminSettings from "./pages/AdminPage/AdminSettings";
import Notification from "./pages/AdminPage/Notification";
import AdminEmployeeProfile from "./pages/AdminPage/AdminEmployeeProfile";

// Employee pages
import EmployeeLayout from "./Layout/EmployeeLayout";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmpAttendance from "./pages/employeePage/EmpAttendance";
import EmpTask from "./pages/employeePage/EmpTask";
import EmpLeave from "./pages/employeePage/EmpLeave";
import EmpProfile from "./pages/employeePage/EmpProfile";
import EmpSalaryslip from "./pages/employeePage/EmpSalaryslip";
import EmployeeSettings from "./pages/employeePage/EmpSetting";

function App() {
 const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.settings.isDarkMode);

  // Load saved dark mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("isDarkMode");
    if (savedMode !== null) dispatch(setDarkMode(savedMode === "true"));
  }, [dispatch]);

  // Apply dark class to the HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
   <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginSelection />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-register" element={<AdminRegister />} />
          <Route path="/employee-login" element={<EmployeeLogin />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="emp-management" element={<AdminEmpManagement />} />
            <Route path="employee/:id" element={<AdminEmployeeProfile />} />
            <Route path="reports" element={<AdminEmpReports />} />
            <Route path="task" element={<AdminTask />} />
            <Route path="leave" element={<AdminLeaveManagement />} />
            <Route path="attendance" element={<AttendanceTracker />} />
            <Route path="salary" element={<SalaryManagement />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="notification" element={<Notification />} />
          </Route>

          {/* Employee Routes */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute role="employee">
                <EmployeeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmployeeDashboard />} />
            <Route path="attendance" element={<EmpAttendance />} />
            <Route path="tasks" element={<EmpTask />} />
            <Route path="leave" element={<EmpLeave />} />
            <Route path="profile" element={<EmpProfile />} />
            <Route path="salary-slip" element={<EmpSalaryslip />} />
            <Route path="setting" element={<EmployeeSettings />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
