import express from "express";
import upload from "../middleware/uploadCloudinary.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ...existing code...
router.post("/profile", verifyToken, upload.single("profileImage"), (req, res) => {
  try {
    console.log("UPLOAD REQ.user:", req.user?.id);
    console.log("UPLOAD req.file:", req.file);
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const fileUrl = req.file.path; // Cloudinary URL or local path
    return res.json({ message: "Uploaded successfully", fileUrl });
  } catch (err) {
    console.error("Upload route error:", err);
    return res.status(500).json({ message: err.message });
  }
});

export default router;
