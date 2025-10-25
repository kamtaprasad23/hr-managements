import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sun, Moon, Bell, BellOff } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  toggleDarkMode,
  toggleEmailNotifications,
} from "../../features/auth/settingsSlice";
import API from "../../utils/api";

export default function AdminSettings() {
  const dispatch = useDispatch();
  const { isDarkMode, emailNotifications } = useSelector(
    (state) => state.settings
  );

  // Profile state
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Employee management state
  const [empId, setEmpId] = useState("");
  const [empName, setEmpName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [loadingEmp, setLoadingEmp] = useState(false);
  const [employees, setEmployees] = useState([]);

  // 🆕 Admin creation state
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [loadingAdminCreate, setLoadingAdminCreate] = useState(false);

  // ✅ Fetch employee list for dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await API.get("/admin/employees");
        setEmployees(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        toast.error("Unable to load employee list");
      }
    };
    fetchEmployees();
  }, []);

  // 🌙 Dark Mode toggle
  const handleDarkMode = () => {
    dispatch(toggleDarkMode());
    toast.success(!isDarkMode ? "Dark mode enabled" : "Light mode enabled");
  };

  // 🔔 Email Notifications toggle
  const handleNotifications = () => {
    dispatch(toggleEmailNotifications());
    toast.success(
      !emailNotifications
        ? "Notifications enabled"
        : "Notifications disabled"
    );
  };

  // 👤 Update Admin Profile (name, email, password)
  const handleProfileUpdate = async () => {
    if (!profileName && !profileEmail && !profilePassword) {
      toast.error("Enter new name, email, or password to update");
      return;
    }
    setLoadingProfile(true);
    try {
      const res = await API.put("/admin/profile", {
        name: profileName,
        email: profileEmail,
        password: profilePassword,
      });
      toast.success(res.data.message || "Profile updated successfully");
      setProfileName("");
      setProfileEmail("");
      setProfilePassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  // 👷 Update Employee Info (name, email, password)
  const handleEmployeeUpdate = async () => {
    if (!empId || (!empName && !empEmail && !empPassword)) {
      toast.error("Select employee and enter new name, email or password");
      return;
    }
    setLoadingEmp(true);
    try {
      const res = await API.put(`/admin/employee/${empId}`, {
        name: empName,
        email: empEmail,
        password: empPassword,
      });
      toast.success(res.data.message || "Employee updated successfully");
      setEmpId("");
      setEmpName("");
      setEmpEmail("");
      setEmpPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update employee");
    } finally {
      setLoadingEmp(false);
    }
  };

  // 🆕 Create New Admin
  const handleAdminCreate = async () => {
    if (!newAdminName || !newAdminEmail || !newAdminPassword) {
      toast.error("Please fill all admin fields");
      return;
    }
    setLoadingAdminCreate(true);
    try {
      const res = await API.post("/admin/create", {
        name: newAdminName,
        email: newAdminEmail,
        password: newAdminPassword,
      });
      toast.success(res.data.message || "New Admin created successfully");
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create new admin");
    } finally {
      setLoadingAdminCreate(false);
    }
  };

  return (
    <div
      className={`p-6 max-w-3xl mx-auto space-y-6 ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      } rounded-2xl shadow-2xl`}
    >
      <h1 className="text-2xl font-bold">Admin Settings</h1>

      {/* 🌙 Dark Mode Toggle */}
      <button
        className="w-full flex items-center justify-between p-4 dark:bg-gray-700 rounded-xl hover:shadow-md transition text-left"
        onClick={handleDarkMode}
      >
        <div className="flex items-center gap-3">
          {isDarkMode ? (
            <Moon className="text-yellow-400" />
          ) : (
            <Sun className="text-yellow-400" />
          )}
          <span className="font-medium">Dark Mode</span>
        </div>
        <span className="font-semibold">{isDarkMode ? "On" : "Off"}</span>
      </button>

      {/* 🔔 Email Notifications Toggle */}
      <button
        className="w-full flex items-center justify-between p-4 dark:bg-gray-700 rounded-xl hover:shadow-md transition text-left"
        onClick={handleNotifications}
      >
        <div className="flex items-center gap-3">
          {emailNotifications ? (
            <Bell className="text-blue-500" />
          ) : (
            <BellOff className="text-red-500" />
          )}
          <span className="font-medium">Email Notifications</span>
        </div>
        <span className="font-semibold">
          {emailNotifications ? "On" : "Off"}
        </span>
      </button>

      {/* 👤 Admin Profile Management */}
      <div className="p-4 dark:bg-gray-700 rounded-xl space-y-3">
        <h2 className="font-semibold text-lg">Admin Profile Management</h2>
        <input
          type="text"
          placeholder="New Name"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500 focus:outline-none"
          disabled={loadingProfile}
        />
        <input
          type="email"
          placeholder="New Email"
          value={profileEmail}
          onChange={(e) => setProfileEmail(e.target.value)}
          className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500 focus:outline-none"
          disabled={loadingProfile}
        />
        <input
          type="password"
          placeholder="New Password"
          value={profilePassword}
          onChange={(e) => setProfilePassword(e.target.value)}
          className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500 focus:outline-none"
          disabled={loadingProfile}
        />
        <button
          onClick={handleProfileUpdate}
          disabled={loadingProfile}
          className={`w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition ${
            loadingProfile ? "cursor-not-allowed bg-gray-400" : ""
          }`}
        >
          {loadingProfile ? "Updating..." : "Update Profile"}
        </button>
      </div>

      {/* 👷 Employee Credentials Management */}
     <div className="p-4 dark:bg-gray-700 rounded-xl space-y-3">
  <h2 className="font-semibold text-lg">Employee Credentials Management</h2>

  <select
    value={empId}
    onChange={(e) => setEmpId(e.target.value)}
    className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500 
               focus:outline-none hover:border-green-500 dark:hover:border-green-400 
               focus:border-green-500 dark:focus:border-green-400 
               transition duration-200 cursor-pointer"
    disabled={loadingEmp}
  >
    <option value="" className="text-gray-500 dark:text-gray-400">
      Select Employee
    </option>
    {employees.map((emp) => (
      <option
        key={emp._id}
        value={emp._id}
        className="bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 
                   hover:bg-green-100 dark:hover:bg-green-600 cursor-pointer 
                   transition-colors duration-150"
      >
        {emp.name} ({emp.email})
      </option>
    ))}
  </select>

  <input
    type="text"
    placeholder="New Employee Name"
    value={empName}
    onChange={(e) => setEmpName(e.target.value)}
    className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500 
               focus:outline-none hover:border-green-500 dark:hover:border-green-400 
               focus:border-green-500 dark:focus:border-green-400 
               transition duration-200"
    disabled={loadingEmp}
  />

  <input
    type="email"
    placeholder="New Employee Email"
    value={empEmail}
    onChange={(e) => setEmpEmail(e.target.value)}
    className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500 
               focus:outline-none hover:border-green-500 dark:hover:border-green-400 
               focus:border-green-500 dark:focus:border-green-400 
               transition duration-200"
    disabled={loadingEmp}
  />

  <input
    type="password"
    placeholder="New Employee Password"
    value={empPassword}
    onChange={(e) => setEmpPassword(e.target.value)}
    className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500 
               focus:outline-none hover:border-green-500 dark:hover:border-green-400 
               focus:border-green-500 dark:focus:border-green-400 
               transition duration-200"
    disabled={loadingEmp}
  />

  <button
    onClick={handleEmployeeUpdate}
    disabled={loadingEmp}
    className={`w-full py-2 bg-green-600 text-white rounded 
               transition-all duration-200 ${
                 loadingEmp
                   ? "cursor-not-allowed bg-gray-400"
                   : "hover:bg-green-700 hover:scale-[1.02] shadow-md"
               }`}
  >
    {loadingEmp ? "Updating..." : "Update Employee"}
  </button>
</div>


      {/* 🆕 Admin ID Creation Section */}
      <div className="p-4 dark:bg-gray-700 rounded-xl space-y-3">
        <h2 className="font-semibold text-lg">Create New Admin</h2>
        <input
          type="text"
          placeholder="Admin Name"
          value={newAdminName}
          onChange={(e) => setNewAdminName(e.target.value)}
          className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500 focus:outline-none"
          disabled={loadingAdminCreate}
        />
        <input
          type="email"
          placeholder="Admin Email"
          value={newAdminEmail}
          onChange={(e) => setNewAdminEmail(e.target.value)}
          className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500 focus:outline-none"
          disabled={loadingAdminCreate}
        />
        <input
          type="password"
          placeholder="Admin Password"
          value={newAdminPassword}
          onChange={(e) => setNewAdminPassword(e.target.value)}
          className="w-full p-2 rounded border dark:bg-gray-600 dark:border-gray-500 focus:outline-none"
          disabled={loadingAdminCreate}
        />
        <button
          onClick={handleAdminCreate}
          disabled={loadingAdminCreate}
          className={`w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition ${
            loadingAdminCreate ? "cursor-not-allowed bg-gray-400" : ""
          }`}
        >
          {loadingAdminCreate ? "Creating..." : "Create Admin"}
        </button>
      </div>
    </div>
  );
}
