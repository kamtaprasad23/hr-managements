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

// ✅ Import all routes
import adminRoutes from "./routes/adminRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import salaryRoutes from "./routes/salaryRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

// ✅ Load environment variables
dotenv.config();

// ✅ Initialize Express app FIRST
const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB Connection
mongoose
  .connect(mongourl)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err.message));

// ✅ Define Routes after app initialization
const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "dist"))); // vite build output folder

  // ✅ Fallback route for React (important fix)
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Attendance Management API Running 🚀");
  });
}

// ✅ API Routes
app.use("/api/admin", adminRoutes);
app.use("/api", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/upload", uploadRoutes);

// ✅ Static uploads

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));


// ✅ Start the server
app.listen(port || 5000, () =>
  console.log(`✅ Server running on port ${port || 5000}`)
);
