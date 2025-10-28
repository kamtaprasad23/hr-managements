// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import path from "path";
// import { fileURLToPath } from "url";

// import { port, mongourl } from "./config/config.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import employeeRoutes from "./routes/employeeRoutes.js";
// import attendanceRoutes from "./routes/attendanceRoutes.js";
// import notificationRoutes from "./routes/notificationRoutes.js";
// import leaveRoutes from "./routes/leaveRoutes.js";
// import salaryRoutes from "./routes/salaryRoutes.js";
// import taskRoutes from "./routes/taskRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import uploadRoutes from "./routes/uploadRoutes.js";


// const app = express();

// // Middlewares
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // MongoDB connection
// mongoose.connect(mongourl)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Error:", err));


// // Root route
// app.get("/", (req, res) => res.send("Attendance Management API Running 🚀"));

// // API Routes
// app.use("/api/admin", adminRoutes);
// app.use("/api", employeeRoutes);
// app.use("/api/attendance", attendanceRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/leave", leaveRoutes);
// app.use("/api/salary", salaryRoutes);
// app.use("/api/task", taskRoutes);
// app.use("/api/auth", userRoutes);
// app.use("/api/upload", uploadRoutes);



// // Start server
// app.listen(port, () => console.log(`✅ Server running on port ${port}`));


import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { port, mongourl } from "./config/config.js";

// routes
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

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB
mongoose
  .connect(mongourl)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// ----------------- Register API routes FIRST -----------------
app.get("/", (req, res) => res.send("🚀 Attendance Management API Running"));

// API routes (keep these before the frontend static / fallback)
app.use("/api/admin", adminRoutes);
app.use("/api", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/upload", uploadRoutes);

// static uploads (public files)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const frontendPath = path.join(__dirname, "../client/dist");

app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ----------------- Start server -----------------
const PORT = port || process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
