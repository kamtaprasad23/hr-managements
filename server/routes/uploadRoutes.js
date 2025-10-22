import express from "express";
import upload from "../middleware/upload.js";

const router = express.Router();


router.post("/upload", upload.single("profileImage"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded." });
  }

  res.status(200).json({
    message: "File uploaded successfully",
    filePath: `/${req.file.path.replace(/\\/g, "/")}`, // Standardize path for web
  });
});

export default router;

