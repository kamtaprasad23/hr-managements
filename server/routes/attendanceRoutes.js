// backend/routes/attendanceRoutes.js
import express from "express";
import { verifyToken, adminOnly, employeeOnly } from "../middleware/authMiddleware.js";
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

// Admin
router.get("/all", verifyToken, adminOnly, getAllAttendance);
router.get("/summary", verifyToken, adminOnly, getAttendanceSummary);
router.get("/", verifyToken, adminOnly, getAttendance);

export default router;
