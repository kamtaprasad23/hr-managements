import Employee from "../models/employeeModel.js";
import Attendance from "../models/attendanceModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/config.js";

// --- Authentication ---
export const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(400).json({ message: "Employee not found" });

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: employee._id, role: "employee" }, jwtSecret, {
      expiresIn: "1d",
    });
    res.json({ token, employee: { id: employee._id, name: employee.name, email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Employee Profile Management (for the logged-in user) ---
export const getProfile = async (req, res) => {
  console.log("Fetching profile for user ID:", req.user.id);
  try {
    const profile = await Employee.findById(req.user.id).select("-password");
    if (!profile) {
      console.log("Employee not found for ID:", req.user.id);
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(profile);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "address", "phone", "highestQualification", "yearOfPassing",
      "accountHolder", "accountNumber", "ifsc", "bankName",
      "idType", "idNumber", "emergencyName", "emergencyRelation",
      "emergencyNumber", "alternateNumber", "birthday", "image",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updated = await Employee.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ message: "Profile updated successfully", employee: updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};

export const uploadProfileImg = async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.user.id,
      { image: req.file.path },
      { new: true }
    ).select("-password");
    res.json({ message: "Profile image uploaded", employee: updated });
  } catch (err) {
    res.status(500).json({ message: "Error uploading image", error: err.message });
  }
};

export const deleteProfileImg = async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.user.id,
      { image: null },
      { new: true }
    ).select("-password");
    res.json({ message: "Profile image deleted", employee: updated });
  } catch (err) {
    res.status(500).json({ message: "Error deleting image", error: err.message });
  }
};

// --- Admin Employee Management ---
export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ createdBy: req.user.id })
      .select("-password");
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      "name", "email", "phone", "position", "salary", "address",
      "department", "jobType", "emergencyName", "emergencyRelation",
      "emergencyNumber", "highestQualification", "yearOfPassing",
      "accountHolder", "accountNumber", "ifsc", "bankName",
      "idType", "idNumber", "birthday", "image",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const employee = await Employee.findOneAndUpdate(
      { _id: id, createdBy: req.user.id }, // Ensure only the creator can update
      updates,
      { new: true, runValidators: true }
    ).select("-password");
    if (!employee) return res.status(404).json({ message: "Employee not found or unauthorized" });

    res.json({ message: "Employee updated successfully", employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOneAndDelete({ _id: id, createdBy: req.user.id }); // Ensure only the creator can delete
    if (!employee) return res.status(404).json({ message: "Employee not found or unauthorized" });
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    console.log("🔍 Backend: Fetching employee with ID:", req.params.id);
    const employee = await Employee.findOne({ _id: req.params.id, createdBy: req.user.id }).select("-password"); // Ensure only the creator can view
    if (!employee) {
      return res.status(404).json({ message: "Employee not found or unauthorized" });
    }
    res.json(employee);
  } catch (err) {
    console.error("❌ Backend Error:", err);
    res.status(500).json({ message: "Error fetching employee", error: err.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const employeeData = req.body;
    if (employeeData.password) {
      const salt = await bcrypt.genSalt(10);
      employeeData.password = await bcrypt.hash(employeeData.password, salt);
    }
    employeeData.createdBy = req.user.id; // Set the creator

    const newEmployee = new Employee(employeeData);
    const savedEmployee = await newEmployee.save();
    res.status(201).json({ message: "Employee created successfully", employee: savedEmployee });
  } catch (err) {
    console.error("❌ Create Employee Error:", err);
    res.status(400).json({ message: "Error creating employee", error: err.message });
  }
};

export const verifyEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    employee.verified = true; // or isVerified depending on your model
    await employee.save();

    res.status(200).json({ success: true, message: "Employee verified successfully", employee });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Employee-specific Data Fetching ---
// Get employee profile
export const getEmployeeProfile = async (req, res) => {
  try {
    const empId = req.params.id;
    if (req.user.role === "employee" && req.user.id !== empId) {
      return res.status(403).json({ message: "Access denied" });
    }
    const employee = await Employee.findById(empId).select("-password");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get employee dashboard (attendance etc.)
export const getEmployeeDashboard = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const today = new Date();
    const attendance = await Attendance.find({ employee: employeeId, date: today });
    res.json({ attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
