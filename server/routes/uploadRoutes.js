import express from "express";
import upload from "../middleware/upload.js";

const router = express.Router();

// @route   POST /api/upload
// @desc    Upload a profile image
// @access  Private (you should add auth middleware)
router.post("/upload", upload.single("profileImage"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded." });
  }

  // The file is uploaded. You can now save the file path to the user's profile in the database.
  // The path is available at req.file.path
  res.status(200).json({
    message: "File uploaded successfully",
    filePath: `/${req.file.path.replace(/\\/g, "/")}`, // Standardize path for web
  });
});

export default router;

