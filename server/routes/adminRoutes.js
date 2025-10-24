
// server/routes/adminRoutes.js
import express from "express";
import { verifyToken, adminOnly } from "../middleware/authMiddleware.js";
import {
  registerAdmin,
  loginAdmin,
  createEmployee,
  getAdminDashboardData as getAdminDashboard, // Rename import
  getBirthdays,
  sendBirthdayWish,
  getAdminProfile,
  approveEmployeeUpdate,
  rejectEmployeeUpdate
} from "../controllers/adminController.js";
import {
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
  getEmployees, // Import the correct function
} from "../controllers/employeeController.js";
import { updateAdminProfile } from "../controllers/adminController.js";
const router = express.Router();

// Public routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected routes
router.get("/me", verifyToken, adminOnly, getAdminProfile);
router.post("/employee", verifyToken, adminOnly, createEmployee);
router.get("/employee/:id", verifyToken, adminOnly, getEmployeeById); // Moved here for consistency
router.put("/employee/:id", verifyToken, adminOnly, updateEmployee); 
router.delete("/employee/:id", verifyToken, adminOnly, deleteEmployee); // This is for deleting employees
router.put("/employee/:id/approve", verifyToken, adminOnly, approveEmployeeUpdate);
router.put("/employee/:id/reject", verifyToken, adminOnly, rejectEmployeeUpdate);
router.get("/dashboard", verifyToken, adminOnly, getAdminDashboard); // Use the new alias
router.get("/employees", verifyToken, adminOnly, getEmployees); // Use the correct function
router.get("/birthdays", verifyToken, adminOnly, getBirthdays);
router.post("/birthday-wish/:employeeId", verifyToken, adminOnly, sendBirthdayWish);
router.put("/profile", verifyToken, adminOnly, updateAdminProfile);

export default router;
