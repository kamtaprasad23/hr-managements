import Attendance from "../models/attendanceModel.js";
import Employee from "../models/employeeModel.js";
import dayjs from "dayjs";
import moment from "moment-timezone"; // ✅ added

// ===================== UTIL: REMARK LOGIC =====================
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

    const adminId = employee.createdBy;

    // ✅ Use IST timezone
    const now = moment().tz("Asia/Kolkata");
    const dateOnly = new Date(now.format("YYYY-MM-DD"));
    const timeStr = now.format("HH:mm");

    // Check existing attendance for today
    let att = await Attendance.findOne({ user: employeeId, date: dateOnly });

    if (att && att.checkIn) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    if (!att) {
      att = new Attendance({
        user: employeeId,
        createdBy: adminId,
        date: dateOnly,
        checkIn: now.toDate(),
        login: timeStr,
      });
    } else {
      att.checkIn = now.toDate();
      att.login = timeStr;
    }

    // Determine status
    const loginTime = now.hour() * 60 + now.minute();
    if (loginTime > 11 * 60) att.status = "Half Day";
    else if (loginTime > 10 * 60 + 10) att.status = "Late";
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
    const dateOnly = new Date(moment().tz("Asia/Kolkata").format("YYYY-MM-DD"));

    const att = await Attendance.findOne({ user: employeeId, date: dateOnly });
    if (!att || !att.checkIn) {
      return res.status(400).json({ message: "No check-in found for today" });
    }
    if (att.checkOut) {
      return res.status(400).json({ message: "Already checked out today" });
    }

    // ✅ Use IST timezone
    const now = moment().tz("Asia/Kolkata");
    const timeStr = now.format("HH:mm");

    att.checkOut = now.toDate();
    att.logout = timeStr;

    // Total hours
    const diffMs = new Date(att.checkOut) - new Date(att.checkIn);
    att.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    // Status / remark update
    att.remark = getRemark(att.login, att.logout);
    att.status = att.remark;

    await att.save();
    res.json({ message: "Checked out successfully", att });
  } catch (err) {
    console.error("Check-out error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ===================== AUTO CHECKOUT (6 PM) =====================
export const autoCheckOut = async () => {
  try {
    const now = moment().tz("Asia/Kolkata"); // ✅ use IST timezone
    const sixPM = now.clone().hour(18).minute(0).second(0);
    if (now.isBefore(sixPM)) return; // Run only after 6 PM

    const today = new Date(now.format("YYYY-MM-DD"));

    // Find all employees who checked in but not checked out
    const pending = await Attendance.find({
      date: today,
      checkIn: { $exists: true },
      checkOut: { $exists: false },
    });

    for (const att of pending) {
      att.checkOut = sixPM.toDate();
      att.logout = sixPM.format("HH:mm");

      const diffMs = new Date(att.checkOut) - new Date(att.checkIn);
      att.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

      att.remark = getRemark(att.login, att.logout);
      att.status = att.remark;
      await att.save();
    }

    console.log(`✅ Auto checkout completed for ${pending.length} employees`);
  } catch (err) {
    console.error("Auto checkout error:", err);
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

    const today = new Date(moment().tz("Asia/Kolkata").format("YYYY-MM-DD"));
    const attendance = await Attendance.find({ user: { $in: empIds }, date: today });

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
    const queryDate = date ? moment(date).tz("Asia/Kolkata") : moment().tz("Asia/Kolkata");
    const start = queryDate.startOf("day").toDate();
    const end = queryDate.endOf("day").toDate();

    const attendance = await Attendance.find({
      createdBy: req.user.id,
      date: { $gte: start, $lte: end },
    }).populate("user", "name email department position");

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
