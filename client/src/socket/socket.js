import { io } from "socket.io-client";

// Use environment variable or fallback
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5002";

// Ensure no trailing slash
const BASE_URL = SOCKET_URL.endsWith("/") ? SOCKET_URL.slice(0, -1) : SOCKET_URL;

// Load user/admin info from localStorage
const userData =
  JSON.parse(localStorage.getItem("employee")) ||
  JSON.parse(localStorage.getItem("admin")) ||
  null;

export const socket = io(BASE_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
  auth: {
    userId: userData?.id || userData?._id || null, // pass user ID to server
  },
  reconnection: true,
});

socket.on("connect", () => console.log("✅ Connected to socket:", socket.id));
socket.on("connect_error", (err) => console.error("❌ Socket connection error:", err.message));
socket.on("disconnect", (reason) => console.warn("🔴 Socket disconnected:", reason));

export default socket;
