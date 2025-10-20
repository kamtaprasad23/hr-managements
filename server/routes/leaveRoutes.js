import express from "express";
import {
  getAllLeaves,
  updateLeave,
  deleteLeave,
  createLeave,
  getLeaveSummary, // <--- Add this
} from "../controllers/leaveController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createLeave);
router.get("/", verifyToken, getAllLeaves);
router.get("/summary", verifyToken, getLeaveSummary); // <--- New route
router.put("/:id", verifyToken, updateLeave);
router.delete("/:id", verifyToken, deleteLeave);

export default router;
