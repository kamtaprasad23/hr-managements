import express from "express";
import { getMessages, sendMessage, deleteMessage, deleteChat } from "../controllers/chatController.js";
import upload from "../middleware/uploadCloudinary.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import path from "path";

const router = express.Router();

// ✅ File upload route (must be before dynamic routes)
router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    return res.status(200).json({
      success: true,
      file: {
        url: req.file.path,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ success: false, message: "Upload failed", error: err.message });
  }
});

// ✅ Core chat routes
router.get("/:user1/:user2", verifyToken, getMessages);
router.post("/", verifyToken, upload.single("file"), sendMessage);
router.delete("/message/:messageId", verifyToken, deleteMessage);
router.delete("/:user1/:user2", verifyToken, deleteChat);

export default router;
