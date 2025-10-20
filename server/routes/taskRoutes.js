import express from "express";
import { 
  createTask, 
  getAdminTasks, 
  getEmployeeTasks, 
  updateTaskStatus, 
  getTaskNotifications, 
  markNotificationAsRead 
} from "../controllers/taskController.js";
import { verifyToken, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, adminOnly, createTask);
router.get("/admin", verifyToken, adminOnly, getAdminTasks);
router.get("/employee", verifyToken, getEmployeeTasks);
router.put("/:id/status", verifyToken, updateTaskStatus);
router.get("/notifications", verifyToken, getTaskNotifications);
router.put("/notifications/:id/read", verifyToken, markNotificationAsRead);

export default router;