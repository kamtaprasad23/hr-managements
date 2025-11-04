import express from "express";
import { getMessages, sendMessage,deleteMessage,
  deleteChat, } from "../controllers/chatController.js";

const router = express.Router();

// ✅ Get all chat messages between two users
// Example: GET /api/chat/:user1/:user2
router.get("/:user1/:user2", getMessages);

// ✅ Send a new message
// Example: POST /api/chat
// Body: { senderId, receiverId, message }
router.post("/", sendMessage);

// 🧹 Delete single message
router.delete("/message/:messageId", deleteMessage);

// 🧺 Delete entire chat between 2 users
router.delete("/:user1/:user2", deleteChat);

export default router;
