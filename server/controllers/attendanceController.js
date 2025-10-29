// controllers/attendanceController.js
import Attendance from "../models/attendanceModel.js";
import dayjs from "dayjs";
import Employee from "../models/employeeModel.js";

// Utility: determine attendance remark
const getRemark = (login, logout) => {
  if (!login || !logout) return "Incomplete";

  const [loginHour, loginMin] = login.split(":").map(Number);
  const [logoutHour, logoutMin] = logout.split(":").map(Number);

  const loginMins = loginHour * 60 + loginMin;
  const logoutMins = logoutHour * 60 + logoutMin;

  if (loginMins > 10 * 60 + 10) return "Late Login";
  if (logoutMins < 16 * 60) return "Half Day";
  if (logoutMins < 17 * 60 + 45) return "Early Checkout";
  return "Present";
};

// ===================== CHECK-IN =====================
export const checkIn = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const adminId = employee.createdBy; // ✅ from model
    const todayStart = dayjs().startOf("day").toDate();
    const tomorrowStart = dayjs(todayStart).add(1, "day").toDate();

    // check existing attendance
    let att = await Attendance.findOne({
      user: employeeId,
      date: { $gte: todayStart, $lt: tomorrowStart },
    });

    if (att && att.checkIn) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (!att) {
      att = new Attendance({
        user: employeeId,
        createdBy: adminId,
        date: todayStart,
        checkIn: now,
        login: timeStr,
      });
    } else {
      att.checkIn = now;
      att.login = timeStr;
    }

    // Status logic
    const loginTime = dayjs(now);
    const lateTime = dayjs(now).hour(10).minute(10);
    const halfDayTime = dayjs(now).hour(11).minute(0);

    if (loginTime.isAfter(halfDayTime)) att.status = "Half Day";
    else if (loginTime.isAfter(lateTime)) att.status = "Late";
    else att.status = "Present";

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
    const employeeId = req.user.id;
    const todayStart = dayjs().startOf("day").toDate();
    const tomorrowStart = dayjs(todayStart).add(1, "day").toDate();

    const att = await Attendance.findOne({
      user: employeeId,
      date: { $gte: todayStart, $lt: tomorrowStart },
    });

    if (!att || !att.checkIn) {
      return res.status(400).json({ message: "No check-in found for today" });
    }
    if (att.checkOut) {
      return res.status(400).json({ message: "Already checked out today" });
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    att.checkOut = now;
    att.logout = timeStr;

    // Total hours
    const diffMs = new Date(att.checkOut) - new Date(att.checkIn);
    att.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    // Status/remark
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

// ===================== ADMIN: GET ALL ATTENDANCE =====================
export const getAllAttendance = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });

    const records = await Attendance.find({ createdBy: req.user.id })
      .populate("user", "name email department position")
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== SUMMARY FOR ADMIN =====================
export const getAttendanceSummary = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });

    const employees = await Employee.find({ createdBy: req.user.id }).select("_id");
    const empIds = employees.map((e) => e._id);

    const today = dayjs().startOf("day").toDate();
    const tomorrow = dayjs(today).add(1, "day").toDate();

    const attendance = await Attendance.find({
      user: { $in: empIds },
      date: { $gte: today, $lt: tomorrow },
    });

    const totalEmployees = empIds.length;
    const onTime = attendance.filter((a) => a.status === "Present").length;
    const late = attendance.filter((a) => a.status === "Late" || a.status === "Late Login").length;
    const absent = totalEmployees - attendance.length;

    res.json({ total: totalEmployees, onTime, late, absent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===================== GET ATTENDANCE BY DATE =====================
export const getAttendance = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });

    const { date } = req.query;
    const queryDate = date ? dayjs(date).startOf("day").toDate() : dayjs().startOf("day").toDate();
    const tomorrow = dayjs(queryDate).add(1, "day").toDate();

    const attendance = await Attendance.find({
      createdBy: req.user.id,
      date: { $gte: queryDate, $lt: tomorrow },
    }).populate("user", "name email department position");

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
