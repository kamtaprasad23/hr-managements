import Leave from "../models/leaveModel.js";
import Employee from "../models/employeeModel.js";
import Admin from "../models/adminModel.js";
import Notification from "../models/notificationModel.js";

// ===================== ADMIN: Get all leaves =====================
export const getAllLeaves = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });

    const { month, year, search } = req.query;
    const query = {};

    // Filter by month/year
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    // Search by employee name (only employees created by this admin)
    if (search) {
      const employees = await Employee.find({
        name: { $regex: search, $options: "i" },
        createdBy: req.user.id,
      }).select("_id");
      const employeeIds = employees.map(emp => emp._id);
      query.employeeId = { $in: employeeIds };
    }

    // Fetch leaves (admin can only see their employees' leaves)
    query.employeeId = query.employeeId || { $in: (await Employee.find({ createdBy: req.user.id }).select("_id")).map(e => e._id) };

    const leaves = await Leave.find(query)
      .populate("employeeId", "name email")
      .sort({ date: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaves", error: error.message });
  }
};

// ===================== ADMIN: Update leave status =====================
export const updateLeave = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });

    const { id } = req.params;
    const { status } = req.body;

    const leave = await Leave.findById(id).populate("employeeId", "name createdBy");
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    // Ensure admin can only update leaves of their employees
    if (leave.employeeId.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this leave" });
    }

    leave.status = status;
    await leave.save();

    const formattedDate = leave.date.toISOString().split("T")[0];

    // Notify employee
    await Notification.create({
      title: "Leave Status Update",
      message: `Your leave for ${formattedDate} has been ${status}.`,
      type: "employee",
      userId: leave.employeeId._id,
      createdBy: req.user.id, // ✅ Add the admin's ID as the creator
    });

    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ message: "Error updating leave", error: error.message });
  }
};

// ===================== ADMIN: Delete leave =====================
export const deleteLeave = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });

    const { id } = req.params;
    const leave = await Leave.findById(id).populate("employeeId", "createdBy");
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    if (leave.employeeId.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this leave" });
    }

    await leave.deleteOne();
    res.status(200).json({ message: "Leave deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting leave", error: error.message });
  }
};

// ===================== EMPLOYEE: Apply for leave =====================
export const createLeave = async (req, res) => {
  try {
    const { date, reason } = req.body;
    if (!date || !reason) return res.status(400).json({ message: "Date and reason are required" });

    const employee = await Employee.findById(req.user.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const newLeave = new Leave({
      employeeId: req.user.id,
      employeeName: employee.name,
      date: new Date(date),
      reason,
      status: "Pending",
      createdBy: employee.createdBy, // ✅ Link leave to the admin
    });

    await newLeave.save();

    // Notify admins of this employee
    await Notification.create({
      title: "New Leave Request",
      message: `${employee.name} requested leave for ${newLeave.date.toISOString().split("T")[0]}.`,
      type: "alert",
      userId: employee.createdBy,
      userModel: "Admin",
      link: "/admin/dashboard/leave",
      createdBy: employee.createdBy, // ✅ Add createdBy to satisfy the model requirement
    });

    res.status(201).json({ message: "Leave requested successfully", leave: newLeave });
  } catch (error) {
    res.status(500).json({ message: "Error creating leave", error: error.message });
  }
};

// ===================== EMPLOYEE: Fetch own leaves =====================
export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user.id }).sort({ date: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaves" });
  }
};

// ===================== EMPLOYEE: Leave summary =====================
export const getLeaveSummary = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user.id });

    const summary = {
      totalLeaves: leaves.length,
      approved: leaves.filter(l => l.status === "Approved").length,
      rejected: leaves.filter(l => l.status === "Rejected").length,
      pending: leaves.filter(l => l.status === "Pending").length,
    };

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave summary", error: error.message });
  }
};
