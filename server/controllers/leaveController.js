import Leave from "../models/leaveModel.js";
import Employee from "../models/employeeModel.js";
import Admin from "../models/adminModel.js";
import Notification from "../models/notificationModel.js";

// Get all leaves (admin view)
export const getAllLeaves = async (req, res) => {
  try {
    const { month, year, search } = req.query;
    const query = {};

    if (month && year) {
      const start = new Date(year, month - 1, 1); // month is 0-indexed
      const end = new Date(year, month, 0, 23, 59, 59, 999); // last day of month
      query.date = { $gte: start, $lte: end };
    }

    if (search) {
      const employees = await Employee.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");
      const employeeIds = employees.map((emp) => emp._id);
      query.employeeId = { $in: employeeIds };
    }

    const leaves = await Leave.find(query)
      .populate("employeeId", "name email")
      .sort({ date: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaves", error: error.message });
  }
};

// Update leave status (admin approves/rejects)
export const updateLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const leave = await Leave.findById(id).populate("employeeId", "name");
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    leave.status = status;
    await leave.save();

    // Format date as YYYY-MM-DD
    const formattedDate = leave.date.toISOString().split("T")[0];

    // Send notification to employee
    const employeeNotif = new Notification({
      title: "Leave Status Update",
      message: `Your leave for ${formattedDate} has been ${status}.`,
      type: "employee",
      userId: leave.employeeId._id,
    });
    await employeeNotif.save();

    // Send notification to admin
    const admin = await Admin.findOne(); // first admin
    if (admin) {
      const adminNotif = new Notification({
        title: "Leave Status Updated",
        message: `Leave of ${leave.employeeId.name} for ${formattedDate} is now ${status}.`,
        type: "system",
        userId: admin._id,
      });
      await adminNotif.save();
    }

    res.status(200).json(leave);
  } catch (error) {
    res.status(500).json({ message: "Error updating leave", error: error.message });
  }
};

// Delete leave (admin only)
export const deleteLeave = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;
    const leave = await Leave.findByIdAndDelete(id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    res.status(200).json({ message: "Leave deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting leave", error: error.message });
  }
};

// Employee applies for leave
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
    });

    await newLeave.save();

    // Send notification to admin
    const admin = await Admin.findOne(); // first admin
    if (admin) {
      const adminNotif = new Notification({
        title: "New Leave Request",
        message: `${employee.name} has requested leave for ${newLeave.date.toISOString().split("T")[0]}.`,
        type: "system",
        userId: admin._id,
      });
      await adminNotif.save();
    }

    res.status(201).json({ message: "Leave requested successfully", leave: newLeave });
  } catch (error) {
    res.status(500).json({ message: "Error creating leave", error: error.message });
  }
};

// Employee fetches their own leaves
export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user.id }).sort({ date: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaves" });
  }
};

// Leave summary for employee (last month or current month)
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
