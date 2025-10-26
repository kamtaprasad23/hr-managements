import Task from "../models/taskModel.js";
import Notification from "../models/notificationModel.js";
import Employee from "../models/employeeModel.js";

// ===================== CREATE TASK =====================
export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority, notes, attachments } = req.body;

    if (!title || !description || !assignedTo || !dueDate) {
      return res.status(400).json({ message: "Title, description, assignee, and due date are required" });
    }

    const employee = await Employee.findById(assignedTo);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const task = new Task({
      title,
      description,
      assignedTo,
      assignedBy: req.user.id,
      dueDate: new Date(dueDate),
      priority: priority || "Medium",
      notes,
      attachments: attachments || [],
    });

    await task.save();

    // Employee notification
    await new Notification({
      title: "New Task Assigned",
      message: `You have been assigned a new task: "${title}". Due: ${task.dueDate.toDateString()}. Priority: ${task.priority}`,
      type: "task",
      category: "new-task",
      taskId: task._id,
      userId: assignedTo,
      priority: task.priority,
      read: false,
    }).save();

    // Admin notification
    await new Notification({
      title: "Task Assigned",
      message: `Task "${title}" assigned to ${employee.name} successfully.`,
      type: "task",
      category: "task-assigned",
      taskId: task._id,
      userId: req.user.id,
    }).save();

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
};

// ===================== GET ADMIN TASKS =====================
export const getAdminTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedBy: req.user.id })
      .populate("assignedTo", "name position")
      .sort({ dueDate: 1 })
      .lean();

    const today = new Date();
    const tasksWithStatus = tasks.map(task => ({
      ...task,
      isOverdue: new Date(task.dueDate) < today && task.status !== "Completed",
      rejectionReason: task.rejectionReason || "",
    }));

    res.json(tasksWithStatus);
  } catch (error) {
    console.error("Get admin tasks error:", error);
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

// ===================== GET EMPLOYEE TASKS =====================
export const getEmployeeTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate("assignedBy", "name")
      .sort({ dueDate: 1 })
      .lean();

    const today = new Date();
    const tasksWithStatus = tasks.map(task => ({
      ...task,
      isOverdue: new Date(task.dueDate) < today && task.status !== "Completed",
    }));

    res.json(tasksWithStatus);
  } catch (error) {
    console.error("Get employee tasks error:", error);
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

// ===================== UPDATE TASK STATUS =====================
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, rejectionReason } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.assignedTo.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "You can only update your own tasks" });
    }

    task.status = status;
    if (notes) task.notes = notes;
    if (status === "Rejected" && rejectionReason) task.rejectionReason = rejectionReason;
    if (status === "Completed") task.completionDate = new Date();

    await task.save();

    // Notify admin
    await new Notification({
      title: `Task "${task.title}" Status Updated`,
      message: status === "Rejected" ? `Task rejected by employee: ${rejectionReason || "No reason provided"}` : `Task updated to "${status}" by employee`,
      type: "task",
      category: status === "Completed" ? "task-completed" : status === "Rejected" ? "task-rejected" : "task-updated",
      taskId: task._id,
      userId: task.assignedBy,
      priority: task.priority,
      read: false,
    }).save();

    // Notify employee
    await new Notification({
      title: "Task Status Updated",
      message: `Your task "${task.title}" status is now "${status}".`,
      type: "task",
      category: "task-status-update",
      taskId: task._id,
      userId: task.assignedTo,
      priority: task.priority,
      read: false,
    }).save();

    res.json({ message: "Task status updated successfully", task });
  } catch (error) {
    console.error("Update task status error:", error);
    res.status(500).json({ message: "Error updating task status", error: error.message });
  }
};

// ===================== DELETE TASK =====================
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Delete associated notifications
    await Notification.deleteMany({ taskId: id });
    await task.deleteOne();

    res.json({ message: "Task and associated notifications deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
};

// ===================== GET TASK NOTIFICATIONS =====================
export const getTaskNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id, type: "task" })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("taskId", "title status dueDate")
      .lean();

    res.json(notifications);
  } catch (error) {
    console.error("Get task notifications error:", error);
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

// ===================== MARK NOTIFICATION AS READ =====================
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Mark notification error:", error);
    res.status(500).json({ message: "Error marking notification as read", error: error.message });
  }
};
