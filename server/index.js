import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import { fileURLToPath } from "url";

import { port, mongourl } from "./config/config.js";

import adminRoutes from "./routes/adminRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import salaryRoutes from "./routes/salaryRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();
const app = express();

// ✅ Fix for __dirname
const __filename = fileURLToPath(import.meta.url);


// ✅ CORS setup (allow both local + deployed frontend)
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB connection
mongoose
  .connect(mongourl)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// ✅ API routes
app.use("/api/admin", adminRoutes);
app.use("/api", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/upload", uploadRoutes);



// ✅ Start server
const PORT = process.env.PORT || port || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
