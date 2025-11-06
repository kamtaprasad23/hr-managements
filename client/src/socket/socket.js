import { io } from "socket.io-client";

// 👇 Remove /api if your VITE_API_URL has it
let BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

// Ensure no trailing '/api'
if (BASE_URL.endsWith("/api")) {
  BASE_URL = BASE_URL.replace("/api", "");
}

console.log("Connecting socket to:", BASE_URL);

export const socket = io(BASE_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

socket.on("connect", () => console.log("✅ Connected to socket:", socket.id));
socket.on("connect_error", (err) => console.error("❌ Connection error:", err.message));
socket.on("disconnect", (reason) => console.warn("🔴 Disconnected from socket:", reason));