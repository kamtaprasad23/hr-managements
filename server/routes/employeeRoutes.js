
import express from "express";
import {
  getProfile,
  updateProfile,
  deleteProfileImg,
  loginEmployee,
  getEmployeeProfile,
  getEmployeeDashboard,
} from "../controllers/employeeController.js";
import {
  verifyToken,
  employeeOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/login", loginEmployee);

// Protected
router.get("/dashboard", verifyToken, employeeOnly, getEmployeeDashboard);
router.get("/profile", verifyToken, employeeOnly, getProfile);
router.put("/profile", verifyToken, employeeOnly, updateProfile);
router.delete("/profile-img", verifyToken, employeeOnly, deleteProfileImg);
router.get("/profile/:id", verifyToken, employeeOnly, getEmployeeProfile);

export default router;