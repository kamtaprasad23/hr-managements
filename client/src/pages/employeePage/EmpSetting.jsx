import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Sun, Moon, Bell, BellOff, User } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  toggleDarkMode,
  toggleEmailNotifications,
  toggleProfileVisibility,
} from "../../features/auth/settingsSlice";

export default function EmployeeSettings() {
  const dispatch = useDispatch();
  const { isDarkMode, notificationsEnabled, profilePublic } = useSelector(
    (state) => state.settings
  );

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gray-50 dark:bg-gray-800 dark:text-white rounded-2xl space-y-6">
      <h1 className="text-2xl font-bold">Employee Settings</h1>

      {/* Dark Mode */}
      <button
        onClick={() => {
          dispatch(toggleDarkMode());
          toast.success(!isDarkMode ? "Dark mode enabled" : "Light mode enabled");
        }}
        className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:shadow-md transition text-left"
      >
        <div className="flex items-center gap-3">
          {isDarkMode ? <Moon className="text-yellow-400" /> : <Sun className="text-yellow-400" />}
          <span className="font-medium">Dark Mode</span>
        </div>
        <span className="font-semibold">{isDarkMode ? "On" : "Off"}</span>
      </button>

      {/* Notifications */}
      <button
        onClick={() => {
          dispatch(toggleEmailNotifications());
          toast.success(`${!notificationsEnabled ? "Notifications enabled" : "Notifications disabled"}`);
        }}
        className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:shadow-md transition text-left"
      >
        <div className="flex items-center gap-3">
          {notificationsEnabled ? <Bell className="text-blue-500" /> : <BellOff className="text-red-500" />}
          <span className="font-medium">Notifications</span>
        </div>
        <span className="font-semibold">{notificationsEnabled ? "On" : "Off"}</span>
      </button>

      {/* Profile Visibility */}
      <button
        onClick={() => {
          dispatch(toggleProfileVisibility());
          toast.success(`Profile is now ${!profilePublic ? "Public" : "Private"}`);
        }}
        className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-xl hover:shadow-md transition text-left"
      >
        <div className="flex items-center gap-3">
          <User className="text-green-500" />
          <span className="font-medium">Profile Visibility</span>
        </div>
        <span className="font-semibold">{profilePublic ? "Public" : "Private"}</span>
      </button>
    </div>
  );
}
``
