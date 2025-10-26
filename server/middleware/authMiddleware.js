
// // server/middleware/authMiddleware.js
// import jwt from "jsonwebtoken";
// import { jwtSecret } from "../config/config.js";

// // Verify JWT token
// export const verifyToken = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "No token provided" });

//   try {
//     const decoded = jwt.verify(token, jwtSecret);
//     req.user = decoded; // { id: ..., role: ... }
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

// // Admin-only routes
// export const adminOnly = (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ message: "Admin access required" });
//   }
//   next();
// };

// // Employee-only routes
// export const employeeOnly = (req, res, next) => {
//   if (req.user.role !== "employee") {
//     return res.status(403).json({ message: "Employee access required" });
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

// Ownership verification middleware
// model: Mongoose model
// paramId: req.params key for resource id (default 'id')
// userField: field in model representing admin/employee owner (default 'createdBy')
export const verifyOwnership = (model, paramId = "id", userField = "createdBy") => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params[paramId]);
      if (!resource) return res.status(404).json({ message: "Resource not found" });

      if (resource[userField].toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this resource" });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
};
