// import express from "express";
// import {
//   registerAdmin,
//   loginAdmin,
//   createEmployee,
//   getAdminDashboardData,
//   getTotalEmployees,
// } from "../controllers/adminController.js";
// import { verifyToken } from "../middleware/authMiddleware.js";


// const router = express.Router();

// router.post("/register", registerAdmin);
// router.post("/login", loginAdmin);
// router.post("/create-employee", verifyToken, createEmployee);
// router.get("/dashboard", verifyToken, getAdminDashboardData);
// router.get("/total-employees", verifyToken, getTotalEmployees); // Updated route



// export default router;


// server/routes/adminRoutes.js
import express from "express";
import { verifyToken, adminOnly } from "../middleware/authMiddleware.js";
import {
  registerAdmin,
  loginAdmin,
  createEmployee,
  getAdminDashboardData as getAdminDashboard, // Rename import
  getTotalEmployees,
  getBirthdays,
  sendBirthdayWish,
  getAdminProfile
} from "../controllers/adminController.js";
import {
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
} from "../controllers/employeeController.js";

const router = express.Router();

// Public routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected routes
router.get("/me", verifyToken, adminOnly, getAdminProfile);
router.post("/employee", verifyToken, adminOnly, createEmployee);
router.get("/employee/:id", verifyToken, adminOnly, getEmployeeById);
router.put("/employee/:id", verifyToken, adminOnly, updateEmployee);
router.delete("/employee/:id", verifyToken, adminOnly, deleteEmployee);
router.get("/dashboard", verifyToken, adminOnly, getAdminDashboard); // Use the new alias
router.get("/employees", verifyToken, adminOnly, getTotalEmployees);
router.get("/birthdays", verifyToken, adminOnly, getBirthdays);
router.post("/birthday-wish/:employeeId", verifyToken, adminOnly, sendBirthdayWish);

export default router;
