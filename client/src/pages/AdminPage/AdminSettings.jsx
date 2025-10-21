import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sun, Moon, Bell, BellOff, User, Key } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  toggleDarkMode,
  toggleEmailNotifications,
} from "../../features/auth/settingsSlice";
import API from "../../utils/api"; // your axios instance

export default function AdminSettings() {
  const dispatch = useDispatch();
  const { isDarkMode, emailNotifications } = useSelector(
    (state) => state.settings
  );

  // Profile state
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Employee management state
  const [empEmail, setEmpEmail] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [empId, setEmpId] = useState("");
  const [loadingEmp, setLoadingEmp] = useState(false);

  // Dark Mode toggle
  const handleDarkMode = () => {
    dispatch(toggleDarkMode());
    toast.success(!isDarkMode ? "Dark mode enabled" : "Light mode enabled");
  };

  // Email Notifications toggle
  const handleNotifications = () => {
    dispatch(toggleEmailNotifications());
    toast.success(
      `${!emailNotifications ? "Notifications enabled" : "Notifications disabled"}`
    );
  };

  // Update admin profile (email/password)
  const handleProfileUpdate = async () => {
    if (!profileEmail && !profilePassword) {
      toast.error("Enter new email or password to update");
      return;
    }
    setLoadingProfile(true);
    try {
      const res = await API.put("/admin/profile", {
        email: profileEmail,
        password: profilePassword,
      });
      toast.success(res.data.message || "Profile updated successfully");
      setProfileEmail("");
      setProfilePassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  // Update employee info (email/password)
  const handleEmployeeUpdate = async () => {
    if (!empId || (!empEmail && !empPassword)) {
      toast.error("Provide employee ID and new email or password");
      return;
    }
    setLoadingEmp(true);
    try {
      const res = await API.put(`/admin/employee/${empId}`, {
        email: empEmail,
        password: empPassword,
      });
      toast.success(res.data.message || "Employee updated successfully");
      setEmpEmail("");
      setEmpPassword("");
      setEmpId("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update employee");
    } finally {
      setLoadingEmp(false);
    }
  };

  return (
    <div className={`p-6 max-w-3xl mx-auto space-y-6 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"} rounded-2xl shadow-2xl`}>

      <h1 className="text-2xl font-bold">Admin Settings</h1>

      {/* Dark Mode */}
      <button
        className="w-full flex items-center justify-between p-4 dark:bg-gray-700 rounded-xl hover:shadow-md transition text-left"
        onClick={handleDarkMode}
      >
        <div className="flex items-center gap-3">
          {isDarkMode ? <Moon className="text-yellow-400" /> : <Sun className="text-yellow-400" />}
          <span className="font-medium">Dark Mode</span>
        </div>
        <span className="font-semibold">{isDarkMode ? "On" : "Off"}</span>
      </button>

      {/* Email Notifications */}
      <button
        className="w-full flex items-center justify-between p-4 dark:bg-gray-700 rounded-xl hover:shadow-md transition text-left"
        onClick={handleNotifications}
      >
        <div className="flex items-center gap-3">
          {emailNotifications ? <Bell className="text-blue-500" /> : <BellOff className="text-red-500" />}
          <span className="font-medium">Email Notifications</span>
        </div>
        <span className="font-semibold">{emailNotifications ? "On" : "Off"}</span>
      </button>

      {/* Admin Profile Management */}
      <div className="p-4 dark:bg-gray-700 rounded-xl space-y-3">
        <h2 className="font-semibold text-lg">Profile Management</h2>
        <input
          type="email"
          placeholder="New Email"
          value={profileEmail}
          onChange={(e) => setProfileEmail(e.target.value)}
          className="w-full p-2 rounded border  dark:bg-gray-600 dark:border-gray-500 focus:outline-none"
          disabled={loadingProfile}
        />
        <input
          type="password"
          placeholder="New Password"
          value={profilePassword}
          onChange={(e) => setProfilePassword(e.target.value)}
          className="w-full p-2 rounded border  dark:bg-gray-600 dark:border-gray-500 focus:outline-none"
          disabled={loadingProfile}
        />
        <button
          className={`w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition ${loadingProfile ? "cursor-not-allowed bg-gray-400" : ""}`}
          onClick={handleProfileUpdate}
          disabled={loadingProfile}
        >
          {loadingProfile ? "Updating..." : "Update Profile"}
        </button>
      </div>

    
    </div>
  );
}
