// import jwt from "jsonwebtoken";
// import { jwtSecret } from "../config/config.js";

// export const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   console.log("🔑 Verifying token:", token ? "Present" : "Missing");
//   if (!token) {
//     console.log("❌ No token provided");
//     return res.status(401).json({ message: "No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, jwtSecret);
//     console.log("✅ Token decoded:", decoded);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     console.error("❌ Invalid token:", error.message);
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

// export const adminOnly = (req, res, next) => {
//   console.log("🔍 Checking admin role:", req.user);
//   if (req.user.role !== "admin") {
//     console.log("❌ Admin access required, user role:", req.user.role);
//     return res.status(403).json({ message: "Admin access required" });
//   }
//   next();
// };

// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/config.js";

// Verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // { id: ..., role: ... }
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Admin-only routes
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Employee-only routes
export const employeeOnly = (req, res, next) => {
  if (req.user.role !== "employee") {
    return res.status(403).json({ message: "Employee access required" });
  }
  next();
};
