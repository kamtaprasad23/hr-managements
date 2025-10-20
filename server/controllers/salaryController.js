import SalarySlip from "../models/salarySlipModel.js";
import Employee from "../models/employeeModel.js";
import Notification from "../models/notificationModel.js";
import Attendance from "../models/attendanceModel.js";
import dayjs from "dayjs";

export const calculateSalary = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;
    
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

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
      if (record.status === "Late") lateDays++;
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
    res.status(500).json({ message: error.message });
  }
};

export const sendSalarySlip = async (req, res) => {
  try {
    const { employeeId, month, year, baseSalary, deduction, remarks } = req.body;
    const netSalary = baseSalary - deduction;

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

    // Create a notification for the employee
    const notification = new Notification({
      title: "Salary Slip Generated",
      message: `Your salary slip for ${dayjs().month(month - 1).format("MMMM")} ${year} has been generated.`,
      type: "employee",
      userId: employeeId,
      priority: "Medium",
    });
    await notification.save();

    res.json({ message: "Salary slip sent", slip });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSalarySlips = async (req, res) => {
  try {
    const slips = await SalarySlip.find().populate("employeeId", "name");
    res.json(slips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeeSalarySlips = async (req, res) => {
  try {
    const slips = await SalarySlip.find({ employeeId: req.user.id })
      .sort({ year: -1, month: -1 });
    res.json(slips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};