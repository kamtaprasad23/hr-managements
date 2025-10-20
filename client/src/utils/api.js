import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Keep as is to support /api/profile, /api/upload-img, etc.
  // withCredentials: true, // If authentication is used
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;