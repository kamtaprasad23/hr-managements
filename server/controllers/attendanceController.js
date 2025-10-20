// import Attendance from "../models/attendanceModel.js";
// import dayjs from "dayjs";
// import Employee from "../models/employeeModel.js";

// // --- Haversine formula (for location distance check) ---
// const toRad = (v) => (v * Math.PI) / 180;
// const haversine = (lat1, lng1, lat2, lng2) => {
//   const R = 6371; // km
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lng2 - lng1);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// };
// // --- Utility: Calculate status based on login/logout time ---
// const getRemark = (login, logout) => {
//   if (!login || !logout) return "Incomplete";

//   const [loginHour, loginMin] = login.split(":").map(Number);
//   const [logoutHour, logoutMin] = logout.split(":").map(Number);
//   const loginMins = loginHour * 60 + loginMin;
//   const logoutMins = logoutHour * 60 + logoutMin;

//   if (loginMins > 10 * 60 + 15) return "Late Login";
//   if (logoutMins < 16 * 60) return "Half Day";
//   if (logoutMins < 17 * 60 + 45) return "Early Checkout";
//   return "Present";
// };
// // ===================== CHECK-IN =====================
// export const checkIn = async (req, res) => {
//   try {
//     const { lat, lng, accuracy, date, login } = req.body;

//     const officeLat = parseFloat(process.env.OFFICE_LAT) || 22.8080;
//     const officeLng = parseFloat(process.env.OFFICE_LNG) || 75.9055;
//     const radius = parseFloat(process.env.OFFICE_RADIUS_KM) || 0.2;

//     if (lat && lng) {
//       const dist = haversine(lat, lng, officeLat, officeLng);
//       if (dist > radius) {
//         return res.status(403).json({
//           message: `You are ${dist.toFixed(2)} km away from the office. Move within ${radius} km to check in.`,
//         });
//       }
//     }

//     const today = dayjs(date).startOf("day").toDate();
//     let att = await Attendance.findOne({ user: req.user.id, date: today });

//     if (att && att.login) {
//       return res.status(400).json({ message: "Already checked in today" });
//     }

//     const now = new Date();
//     const timeStr = login || now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

//     if (!att) {
//       att = new Attendance({
//         user: req.user.id,
//         date: today,
//         checkIn: now,
//         checkInLocation: lat && lng ? { lat, lng, accuracy: accuracy || null } : null,
//         login: timeStr,
//       });
//     } else {
//       att.checkIn = now;
//       att.checkInLocation = lat && lng ? { lat, lng, accuracy: accuracy || null } : att.checkInLocation;
//       att.login = timeStr;
//     }

//     // Late check
//     const officeStart = dayjs().hour(9).minute(0);
//     att.status = dayjs(now).isAfter(officeStart.add(15, "minute")) ? "Late" : "Present";
//     att.remark = att.status;

//     await att.save();
//     res.json({ message: "Checked in successfully", att });
//   } catch (err) {
//     console.error("Check-in error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };
// // ===================== CHECK-OUT =====================
// export const checkOut = async (req, res) => {
//   try {
//     const { lat, lng, accuracy, date, logout } = req.body;

//     const officeLat = parseFloat(process.env.OFFICE_LAT) || 22.8080;
//     const officeLng = parseFloat(process.env.OFFICE_LNG) || 75.9055;
//     const radius = parseFloat(process.env.OFFICE_RADIUS_KM) || 0.2;

//     if (lat && lng) {
//       const dist = haversine(lat, lng, officeLat, officeLng);
//       if (dist > radius) {
//         return res.status(403).json({
//           message: `You are ${dist.toFixed(2)} km away from the office. Move within ${radius} km to check out.`,
//         });
//       }
//     }

//     const today = dayjs(date).startOf("day").toDate();
//     let att = await Attendance.findOne({ user: req.user.id, date: today });

//     if (!att || !att.login) {
//       return res.status(400).json({ message: "No check-in found for today" });
//     }

//     if (att.logout) {
//       return res.status(400).json({ message: "Already checked out today" });
//     }

//     const now = new Date();
//     const timeStr = logout || now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

//     att.checkOut = now;
//     att.checkOutLocation = lat && lng ? { lat, lng, accuracy: accuracy || null } : att.checkOutLocation;
//     att.logout = timeStr;

//     // total hours calculation
//     const diffMs = new Date(att.checkOut) - new Date(att.checkIn);
//     att.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

//     // set remark/status
//     att.remark = getRemark(att.login, att.logout);
//     att.status = att.remark;

//     await att.save();
//     res.json({ message: "Checked out successfully", att });
//   } catch (err) {
//     console.error("Check-out error:", err);
//     res.status(500).json({ message: err.message });
//   }
// };
// // ===================== GET MY ATTENDANCE =====================
// export const getMyAttendance = async (req, res) => {
//   try {
//     const records = await Attendance.find({ user: req.user.id }).sort({ date: -1 });
//     res.json(records);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
// // ===================== ADMIN: GET ALL =====================
// export const getAllAttendance = async (req, res) => {
//   try {
//     if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
//     const records = await Attendance.find()
//       .populate("user", "name email role")
//       .sort({ date: -1 });
//     res.json(records);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
// // ===================== SUMMARY =====================
// export const getAttendanceSummary = async (req, res) => {
//   try {
//     const totalEmployees = await Employee.countDocuments();
//     const today = dayjs().startOf("day").toDate();
//     const tomorrow = dayjs(today).add(1, "day").toDate();

//     const attendance = await Attendance.find({ date: { $gte: today, $lt: tomorrow } });
//     const onTime = attendance.filter((a) => a.status === "Present").length;
//     const late = attendance.filter((a) => a.status === "Late" || a.status === "Late Login").length;
//     const absent = totalEmployees - attendance.length;

//     res.json({ total: totalEmployees, onTime, late, absent });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
// // ===================== GET BY DATE =====================
// export const getAttendance = async (req, res) => {
//   try {
//     const { date } = req.query;
//     const queryDate = date ? dayjs(date).startOf("day").toDate() : dayjs().startOf("day").toDate();
//     const tomorrow = dayjs(queryDate).add(1, "day").toDate();

//     const attendance = await Attendance.find({
//       date: { $gte: queryDate, $lt: tomorrow },
//     }).populate("user", "name department role joinDate email phone totalAttendance history");

//     res.json(attendance);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// without GPS+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


import Attendance from "../models/attendanceModel.js";
import dayjs from "dayjs";
import Employee from "../models/employeeModel.js";

// --- Utility: Calculate status based on login/logout time ---
const getRemark = (login, logout) => {
  if (!login || !logout) return "Incomplete";

  const [loginHour, loginMin] = login.split(":").map(Number);
  const [logoutHour, logoutMin] = logout.split(":").map(Number);
  const loginMins = loginHour * 60 + loginMin;
  const logoutMins = logoutHour * 60 + logoutMin;

  if (loginMins > 10 * 60 + 10) return "Late Login"; // After 10:10 AM is Late
  if (logoutMins < 16 * 60) return "Half Day";
  if (logoutMins < 17 * 60 + 45) return "Early Checkout";
  return "Present";
};

// ===================== CHECK-IN =====================
export const checkIn = async (req, res) => {
  try {
    const { date, login } = req.body;

    const today = dayjs(date).startOf("day").toDate();
    let att = await Attendance.findOne({ user: req.user.id, date: today });

    if (att && att.login) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const now = new Date();
    const timeStr = login || now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const loginTime = dayjs(now);

    if (!att) {
      att = new Attendance({
        user: req.user.id,
        date: today,
        checkIn: now,
        login: timeStr,
      });
    } else {
      att.checkIn = now;
      att.login = timeStr;
    }

    // New status logic based on login time
    const lateTime = dayjs().hour(10).minute(10); // 10:10 AM
    const halfDayTime = dayjs().hour(11).minute(0); // 11:00 AM
    const absentTime = dayjs().hour(13).minute(30); // 1:30 PM

    if (loginTime.isAfter(absentTime)) {
      att.status = "Absent";
    } else if (loginTime.isAfter(halfDayTime)) {
      att.status = "Half Day";
    } else if (loginTime.isAfter(lateTime)) {
      att.status = "Late";
    } else {
      att.status = "Present";
    }
    att.remark = att.status;

    await att.save();
    res.json({ message: "Checked in successfully", att });
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ===================== CHECK-OUT =====================
export const checkOut = async (req, res) => {
  try {
    const { date, logout } = req.body;

    const today = dayjs(date).startOf("day").toDate();
    let att = await Attendance.findOne({ user: req.user.id, date: today });

    if (!att || !att.login) {
      return res.status(400).json({ message: "No check-in found for today" });
    }

    if (att.logout) {
      return res.status(400).json({ message: "Already checked out today" });
    }

    const now = new Date();
    const timeStr = logout || now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    att.checkOut = now;
    att.logout = timeStr;

    // total hours calculation
    const diffMs = new Date(att.checkOut) - new Date(att.checkIn);
    att.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    // set remark/status
    att.remark = getRemark(att.login, att.logout);
    att.status = att.remark;

    await att.save();
    res.json({ message: "Checked out successfully", att });
  } catch (err) {
    console.error("Check-out error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ===================== GET MY ATTENDANCE =====================
export const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user.id }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== ADMIN: GET ALL =====================
export const getAllAttendance = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
    const records = await Attendance.find()
      .populate("user", "name email role")
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== SUMMARY =====================
export const getAttendanceSummary = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const today = dayjs().startOf("day").toDate();
    const tomorrow = dayjs(today).add(1, "day").toDate();

    const attendance = await Attendance.find({ date: { $gte: today, $lt: tomorrow } });
    const onTime = attendance.filter((a) => a.status === "Present").length;
    const late = attendance.filter((a) => a.status === "Late" || a.status === "Late Login").length;
    const absent = totalEmployees - attendance.length;

    res.json({ total: totalEmployees, onTime, late, absent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== GET BY DATE =====================
export const getAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date ? dayjs(date).startOf("day").toDate() : dayjs().startOf("day").toDate();
    const tomorrow = dayjs(queryDate).add(1, "day").toDate();

    const attendance = await Attendance.find({
      date: { $gte: queryDate, $lt: tomorrow },
    }).populate("user", "name department role joinDate email phone totalAttendance history");

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
