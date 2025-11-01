
import express from "express";
import { verifyToken, allowAdminHrManager, employeeOnly } from "../middleware/authMiddleware.js";
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getAttendanceSummary,
  getAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

// Employee
router.post("/checkin", verifyToken, employeeOnly, checkIn);
router.post("/checkout", verifyToken, employeeOnly, checkOut);
router.get("/me", verifyToken, employeeOnly, getMyAttendance);

// Admin/HR/Manager
router.get("/all", verifyToken, allowAdminHrManager, getAllAttendance);
router.get("/summary", verifyToken, allowAdminHrManager, getAttendanceSummary);
router.get("/", verifyToken, allowAdminHrManager, getAttendance);

export default router;