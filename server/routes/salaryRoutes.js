// backend/routes/salaryRoutes.js
import express from "express";
import { 
  calculateSalary, 
  sendSalarySlip, 
  getSalarySlips, 
  getEmployeeSalarySlips 
} from "../controllers/salaryController.js";
import { verifyToken, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/calculate", verifyToken, adminOnly, calculateSalary);
router.post("/send", verifyToken, adminOnly, sendSalarySlip);
router.get("/", verifyToken, adminOnly, getSalarySlips);
router.get("/my-slips", verifyToken, getEmployeeSalarySlips);

export default router; 