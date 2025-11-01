// pages/AdminPage/AdminSettings.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sun, Moon, Bell, BellOff, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  toggleDarkMode,
  toggleEmailNotifications,
} from "../../features/auth/settingsSlice";
import API from "../../utils/api";

export default function AdminSettings() {
  const dispatch = useDispatch();
  const { isDarkMode, emailNotifications } = useSelector((state) => state.settings);
  const userRole = localStorage.getItem("role")?.toLowerCase();
  const isAdmin = userRole === "admin";

  // Profile
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showProfilePassword, setShowProfilePassword] = useState(false);

  // Employee
  const [empId, setEmpId] = useState("");
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [loadingEmp, setLoadingEmp] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [showEmpPassword, setShowEmpPassword] = useState(false);

  // HR/Manager Admin
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminRole, setAdminRole] = useState("hr");
  const [loadingAdminCreate, setLoadingAdminCreate] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Load data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/admin/me");
        setProfileName(res.data.name || "");
        setProfileEmail(res.data.email || "");
      } catch (err) {
        toast.error("Failed to load profile");
      }
    };

    const fetchEmployees = async () => {
      try {
        const res = await API.get("/admin/employees");
        setEmployees(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        toast.error("Failed to load employees");
      }
    };

    fetchProfile();
    fetchEmployees();
  }, []);

  // Prefill employee
  useEffect(() => {
    if (empId) {
      const emp = employees.find(e => e._id === empId);
      if (emp) {
        setEmpName(emp.name || "");
        setEmpEmail(emp.email || "");
        setEmpPassword("");
      }
    } else {
      setEmpName(""); setEmpEmail(""); setEmpPassword("");
    }
  }, [empId, employees]);

  // Toggles
  const handleDarkMode = () => {
    dispatch(toggleDarkMode());
    toast.success(isDarkMode ? "Light mode" : "Dark mode");
  };

  const handleNotifications = () => {
    dispatch(toggleEmailNotifications());
    toast.success(emailNotifications ? "Notifications off" : "Notifications on");
  };

  // Profile update
  const handleProfileUpdate = async () => {
    if (!profileName && !profileEmail && !profilePassword) {
      toast.error("Enter at least one field");
      return;
    }
    setLoadingProfile(true);
    try {
      await API.put("/admin/profile", { name: profileName, email: profileEmail, password: profilePassword });
      toast.success("Profile updated");
      setProfileName(""); setProfileEmail(""); setProfilePassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoadingProfile(false);
    }
  };

  // Employee update
  const handleEmployeeUpdate = async () => {
    if (!empId || (!empName && !empEmail && !empPassword)) {
      toast.error("Select employee & fill field");
      return;
    }
    setLoadingEmp(true);
    try {
      await API.put(`/admin/employee/${empId}`, { name: empName, email: empEmail, password: empPassword });
      toast.success("Employee updated");
      setEmpId(""); setEmpName(""); setEmpEmail(""); setEmpPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoadingEmp(false);
    }
  };

  // Create HR/Manager
  const handleCreateHRorManager = async () => {
    if (!adminName || !adminEmail || !adminPassword) {
      toast.error("Fill all fields");
      return;
    }
    setLoadingAdminCreate(true);
    try {
      await API.post("/admin/create-hr-manager", { name: adminName, email: adminEmail, password: adminPassword, role: adminRole });
      toast.success(`${adminRole.toUpperCase()} created`);
      setAdminName(""); setAdminEmail(""); setAdminPassword(""); setAdminRole("hr");
    } catch (err) {
      toast.error(err.response?.data?.message || "Create failed");
    } finally {
      setLoadingAdminCreate(false);
    }
  };

  return (
    <div className={`p-6 max-w-3xl mx-auto space-y-6 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"} rounded-2xl shadow-2xl`}>
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Dark Mode */}
      <button onClick={handleDarkMode} className="w-full flex items-center justify-between p-4 dark:bg-gray-700 rounded-xl hover:shadow-md">
        <div className="flex items-center gap-3">
          {isDarkMode ? <Moon className="text-yellow-400" /> : <Sun className="text-yellow-400" />}
          <span className="font-medium">Dark Mode</span>
        </div>
        <span className="font-semibold">{isDarkMode ? "On" : "Off"}</span>
      </button>

      {/* Notifications */}
      <button onClick={handleNotifications} className="w-full flex items-center justify-between p-4 dark:bg-gray-700 rounded-xl hover:shadow-md">
        <div className="flex items-center gap-3">
          {emailNotifications ? <Bell className="text-blue-500" /> : <BellOff className="text-red-500" />}
          <span className="font-medium">Email Notifications</span>
        </div>
        <span className="font-semibold">{emailNotifications ? "On" : "Off"}</span>
      </button>

      {/* ADMIN ONLY SECTIONS */}
      {isAdmin && (
        <>
          {/* Profile */}
          <div className="p-4 dark:bg-gray-700 rounded-xl space-y-3">
            <h2 className="font-semibold text-lg">Admin Profile</h2>
            <input type="text" placeholder="Name" value={profileName} onChange={e => setProfileName(e.target.value)} className="w-full p-2 rounded border dark:bg-gray-600" disabled={loadingProfile} />
            <input type="email" placeholder="Email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} className="w-full p-2 rounded border dark:bg-gray-600" disabled={loadingProfile} />
            <div className="relative">
              <input type={showProfilePassword ? "text" : "password"} placeholder="Password" value={profilePassword} onChange={e => setProfilePassword(e.target.value)} className="w-full p-2 rounded border dark:bg-gray-600 pr-10" disabled={loadingProfile} />
              <button type="button" onClick={() => setShowProfilePassword(!showProfilePassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showProfilePassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            <button onClick={handleProfileUpdate} disabled={loadingProfile} className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {loadingProfile ? "Updating…" : "Update"}
            </button>
          </div>

          {/* Employee Update */}
          <div className="p-4 dark:bg-gray-700 rounded-xl space-y-3">
            <h2 className="font-semibold text-lg">Update Employee</h2>
            <select value={empId} onChange={e => setEmpId(e.target.value)} className="w-full p-2 rounded border dark:bg-gray-600" disabled={loadingEmp}>
              <option value="">Select</option>
              {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
            </select>
            <input type="text" placeholder="Name" value={empName} onChange={e => setEmpName(e.target.value)} className="w-full p-2 rounded border dark:bg-gray-600" disabled={loadingEmp} />
            <input type="email" placeholder="Email" value={empEmail} onChange={e => setEmpEmail(e.target.value)} className="w-full p-2 rounded border dark:bg-gray-600" disabled={loadingEmp} />
            <div className="relative">
              <input type={showEmpPassword ? "text" : "password"} placeholder="Password" value={empPassword} onChange={e => setEmpPassword(e.target.value)} className="w-full p-2 rounded border dark:bg-gray-600 pr-10" disabled={loadingEmp} />
              <button type="button" onClick={() => setShowEmpPassword(!showEmpPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showEmpPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            <button onClick={handleEmployeeUpdate} disabled={loadingEmp} className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700">
              {loadingEmp ? "Updating…" : "Update"}
            </button>
          </div>

          {/* Create HR/Manager */}
          <div className="p-4 dark:bg-gray-700 rounded-xl space-y-3 border-l-4 border-purple-500">
            <h2 className="font-semibold text-lg text-purple-400">Create HR/Manager</h2>
            <input type="text" placeholder="Name" value={adminName} onChange={e => setAdminName(e.target.value)} className="w-full p-2 rounded border dark:bg-gray-600" disabled={loadingAdminCreate} />
            <input type="email" placeholder="Email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="w-full p-2 rounded border dark:bg-gray-600" disabled={loadingAdminCreate} />
            <div className="relative">
              <input type={showAdminPassword ? "text" : "password"} placeholder="Password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full p-2 rounded border dark:bg-gray-600 pr-10" disabled={loadingAdminCreate} />
              <button type="button" onClick={() => setShowAdminPassword(!showAdminPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showAdminPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            <select value={adminRole} onChange={e => setAdminRole(e.target.value)} className="w-full p-2 rounded border dark:bg-gray-600" disabled={loadingAdminCreate}>
              <option value="hr">HR</option>
              <option value="manager">Manager</option>
            </select>
            <button onClick={handleCreateHRorManager} disabled={loadingAdminCreate} className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              {loadingAdminCreate ? "Creating…" : "Create"}
            </button>
          </div>
        </>
      )}

      {/* HR / Manager: Only Dark + Notif */}
      {!isAdmin && (
        <p className="text-center text-sm text-gray-500">
          Only main admin can manage profiles and create HR/Manager.
        </p>
      )}
    </div>
  );
}