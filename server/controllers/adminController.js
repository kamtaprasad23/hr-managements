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

// 🟩 Admin Registration
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: "Admin already exists" });

    const newAdmin = new Admin({ name, email, password });
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟩 Admin Login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: admin._id, role: "admin" }, jwtSecret, { expiresIn: "1d" });
    res.json({ message: "Login successful", token, role: "admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🟩 Create Employee (only for logged admin)
export const createEmployee = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Admin access required" });
    }

    const {
      name, email, password, phone, position, salary, address,
      department, jobType, emergencyName, emergencyRelation, emergencyNumber,
      birthday, image, highestQualification, yearOfPassing,
      accountHolder, accountNumber, ifsc, bankName,
      idType, idNumber, alternateNumber
    } = req.body;

    if (!name || !email || !password || !phone || !position) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const exists = await Employee.findOne({ email });
    if (exists) return res.status(400).json({ message: "Employee already exists" });

    const employee = new Employee({
      name, email, password, phone, position, salary, address,
      department, jobType, emergencyName, emergencyRelation, emergencyNumber,
      birthday, image, highestQualification, yearOfPassing,
      accountHolder, accountNumber, ifsc, bankName,
      idType, idNumber, alternateNumber,
      createdBy: req.user.id, // 👈 important
      adminId: req.user.id, // ✅ Add adminId for consistency
    });

    await employee.save();

    res.status(201).json({ message: "Employee created successfully", employee });
  } catch (err) {
    console.error("❌ Create Employee Error:", err);
    res.status(500).json({ message: "Server error. Check backend logs." });
  }
};

// 🟩 Get Admin Profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (error) {
    console.error("Get Admin Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟩 Admin Dashboard (Only show that admin's data)
export const getAdminDashboardData = async (req, res) => {
  try {
    const adminId = req.user.id;

    const date = req.query.date ? dayjs(req.query.date) : dayjs();

    const totalEmployees = await Employee.countDocuments({ createdBy: adminId });
    const today = date.startOf("day").toDate();
    const tomorrow = dayjs(today).add(1, "day").toDate();

    const todayAttendance = await Attendance.find({
      createdBy: adminId,
      date: { $gte: today, $lt: tomorrow },
    });

    const pendingLeaves = await Leave.countDocuments({ createdBy: adminId, status: "Pending" });
    const approvedLeaves = await Leave.countDocuments({ createdBy: adminId, status: "Approved" });
    const rejectedLeaves = await Leave.countDocuments({ createdBy: adminId, status: "Rejected" });

    const onTime = todayAttendance.filter((a) => a.status === "Present").length;
    const late = todayAttendance.filter((a) => a.status === "Late").length;
    const absent = totalEmployees - todayAttendance.length;

    res.json({
      totalEmployees,
      attendance: { total: totalEmployees, onTime, late, absent },
      leaves: { pending: pendingLeaves, approved: approvedLeaves, rejected: rejectedLeaves },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};

// 🟩 Get Total Employees (only own employees)
export const getTotalEmployees = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    const adminId = req.user.id;
    const employees = await Employee.find({ createdBy: adminId })
      .select("name email phone position salary");
    res.json({ totalEmployees: employees.length, employees });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🟩 Get Today Birthdays (only own employees)
export const getBirthdays = async (req, res) => {
  try {
    const adminId = req.user.id;
    const todayMonth = dayjs().month() + 1;
    const todayDate = dayjs().date();

    const employeesWithBirthdayToday = await Employee.find({
      createdBy: adminId,
      $expr: {
        $and: [
          { $eq: [{ $month: "$birthday" }, todayMonth] },
          { $eq: [{ $dayOfMonth: "$birthday" }, todayDate] },
        ],
      },
    }).select("name birthday image");

    const birthdays = employeesWithBirthdayToday.map(emp => ({
      _id: emp._id,
      name: emp.name,
      date: dayjs(emp.birthday).format("MMMM D"),
      message: "Happy Birthday!",
      image: emp.image || "https://i.pravatar.cc/150",
    }));

    res.json(birthdays);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟩 Send Birthday Notification (only for own employee)
export const sendBirthdayWish = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { employeeId } = req.params;
    const employee = await Employee.findOne({ _id: employeeId, createdBy: adminId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found or not yours" });
    }

    const notification = new Notification({
      title: "Happy Birthday! 🎉",
      message: `The team wishes you a very happy birthday, ${employee.name}!`,
      type: "employee",
      userId: employeeId,
      priority: "Medium",
      createdBy: adminId,
    });
    await notification.save();

    res.status(200).json({ message: `Birthday wish sent to ${employee.name}` });
  } catch (error) {
    console.error("Error sending birthday wish:", error);
    res.status(500).json({ message: "Failed to send birthday wish" });
  }
};

// 🟩 Update Admin Profile
export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { name, email, password } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, { $set: updateData }, { new: true })
      .select("-password");

    res.status(200).json({ message: "Profile updated successfully", admin: updatedAdmin });
  } catch (error) {
    console.error("❌ Error updating admin profile:", error);
    res.status(500).json({ message: "Failed to update admin profile" });
  }
};

// 🟩 Approve Employee Update (only if employee belongs to that admin)
export const approveEmployeeUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const employee = await Employee.findOne({ _id: id, createdBy: adminId });
    if (!employee) return res.status(404).json({ message: "Employee not found or not yours" });

    if (employee.pendingUpdates && Object.keys(employee.pendingUpdates).length > 0) {
      Object.assign(employee, employee.pendingUpdates);
      employee.pendingUpdates = {};
      employee.status = "Verified";
      employee.verified = true;
      await employee.save();
      return res.json({ message: "Employee update approved successfully" });
    } else {
      return res.status(400).json({ message: "No pending update found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error approving update", error: error.message });
  }
};

// 🟩 Reject Employee Update (only if employee belongs to that admin)
export const rejectEmployeeUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const employee = await Employee.findOne({ _id: id, createdBy: adminId });
    if (!employee) return res.status(404).json({ message: "Employee not found or not yours" });

    if (employee.pendingUpdates) {
      employee.pendingUpdates = {};
      employee.status = "Verified";
      await employee.save();
      return res.json({ message: "Employee update rejected" });
    } else {
      return res.status(400).json({ message: "No pending update found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error rejecting update", error: error.message });
  }
};
