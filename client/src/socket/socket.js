// src/socket/socket.js
import { io } from "socket.io-client";

// ⚠️ Replace this with your actual backend URL
export const socket = io("https:localhost:5002", {
  transports: ["websocket"],
  withCredentials: true,
});
