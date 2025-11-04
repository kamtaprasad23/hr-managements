
import Attendance from "../models/attendanceModel.js";
import Employee from "../models/employeeModel.js";
import Admin from "../models/adminModel.js";
import dayjs from "dayjs";
import moment from "moment-timezone";

// UTIL: REMARK LOGIC
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

// CHECK-IN
export const checkIn = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const adminId = employee.createdBy;

    const now = moment().tz("Asia/Kolkata");
    const dateOnly = new Date(now.format("YYYY-MM-DD"));
    const timeStr = now.format("HH:mm");

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

    const loginTime = now.hour() * 60 + now.minute();
    if (loginTime > 11 * 60) att.status = "Half Day";
    else if (loginTime > 10 * 60 + 10) att.status = "Late";
    else att.status = "Present";

    att.remark = att.status;
    await att.save();

    res.json({ message: "Checked in successfully", att });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// CHECK-OUT
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

    const now = moment().tz("Asia/Kolkata");
    const timeStr = now.format("HH:mm");

    att.checkOut = now.toDate();
    att.logout = timeStr;

    const diffMs = new Date(att.checkOut) - new Date(att.checkIn);
    att.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    att.remark = getRemark(att.login, att.logout);
    att.status = att.remark;

    await att.save();
    res.json({ message: "Checked out successfully", att });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// AUTO CHECKOUT
export const autoCheckOut = async () => {
  try {
    const now = moment().tz("Asia/Kolkata");
    const sixPM = now.clone().hour(18).minute(0).second(0);
    if (now.isBefore(sixPM)) return;

    const today = new Date(now.format("YYYY-MM-DD"));

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

    console.log(`Auto checkout completed for ${pending.length} employees`);
  } catch (err) {
    console.error("Auto checkout error:", err);
  }
};

// GET MY ATTENDANCE (Employee)
export const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user.id }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL ATTENDANCE (Admin/HR/Manager)
export const getAllAttendance = async (req, res) => {
  try {
    const { id: userId, role, isMainAdmin } = req.user;

    let empQuery;
    if (isMainAdmin) {
      const subAdmins = await Admin.find({ createdBy: userId }).select("_id");
      const adminIds = [userId, ...subAdmins.map(a => a._id)];
      empQuery = { createdBy: { $in: adminIds } };
    } else if (["hr", "manager"].includes(role)) {
      const creatorAdmin = await Admin.findById(req.user.createdBy);
      const orgAdminIds = await Admin.find({ createdBy: creatorAdmin._id }).select("_id");
      const allTeamIds = [creatorAdmin._id, ...orgAdminIds.map(a => a._id)];
      empQuery = { createdBy: { $in: allTeamIds } };
    } else {
      empQuery = { createdBy: userId };
    }
    const employeeIds = await Employee.find(empQuery).distinct("_id");

    const records = await Attendance.find({ user: { $in: employeeIds } })
      .populate("user", "name email department position")
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET ATTENDANCE SUMMARY
export const getAttendanceSummary = async (req, res) => {
  try {
    const { id: userId, role, isMainAdmin } = req.user;

    let empQuery;
    if (isMainAdmin) {
      const subAdmins = await Admin.find({ createdBy: userId }).select("_id");
      const adminIds = [userId, ...subAdmins.map(a => a._id)];
      empQuery = { createdBy: { $in: adminIds } };
    } else if (["hr", "manager"].includes(role)) {
      const creatorAdmin = await Admin.findById(req.user.createdBy);
      const orgAdminIds = await Admin.find({ createdBy: creatorAdmin._id }).select("_id");
      const allTeamIds = [creatorAdmin._id, ...orgAdminIds.map(a => a._id)];
      empQuery = { createdBy: { $in: allTeamIds } };
    } else {
      empQuery = { createdBy: userId };
    }
    const employeeIds = await Employee.find(empQuery).distinct("_id");

    const today = new Date(moment().tz("Asia/Kolkata").format("YYYY-MM-DD"));
    const attendance = await Attendance.find({ user: { $in: employeeIds }, date: today });

    const totalEmployees = employeeIds.length;
    const onTime = attendance.filter(a => a.status === "Present").length;
    const late = attendance.filter(a => a.status === "Late").length;
    const absent = totalEmployees - attendance.length;

    res.json({ total: totalEmployees, onTime, late, absent });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET ATTENDANCE BY DATE
export const getAttendance = async (req, res) => {
  try {
    const { id: userId, role, isMainAdmin } = req.user;

    let empQuery;
    if (isMainAdmin) {
      const subAdmins = await Admin.find({ createdBy: userId }).select("_id");
      const adminIds = [userId, ...subAdmins.map(a => a._id)];
      empQuery = { createdBy: { $in: adminIds } };
    } else if (["hr", "manager"].includes(role)) {
      const creatorAdmin = await Admin.findById(req.user.createdBy);
      const orgAdminIds = await Admin.find({ createdBy: creatorAdmin._id }).select("_id");
      const allTeamIds = [creatorAdmin._id, ...orgAdminIds.map(a => a._id)];
      empQuery = { createdBy: { $in: allTeamIds } };
    } else {
      empQuery = { createdBy: userId };
    }
    const employeeIds = await Employee.find(empQuery).distinct("_id");

    const { date } = req.query;
    const queryDate = date ? moment(date).tz("Asia/Kolkata") : moment().tz("Asia/Kolkata");
    const start = queryDate.startOf("day").toDate();
    const end = queryDate.endOf("day").toDate();

    const attendance = await Attendance.find({
      user: { $in: employeeIds },
      date: { $gte: start, $lte: end },
    }).populate("user", "name email department position");

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ADMIN/HR/MANAGER CHECK-IN
export const adminCheckIn = async (req, res) => {
  try {
    const adminId = req.user.id; // Middleware से ID प्राप्त करें
    const now = moment().tz("Asia/Kolkata");
    const dateOnly = new Date(now.format("YYYY-MM-DD"));
    const timeStr = now.format("HH:mm");

    let att = await Attendance.findOne({ user: adminId, date: dateOnly });

    if (att && att.checkIn) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    if (!att) {
      att = new Attendance({
        user: adminId,
        userModel: 'Admin', // मॉडल का प्रकार सेट करें
        date: dateOnly,
        checkIn: now.toDate(),
        login: timeStr,
      });
    } else {
      att.checkIn = now.toDate();
      att.login = timeStr;
    }

    const loginTime = now.hour() * 60 + now.minute();
    if (loginTime > 10 * 60 + 10) att.status = "Late";
    else att.status = "Present";

    await att.save();

    res.json({ message: "Checked in successfully", att });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ADMIN/HR/MANAGER CHECK-OUT
export const adminCheckOut = async (req, res) => {
  try {
    const adminId = req.user.id;
    const dateOnly = new Date(moment().tz("Asia/Kolkata").format("YYYY-MM-DD"));

    const att = await Attendance.findOne({ user: adminId, date: dateOnly });
    if (!att || !att.checkIn) {
      return res.status(400).json({ message: "No check-in found for today" });
    }
    if (att.checkOut) {
      return res.status(400).json({ message: "Already checked out today" });
    }

    const now = moment().tz("Asia/Kolkata");
    att.checkOut = now.toDate();
    att.logout = now.format("HH:mm");

    const diffMs = new Date(att.checkOut) - new Date(att.checkIn);
    att.totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    att.status = getRemark(att.login, att.logout);

    await att.save();
    res.json({ message: "Checked out successfully", att });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL SUB-ADMINS' ATTENDANCE (For Main Admin)
export const getSubAdminAttendance = async (req, res) => {
  try {
    // 1. Find all sub-admins created by the current main admin
    const subAdmins = await Admin.find({ createdBy: req.user.id }).select('_id');
    const subAdminIds = subAdmins.map(admin => admin._id);

    // 2. Find attendance records only for those sub-admins
    const records = await Attendance.find({ user: { $in: subAdminIds }, userModel: 'Admin' })
      .populate("user", "name email role")
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};