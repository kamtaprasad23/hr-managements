
//new update
// controllers/adminController.js
import Admin from "../models/adminModel.js";
import Employee from "../models/employeeModel.js";
import Task from "../models/taskModel.js";
import Notification from "../models/notificationModel.js";
import Attendance from "../models/attendanceModel.js";
import Leave from "../models/leaveModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { jwtSecret } from "../config/config.js";
import dayjs from "dayjs";

// REGISTER MAIN ADMIN
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: "Admin already exists" });

    const isFirstAdmin = (await Admin.countDocuments()) === 0;

    const newAdmin = new Admin({
      name,
      email: email.toLowerCase(),
      password: password, // Pass plain password, model will hash it
      role: "admin",
      isMainAdmin: isFirstAdmin,
    });
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const tokenPayload = {
      id: user._id,
      role: user.role,
      isMainAdmin: user.isMainAdmin,
    };

    if (!user.isMainAdmin && user.createdBy) {
      tokenPayload.createdBy = user.createdBy;
    }

    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: "7d" });
    res.json({
      message: "Login successful",
      token,
      role: user.role.toLowerCase(),
      name: user.name,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE HR/MANAGER
export const createHRorManager = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const newAdmin = new Admin({
      name,
      email: email.toLowerCase(),
      password: password, // Pass plain password, model will hash it
      role: role.toLowerCase(),
      createdBy: req.user.id,
    });

    await newAdmin.save();

    res.status(201).json({ message: `${role.toUpperCase()} created successfully` });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET PROFILE
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE EMPLOYEE
export const createEmployee = async (req, res) => {
  try {
    const { name, email, password, ...rest } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email, password required" });

    const exists = await Employee.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "Employee already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const employee = new Employee({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      ...rest,
      createdBy: req.user.id,
      adminId: req.user.id,
    });

    await employee.save();
    res.status(201).json({ message: "Employee created", employee });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DASHBOARD DATA
export const getAdminDashboardData = async (req, res) => {
  try {
    const { id: userId, role, isMainAdmin } = req.user;
    const today = dayjs().startOf("day").toDate();
    const tomorrow = dayjs(today).add(1, "day").toDate();

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

    const totalEmployees = await Employee.countDocuments(empQuery);
    const todayAttendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow },
      user: { $in: await Employee.find(empQuery).select("_id").lean() },
    });
    const pendingLeaves = await Leave.countDocuments({
      status: "Pending",
      employeeId: { $in: await Employee.find(empQuery).select("_id").lean() },
    });

    const onTime = todayAttendance.filter(a => a.status === "Present").length;
    const late = todayAttendance.filter(a => a.status === "Late").length;
    const absent = totalEmployees - todayAttendance.length;

    const data = {
      totalEmployees,
      attendance: { total: totalEmployees, onTime, late, absent },
      leaves: { pending: pendingLeaves },
    };

    if (role === "hr") data.restricted = { task: "hidden" };
    if (role === "manager") data.restricted = { salary: "hidden" };

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// BIRTHDAYS
export const getBirthdays = async (req, res) => {
  try {
    const { id: userId, role, isMainAdmin } = req.user;
    const todayMonth = dayjs().month() + 1;
    const todayDate = dayjs().date();

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

    const employees = await Employee.find(empQuery)
      .where('$expr').equals({
        $and: [
          { $eq: [{ $month: "$birthday" }, todayMonth] },
          { $eq: [{ $dayOfMonth: "$birthday" }, todayDate] },
        ],
      }).select("name birthday image");

    res.json(employees.map(emp => ({
      _id: emp._id,
      name: emp.name,
      date: dayjs(emp.birthday).format("MMMM D"),
      image: emp.image || "https://i.pravatar.cc/150",
    })));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// SEND BIRTHDAY WISH
export const sendBirthdayWish = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { id: userId, role, isMainAdmin } = req.user;

    let empQuery;
    if (isMainAdmin) {
      const subAdmins = await Admin.find({ createdBy: userId }).select("_id");
      const adminIds = [userId, ...subAdmins.map(a => a._id)];
      empQuery = { _id: employeeId, createdBy: { $in: adminIds } };
    } else if (["hr", "manager"].includes(role)) {
      const creatorAdmin = await Admin.findById(req.user.createdBy);
      const orgAdminIds = await Admin.find({ createdBy: creatorAdmin._id }).select("_id");
      const allTeamIds = [creatorAdmin._id, ...orgAdminIds.map(a => a._id)];
      empQuery = { _id: employeeId, createdBy: { $in: allTeamIds } };
    } else {
      empQuery = { _id: employeeId, createdBy: userId };
    }

    const employee = await Employee.findOne(empQuery);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const notification = new Notification({
      title: "Happy Birthday!",
      message: `Team wishes you a happy birthday, ${employee.name}!`,
      type: "employee",
      userId: employeeId,
      createdBy: userId,
    });
    await notification.save();

    res.json({ message: "Wish sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE PROFILE
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const current = await Admin.findById(req.user.id);

    if (current.role !== "admin" && (email || password)) {
      return res.status(403).json({ message: "Only main admin can change email/password" });
    }

    const update = {};
    if (name) update.name = name;
    if (email) update.email = email.toLowerCase();
    if (password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }

    const updated = await Admin.findByIdAndUpdate(req.user.id, update, { new: true }).select("-password");
    res.json({ message: "Profile updated", admin: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// APPROVE / REJECT EMPLOYEE UPDATE
export const approveEmployeeUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role, isMainAdmin } = req.user;

    let empQuery;
    if (isMainAdmin) {
      const subAdmins = await Admin.find({ createdBy: userId }).select("_id");
      const adminIds = [userId, ...subAdmins.map(a => a._id)];
      empQuery = { _id: id, createdBy: { $in: adminIds } };
    } else if (["hr", "manager"].includes(role)) {
      const creatorAdmin = await Admin.findById(req.user.createdBy);
      const orgAdminIds = await Admin.find({ createdBy: creatorAdmin._id }).select("_id");
      const allTeamIds = [creatorAdmin._id, ...orgAdminIds.map(a => a._id)];
      empQuery = { _id: id, createdBy: { $in: allTeamIds } };
    } else {
      empQuery = { _id: id, createdBy: userId };
    }

    const employee = await Employee.findOne(empQuery);
    if (!employee) return res.status(404).json({ message: "Not found" });

    if (employee.pendingUpdates && Object.keys(employee.pendingUpdates).length > 0) {
      Object.assign(employee, employee.pendingUpdates);
      employee.pendingUpdates = {};
      employee.status = "Verified";
      await employee.save();
      res.json({ message: "Approved" });
    } else {
      res.status(400).json({ message: "No pending update" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectEmployeeUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role, isMainAdmin } = req.user;

    let empQuery;
    if (isMainAdmin) {
      const subAdmins = await Admin.find({ createdBy: userId }).select("_id");
      const adminIds = [userId, ...subAdmins.map(a => a._id)];
      empQuery = { _id: id, createdBy: { $in: adminIds } };
    } else if (["hr", "manager"].includes(role)) {
      const creatorAdmin = await Admin.findById(req.user.createdBy);
      const orgAdminIds = await Admin.find({ createdBy: creatorAdmin._id }).select("_id");
      const allTeamIds = [creatorAdmin._id, ...orgAdminIds.map(a => a._id)];
      empQuery = { _id: id, createdBy: { $in: allTeamIds } };
    } else {
      empQuery = { _id: id, createdBy: userId };
    }

    const employee = await Employee.findOne(empQuery);
    if (!employee) return res.status(404).json({ message: "Not found" });

    employee.pendingUpdates = {};
    employee.status = "Verified";
    await employee.save();
    res.json({ message: "Rejected" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};