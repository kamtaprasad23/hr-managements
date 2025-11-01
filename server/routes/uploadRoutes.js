
import express from "express";
import upload from "../middleware/uploadCloudinary.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/profile", verifyToken, upload.single("profileImage"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Multer + Cloudinary returns the file URL in req.file.path
    const fileUrl = req.file.path;

    // Optional: Save this URL to user's profile in DB
    // await User.findByIdAndUpdate(req.user._id, { profileImage: fileUrl });

    return res.status(200).json({ message: "Uploaded successfully", fileUrl });
  } catch (err) {
    console.error("Upload route error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
