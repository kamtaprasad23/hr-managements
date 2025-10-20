import { Bell, Menu } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

export default function EmpNavbar({ onMenuClick }) {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchUser();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Effect to handle clicks outside the notification dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);

  async function fetchUser() {
    try {
      const res = await API.get("/profile");
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  }

  async function fetchNotifications() {
    try {
      const res = await API.get("/notifications"); // Fetch all notifications for the user
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role"); // Also remove role on logout
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center bg-white shadow-md px-4 md:px-8 py-3">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu for Mobile */}
        <button onClick={onMenuClick} className="md:hidden text-gray-600">
          <Menu size={24} />
        </button>
        <h1 className="text-lg md:text-xl font-bold text-blue-700">Employee Dashboard</h1>
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <p className="hidden sm:block text-gray-700 font-medium">
            👋 Welcome, <span className="text-blue-600">{user.name}</span>
          </p>
        ) : (
          <p className="text-gray-400 italic">Loading...</p>
        )}

        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-blue-600 cursor-pointer relative"
          >
            <Bell size={22} />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-10 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              {notifications.length === 0 ? (
                <p className="p-4 text-gray-500">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        API.put(`/notifications/mark-read`, { notificationId: notification._id }); // Use a generic endpoint
                        setNotifications(notifications.filter(n => 
                          n._id !== notification._id
                        ));
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        notification.priority === "Urgent" ? "bg-red-500" :
                        notification.priority === "High" ? "bg-orange-500" :
                        notification.priority === "Medium" ? "bg-yellow-500" : "bg-green-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          !notification.read ? "text-blue-600" : "text-gray-900"
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-1.5 rounded-lg shadow"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}