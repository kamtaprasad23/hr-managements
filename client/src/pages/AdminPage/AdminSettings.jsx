import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sun, Moon, Bell, BellOff } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  toggleDarkMode,
  toggleEmailNotifications,
} from "../../features/auth/settingsSlice";

export default function AdminSettings() {
  const dispatch = useDispatch();
  const { isDarkMode, emailNotifications } = useSelector(
    (state) => state.settings
  );

  const handleDarkMode = () => {
    dispatch(toggleDarkMode());
    toast.success(!isDarkMode ? "Dark mode enabled" : "Light mode enabled");
  };

  const handleNotifications = () => {
    dispatch(toggleEmailNotifications());
    toast.success(
      `${!emailNotifications ? "Notifications enabled" : "Notifications disabled"}`
    );
  };

  return (
    <div
      className={`p-6 max-w-2xl mx-auto ${
        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      } rounded-2xl shadow-2xl space-y-6`}
    >
      <h1 className="text-2xl font-bold">Admin Settings</h1>

      <div
        className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-xl cursor-pointer hover:shadow-md transition"
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
      </div>

      <div
        className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-xl cursor-pointer hover:shadow-md transition"
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
      </div>
    </div>
  );
}