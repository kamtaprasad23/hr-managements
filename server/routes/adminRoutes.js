
import express from "express";
import { verifyToken, adminOnly, allowAdminHrManager } from "../middleware/authMiddleware.js";

import {
  registerAdmin,
  loginAdmin,
  createEmployee,
  getAdminDashboardData as getAdminDashboard,
  getBirthdays,
  sendBirthdayWish,
  getAdminProfile,
  approveEmployeeUpdate,
  rejectEmployeeUpdate,
  updateAdminProfile,
  createHRorManager,
} from "../controllers/adminController.js";

import {
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
  getEmployees,
} from "../controllers/employeeController.js";

const router = express.Router();

// Public
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected
router.get("/me", verifyToken, getAdminProfile);

// Employee CRUD
router.post("/employee", verifyToken, allowAdminHrManager, createEmployee);
router.get("/employee/:id", verifyToken, allowAdminHrManager, getEmployeeById);
router.put("/employee/:id", verifyToken, allowAdminHrManager, updateEmployee);
router.delete("/employee/:id", verifyToken, adminOnly, deleteEmployee);

// Approval
router.put("/employee/:id/approve", verifyToken, adminOnly, approveEmployeeUpdate);
router.put("/employee/:id/reject", verifyToken, adminOnly, rejectEmployeeUpdate);

// Dashboard
router.get("/dashboard", verifyToken, allowAdminHrManager, getAdminDashboard);
router.get("/employees", verifyToken, allowAdminHrManager, getEmployees);
router.get("/birthdays", verifyToken, allowAdminHrManager, getBirthdays);
router.post("/birthday-wish/:employeeId", verifyToken, allowAdminHrManager, sendBirthdayWish);

// Profile
router.put("/profile", verifyToken, allowAdminHrManager, updateAdminProfile);

// Create HR/Manager
router.post("/create-hr-manager", verifyToken, adminOnly, createHRorManager);

export default router;