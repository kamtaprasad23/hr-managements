import SalarySlip from "../models/salarySlipModel.js";
import Employee from "../models/employeeModel.js";
import Notification from "../models/notificationModel.js";
import Attendance from "../models/attendanceModel.js";
import dayjs from "dayjs";

// ===================== CALCULATE SALARY =====================
export const calculateSalary = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Admin can only calculate salary for employees they created
    if (req.user.role === "admin" && employee.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to calculate salary for this employee" });
    }

    const baseSalary = employee.salary || 0;
    const startDate = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const endDate = dayjs(startDate).endOf("month").toDate();

    const attendance = await Attendance.find({
      user: employeeId,
      date: { $gte: startDate, $lte: endDate }
    });

    let absentDays = 0;
    let lateDays = 0;
    attendance.forEach(record => {
      if (record.status === "Absent") absentDays++;
      if (record.status === "Late" || record.status === "Late Login") lateDays++;
    });

    const totalDays = dayjs(endDate).diff(startDate, "day") + 1;
    const dailySalary = baseSalary / totalDays;
    const deduction = (absentDays * dailySalary) + (lateDays * (dailySalary / 2));
    const netSalary = baseSalary - deduction;
    const remarks = `Absent: ${absentDays} days, Late: ${lateDays} days`;

    res.json({
      baseSalary,
      absentDays,
      lateDays,
      deduction: Math.round(deduction),
      netSalary: Math.round(netSalary),
      remarks: absentDays + lateDays > 0 ? remarks : "No deductions",
    });
  } catch (error) {
    res.status(500).json({ message: "Error calculating salary", error: error.message });
  }
};

// ===================== SEND SALARY SLIP =====================
export const sendSalarySlip = async (req, res) => {
  try {
    const { employeeId, month, year, baseSalary, deduction, remarks } = req.body;
    const netSalary = baseSalary - deduction;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    if (req.user.role === "admin" && employee.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to send salary slip for this employee" });
    }

    const slip = new SalarySlip({
      employeeId,
      month,
      year,
      baseSalary,
      deduction,
      netSalary,
      remarks,
    });
    await slip.save();

    // Notification to employee
    const notification = new Notification({
      title: "Salary Slip Generated",
      message: `Your salary slip for ${dayjs().month(month - 1).format("MMMM")} ${year} has been generated.`,
      type: "employee",
      userId: employeeId,
      priority: "Medium",
    });
    await notification.save();

    res.status(201).json({ message: "Salary slip sent successfully", slip });
  } catch (error) {
    res.status(500).json({ message: "Error sending salary slip", error: error.message });
  }
};

// ===================== GET ALL SALARY SLIPS (ADMIN) =====================
export const getSalarySlips = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });

    // Only show slips of employees created by this admin
    const employees = await Employee.find({ createdBy: req.user.id }).select("_id");
    const employeeIds = employees.map(emp => emp._id);

    const slips = await SalarySlip.find({ employeeId: { $in: employeeIds } })
      .populate("employeeId", "name email")
      .sort({ year: -1, month: -1 });

    res.status(200).json(slips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching salary slips", error: error.message });
  }
};

// ===================== GET MY SALARY SLIPS (EMPLOYEE) =====================
export const getEmployeeSalarySlips = async (req, res) => {
  try {
    const slips = await SalarySlip.find({ employeeId: req.user.id })
      .sort({ year: -1, month: -1 });
    res.status(200).json(slips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your salary slips", error: error.message });
  }
};
