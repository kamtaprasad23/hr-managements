

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import API from "../utils/api";
import toast from "react-hot-toast";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchUser();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
   
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
     
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);

  // Fetch logged-in admin info
  const fetchUser = async () => {
    try {
      const res = await API.get("/admin/me");
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching admin info:", err);
    }
  };

  // Fetch admin notifications
  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role"); 
    navigate("/");
  };

  const handleNotificationClick = async (event, notification) => {
    event.preventDefault();
    event.stopPropagation();

    setNotifications(prev => prev.filter(n => n._id !== notification._id));

    try {
      await API.delete(`/notifications/${notification._id}`);
      
      if (notification.link && notification.link !== "#") {
        navigate(notification.link);
      }
      
      if (notification.link && notification.link !== "#") {
        setShowNotifications(false);
      }
    } catch (err) {
      console.error("Failed to delete notification", err);
      toast.error("Failed to clear notification.");
      // Re-fetch if the API call fails
      fetchNotifications();
    }
  };

  return (
    <header className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-lg shadow-md relative">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="flex items-center gap-4">
        {user && (
          <p className="text-white font-medium">👋 Welcome, {user.name}</p>
        )}

        {/* Notification Bell */}
        <div className="relative fixes z-10" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-white text-xl relative"
            title="Notifications"
          >
            <Bell />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-lg shadow-lg border z-20 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              {notifications.length === 0 ? (
                <p className="p-4 text-gray-500">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <a
                    key={notification._id}
                    href={notification.link || '#'}
                    onClick={(e) => handleNotificationClick(e, notification)}
                    className={`block p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
                  >
                    <p className={`text-sm font-medium ${!notification.read ? "text-blue-600" : "text-gray-900"}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </a>
                ))
              )}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
