import express from "express";
import {
  getMessages,
  sendMessage,
  deleteMessage,
  deleteChat,
} from "../controllers/chatController.js";
import upload from "../middleware/uploadCloudinary.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ===============================
   🔹 Core Chat Routes
================================= */

// ✅ Get all chat messages between two users
// GET /api/chat/:user1/:user2
router.get("/:user1/:user2", verifyToken, getMessages);

// ✅ Send a new message
// POST /api/chat
// Body: { senderId, receiverId, message }
router.post("/", verifyToken, sendMessage);

// ✅ Delete a single message
// DELETE /api/chat/message/:messageId
router.delete("/message/:messageId", verifyToken, deleteMessage);

// ✅ Delete entire chat between 2 users
// DELETE /api/chat/:user1/:user2
router.delete("/:user1/:user2", verifyToken, deleteChat);

/* ===============================
   🔹 File Upload Route (Cloudinary)
================================= */

// ✅ Upload chat image or document
// POST /api/chat/upload
router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // Cloudinary returns URL in req.file.path
    const fileUrl = req.file.path;

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      file: {
        url: fileUrl,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (err) {
    console.error("❌ Chat upload error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to upload file",
      error: err.message,
    });
  }
});

export default router;
