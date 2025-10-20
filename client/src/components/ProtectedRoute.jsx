import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token"); // JWT stored after login
  const userRole = localStorage.getItem("role"); // role stored after login

  if (!token) return <Navigate to="/" />; // not logged in

  if (role && role !== userRole) return <Navigate to="/" />; // role mismatch

  return children; // access granted
};

export default ProtectedRoute;
