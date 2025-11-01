
// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AdminForgotPassword from "./pages/AdminForgotPassword";

// Employee pages
import EmployeeLayout from "./Layout/EmployeeLayout";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmpAttendance from "./pages/employeePage/EmpAttendance";
import EmpTask from "./pages/employeePage/EmpTask";
import EmpLeave from "./pages/employeePage/EmpLeave";
import EmpProfile from "./pages/employeePage/EmpProfile";
import EmpSalaryslip from "./pages/employeePage/EmpSalaryslip";
import EmployeeSettings from "./pages/employeePage/EmpSetting";
// ... all imports

function App() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.settings.isDarkMode);

  useEffect(() => {
    const savedMode = localStorage.getItem("isDarkMode");
    if (savedMode !== null) dispatch(setDarkMode(savedMode === "true"));
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
      <Routes>
        {/* Public */}
        <Route path="/" element={<LoginSelection />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/employee-login" element={<EmployeeLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role={["admin", "hr", "manager"]}>
              <AdminDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="emp-management" element={<AdminEmpManagement />} />
          <Route path="employee/:id" element={<AdminEmployeeProfile />} />
          <Route path="reports" element={<AdminEmpReports />} />

          {/* Task Page - HR Blocked */}
          <Route
            path="task"
            element={
              <ProtectedRoute role={["admin", "manager"]} feature="task">
                <AdminTask />
              </ProtectedRoute>
            }
          />

          {/* Salary Page - Manager Blocked */}
          <Route
            path="salary"
            element={
              <ProtectedRoute role={["admin", "hr"]} feature="salary">
                <SalaryManagement />
              </ProtectedRoute>
            }
          />

          <Route path="leave" element={<AdminLeaveManagement />} />
          <Route path="attendance" element={<AttendanceTracker />} />
          <Route path="notification" element={<Notification />} />

          {/* Settings - All can access */}
          <Route path="settings" element={<AdminSettings />} />
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
    </div>
  );
}

export default App;