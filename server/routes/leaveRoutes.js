import express from "express";
import {
  getAllLeaves,
  updateLeave,
  deleteLeave,
  createLeave,
  getLeaveSummary,
  getMyLeaves, // ✅ Import getMyLeaves
} from "../controllers/leaveController.js";
import { verifyToken, adminOnly, employeeOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, employeeOnly, createLeave);
router.get("/me", verifyToken, employeeOnly, getMyLeaves); // ✅ Add route for employee to get their own leaves
router.get("/summary", verifyToken, employeeOnly, getLeaveSummary);
router.get("/", verifyToken, adminOnly, getAllLeaves); // Admin gets all leaves
router.put("/:id", verifyToken, adminOnly, updateLeave);
router.delete("/:id", verifyToken, adminOnly, deleteLeave);

export default router;
