// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { Provider } from "react-redux";
// import { store } from "./app/store";
// import LoginSelection from "./pages/LoginSelection";
// import AdminLogin from "./pages/AdminLogin";
// import AdminRegister from "./pages/AdminRegister";
// import EmployeeLogin from "./pages/EmployeeLogin";
// import AdminDashboardLayout from "./Layout/AdminDashboardLayout";
// import AdminHome from "./pages/AdminDashboard";
// import AdminEmpManagement from "./pages/AdminPage/AdminEmployeeManagement";
// import AdminEmpReports from "./pages/AdminPage/AdminEmployeeReports";
// import AdminTask from "./pages/AdminPage/AdminTask";
// import AdminLeaveManagement from "./pages/AdminPage/AdminLeaveManagement";
// import AttendanceTracker from "./pages/AdminPage/AttandenceTracker";
// import SalaryManagement from "./pages/AdminPage/SalaryManagement";
// import AdminSettings from "./pages/AdminPage/AdminSettings";
// import Notification from "./pages/AdminPage/Notification";
// import EmployeeLayout from "./Layout/EmployeeLayout";
// import EmployeeDashboard from "./pages/EmployeeDashboard";
// import EmpAttendance from "./pages/employeePage/EmpAttendance";
// import EmpTask from "./pages/employeePage/EmpTask";
// import EmpLeave from "./pages/employeePage/EmpLeave";
// import EmpProfile from "./pages/employeePage/EmpProfile";
// import EmpSalaryslip from "./pages/employeePage/EmpSalaryslip";
// import EmployeeSettings from "./pages/employeePage/EmpSetting";
// import AdminEmployeeProfile from "./pages/AdminPage/AdminEmployeeProfile"; // New

// import { useSelector } from "react-redux";

// function App() {
//   const isDarkMode = useSelector((state) => state.settings.isDarkMode);

//   return (
//     <Provider store={store}>
//       <div className={isDarkMode ? "dark" : ""}>
//         <Router>
//           <Routes>
//             <Route path="/" element={<LoginSelection />} />
//             <Route path="/admin-login" element={<AdminLogin />} />
//             <Route path="/admin-register" element={<AdminRegister />} />
//             <Route path="/employee-login" element={<EmployeeLogin />} />
//             <Route path="/admin/dashboard/*" element={<AdminDashboardLayout />}>
//               <Route index element={<AdminHome />} />
//               <Route path="emp-management" element={<AdminEmpManagement />} /> {/* Relative path */}
//               <Route path="employee/:id" element={<AdminEmployeeProfile />} /> {/* Relative path */}
//               <Route path="reports" element={<AdminEmpReports />} />
//               <Route path="task" element={<AdminTask />} />
//               <Route path="leave" element={<AdminLeaveManagement />} />
//               <Route path="attendance" element={<AttendanceTracker />} />
//               <Route path="salary" element={<SalaryManagement />} />
//               <Route path="settings" element={<AdminSettings />} />
//               <Route path="notification" element={<Notification />} />
//             </Route>
//             <Route path="/employee/*" element={<EmployeeLayout />}>
//               <Route index element={<EmployeeDashboard />} />
//               <Route path="attendance" element={<EmpAttendance />} />
//               <Route path="tasks" element={<EmpTask />} />
//               <Route path="leave" element={<EmpLeave />} />
//               <Route path="profile" element={<EmpProfile />} />
//               <Route path="salary-slip" element={<EmpSalaryslip />} />
//               <Route path="setting" element={<EmployeeSettings />} />
//             </Route>
//           </Routes>
//         </Router>
//       </div>
//     </Provider>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { store } from "./app/store";

import ProtectedRoute from "./components/ProtectedRoute";

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

import EmployeeLayout from "./Layout/EmployeeLayout";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmpAttendance from "./pages/employeePage/EmpAttendance";
import EmpTask from "./pages/employeePage/EmpTask";
import EmpLeave from "./pages/employeePage/EmpLeave";
import EmpProfile from "./pages/employeePage/EmpProfile";
import EmpSalaryslip from "./pages/employeePage/EmpSalaryslip";
import EmployeeSettings from "./pages/employeePage/EmpSetting";

function App() {
  const isDarkMode = useSelector((state) => state.settings.isDarkMode);

  return (
    <Provider store={store}>
      <div className={isDarkMode ? "dark" : ""}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LoginSelection />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-register" element={<AdminRegister />} />
            <Route path="/employee-login" element={<EmployeeLogin />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard/*"
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
              path="/employee/*"
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
    </Provider>
  );
}

export default App;
