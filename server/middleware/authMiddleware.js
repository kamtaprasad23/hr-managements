
// // // server/middleware/authMiddleware.js
// // import jwt from "jsonwebtoken";
// // import { jwtSecret } from "../config/config.js";

// // // Verify JWT token
// // export const verifyToken = (req, res, next) => {
// //   const token = req.headers.authorization?.split(" ")[1];
// //   if (!token) return res.status(401).json({ message: "No token provided" });

// //   try {
// //     const decoded = jwt.verify(token, jwtSecret);
// //     req.user = decoded; // { id: ..., role: ... }
// //     next();
// //   } catch (error) {
// //     res.status(401).json({ message: "Invalid token" });
// //   }
// // };

// // // Admin-only routes
// // export const adminOnly = (req, res, next) => {
// //   if (req.user.role !== "admin") {
// //     return res.status(403).json({ message: "Admin access required" });
// //   }
// //   next();
// // };

// // // Employee-only routes
// // export const employeeOnly = (req, res, next) => {
// //   if (req.user.role !== "employee") {
// //     return res.status(403).json({ message: "Employee access required" });
// //   }
// //   next();
// // };


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

// // Ownership verification middleware
// // model: Mongoose model
// // paramId: req.params key for resource id (default 'id')
// // userField: field in model representing admin/employee owner (default 'createdBy')
// export const verifyOwnership = (model, paramId = "id", userField = "createdBy") => {
//   return async (req, res, next) => {
//     try {
//       const resource = await model.findById(req.params[paramId]);
//       if (!resource) return res.status(404).json({ message: "Resource not found" });

//       if (resource[userField].toString() !== req.user.id) {
//         return res.status(403).json({ message: "Not authorized to access this resource" });
//       }

//       next();
//     } catch (error) {
//       res.status(500).json({ message: "Server error", error: error.message });
//     }
//   };
// };


// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/config.js";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);

    // Extract user info safely
    const userId = decoded.id || decoded._id || decoded.userId;
    const role = (decoded.role || decoded.roles || decoded.userRole || "").toLowerCase();

    if (!userId) {
      console.error("verifyToken: token missing user id payload", decoded);
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = { id: userId, role: role || "employee" };
    next();
  } catch (err) {
    console.error("verifyToken error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ✅ Case-insensitive role check
export const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if ((req.user.role || "").toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export const employeeOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if ((req.user.role || "").toLowerCase() !== "employee") {
    return res.status(403).json({ message: "Employee access required" });
  }
  next();
};

// Optional ownership middleware unchanged
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
      console.error("verifyOwnership error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
};
