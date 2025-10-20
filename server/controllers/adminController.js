import Admin from "../models/adminModel.js";
import Employee from "../models/employeeModel.js";
import Task from "../models/taskModel.js";
import Notification from "../models/notificationModel.js"; // Import Notification model
import Attendance from "../models/attendanceModel.js";
import Leave from "../models/leaveModel.js"; // Import Leave model
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { jwtSecret } from "../config/config.js";
import dayjs from "dayjs";

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

export const createEmployee = async (req, res) => {
  try {
    console.log("📥 Incoming employee data:", req.body);
    console.log("👤 Authenticated user:", req.user);

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Admin access required" });
    }

    const { name, email, password, phone, position, salary, address, department, jobType, emergencyName, emergencyRelation, emergencyNumber, birthday, image, highestQualification, yearOfPassing, accountHolder, accountNumber, ifsc, bankName, idType, idNumber, alternateNumber } = req.body;

    if (!name || !email || !password || !phone || !position) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    const exists = await Employee.findOne({ email });
    if (exists) return res.status(400).json({ message: "Employee already exists" });

    const employee = new Employee({
      name,
      email,
      password,
      phone,
      position,
      salary,
      address,
      department,
      jobType,
      emergencyName,
      emergencyRelation,
      emergencyNumber,
      birthday,
      image,
      highestQualification,
      yearOfPassing,
      accountHolder,
      accountNumber,
      ifsc,
      bankName,
      idType,
      idNumber,
      alternateNumber,
      createdBy: req.user.id,
    });

    console.log("💾 Saving employee...");
    await employee.save();

    res.status(201).json({ message: "Employee created successfully", employee });
  } catch (err) {
    console.error("❌ Create Employee Error:", err);
    res.status(500).json({ message: "Server error. Check backend logs." });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  } catch (error) {
    console.error("Get Admin Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdminDashboardData = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const jobApplicants = 0; // Placeholder until implemented
    const today = dayjs().startOf("day").toDate();
    const tomorrow = dayjs(today).add(1, "day").toDate();
    const todayAttendance = await Attendance.find({ date: { $gte: today, $lt: tomorrow } });
    
    // --- Leave Data ---
    const pendingLeaves = await Leave.countDocuments({ status: "Pending" });
    const approvedLeaves = await Leave.countDocuments({ status: "Approved" });
    const rejectedLeaves = await Leave.countDocuments({ status: "Rejected" });
    
    const onTime = todayAttendance.filter((a) => a.status === "Present").length; // Adjusted to match enum
    const late = todayAttendance.filter((a) => a.status === "Late").length;
    const absent = totalEmployees - todayAttendance.length;

    res.json({
      totalEmployees,
      jobApplicants,
      attendance: { total: totalEmployees, onTime, late, absent },
      // Add leave data to the response
      leaves: {
        pending: pendingLeaves,
        approved: approvedLeaves,
        rejected: rejectedLeaves,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};

export const getTotalEmployees = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    const adminId = req.user.id;
    const employees = await Employee.find({ createdBy: adminId }).select("name email phone position salary");
    res.json({ totalEmployees: employees.length, employees });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getBirthdays = async (req, res) => {
  try {
    // Get today's month and day (1-based for month, 1-based for day)
    const todayMonth = dayjs().month() + 1;
    const todayDate = dayjs().date();

    // Find employees whose birthday matches today's month and day
    const employeesWithBirthdayToday = await Employee.find({
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
      date: dayjs(emp.birthday).format("MMMM D"), // Format date for display
      message: "Happy Birthday!",
      image: emp.image ? `http://localhost:5000${emp.image}` : "https://i.pravatar.cc/150",
    }));
    res.json(birthdays);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendBirthdayWish = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const notification = new Notification({
      title: "Happy Birthday! 🎉",
      message: `The team wishes you a very happy birthday, ${employee.name}!`,
      type: "employee",
      userId: employeeId,
      priority: "Medium",
    });
    await notification.save();

    res.status(200).json({ message: `Birthday wish sent to ${employee.name}` });
  } catch (error) {
    console.error("Error sending birthday wish:", error); // Added for better logging
    res.status(500).json({ message: "Failed to send birthday wish", error: error.message });
  }
};