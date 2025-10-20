// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import { port, mongourl } from "./config/config.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import employeeRoutes from "./routes/employeeRoutes.js";
// import attendanceRoutes from "./routes/attendanceRoutes.js";
// import notificationRoutes from "./routes/notificationRoutes.js";
// import leaveRoutes from "./routes/leaveRoutes.js";
// import salaryRoutes from "./routes/salaryRoutes.js";
// import taskRoutes from "./routes/taskRoutes.js"; // Added
// import userRoutes from "./routes/userRoutes.js";
// import path from "path";
// // import uploadRoutes from "./routes/upload.js";

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use("/uploads", express.static("uploads"));

// mongoose.connect(mongourl)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Error:", err));

// app.get("/", (req, res) => res.send("Attendance Management API Running 🚀"));

// // Routes
// app.use("/api/admin", adminRoutes);
// app.use("/api/", employeeRoutes);
// app.use("/api/attendance", attendanceRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/leave", leaveRoutes);
// app.use("/api/salary", salaryRoutes);
// app.use("/api/task", taskRoutes); // Added
// app.use("/api/auth", userRoutes);
// // app.use("/api", uploadRoutes);

// app.listen(port, () => console.log(`✅ Server running on port ${port}`));


import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { port, mongourl } from "./config/config.js";

import adminRoutes from "./routes/adminRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import salaryRoutes from "./routes/salaryRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose.connect(mongourl)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.get("/", (req, res) => res.send("Attendance Management API running 🚀"));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api", employeeRoutes); // Mount at /api to match frontend calls like /api/profile
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", uploadRoutes); // Mount at /api to match frontend call to /api/upload

app.listen(port, () => console.log(`Server running on port ${port}`));
