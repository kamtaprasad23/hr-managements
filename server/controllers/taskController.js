import Task from "../models/taskModel.js";
import Notification from "../models/notificationModel.js";
import Employee from "../models/employeeModel.js";

export const createTask = async (req, res) => {
  console.log("📤 Creating task with data:", req.body);
  try {
    const { title, description, assignedTo, dueDate, priority, notes, attachments } = req.body;
    
    if (!title || !description || !assignedTo || !dueDate) {
      console.log("❌ Missing fields:", { title, description, assignedTo, dueDate });
      return res.status(400).json({ message: "Title, description, assignee, and due date are required" });
    }

    const employee = await Employee.findById(assignedTo);
    if (!employee) {
      console.log("❌ Invalid employee ID:", assignedTo);
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate)) {
      console.log("❌ Invalid due date:", dueDate);
      return res.status(400).json({ message: "Invalid due date format" });
    }

    const task = new Task({
      title,
      description,
      assignedTo,
      assignedBy: req.user.id,
      dueDate: parsedDueDate,
      priority: priority || "Medium",
      notes,
      attachments: attachments || [],
    });

    await task.save();
    console.log("✅ Task saved:", task._id);

    const notification = new Notification({
      title: "New Task Assigned",
      message: `You have been assigned a new task: "${title}". Due: ${parsedDueDate.toLocaleDateString()}. Priority: ${priority || "Medium"}`,
      type: "task",
      category: "new-task",
      taskId: task._id,
      userId: assignedTo,
      priority: priority || "Medium",
      read: false,
    });
    await notification.save();
    console.log("✅ Employee notification created:", notification._id);

    const adminNotif = new Notification({
      title: "Task Assigned",
      message: `Task "${title}" assigned to ${employee.name} successfully.`,
      type: "task",
      category: "task-assigned",
      taskId: task._id,
      userId: req.user.id,
    });
    await adminNotif.save();
    console.log("✅ Admin notification created:", adminNotif._id);

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    console.error("❌ Create task error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
};

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
    }));

    res.json(tasksWithStatus);
  } catch (error) {
    console.error("Get admin tasks error:", error);
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

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

export const updateTaskStatus = async (req, res) => {
  console.log("Updating task status:", req.body);
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      console.log("Task not found:", id);
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.assignedTo.toString() !== req.user.id.toString()) {
      console.log("Unauthorized update attempt by:", req.user.id);
      return res.status(403).json({ message: "You can only update your own tasks" });
    }

    task.status = status;
    task.notes = notes || task.notes;
    if (status === "Completed") {
      task.completionDate = new Date();
    }

    await task.save();
    console.log("Task updated:", task._id);

    const adminNotif = new Notification({
      title: "Task Status Updated",
      message: `Task "${task.title}" has been updated to "${status}" by the employee.`,
      type: "task",
      category: status === "Completed" ? "task-completed" : "task-updated",
      taskId: task._id,
      userId: task.assignedBy,
      priority: task.priority,
      read: false,
    });
    await adminNotif.save();
    console.log("Admin notification created:", adminNotif._id);

    const employeeNotif = new Notification({
      title: "Task Status Updated",
      message: `Your task "${task.title}" status has been updated to "${status}".`,
      type: "task",
      category: "task-status-update",
      taskId: task._id,
      userId: task.assignedTo,
      priority: task.priority,
      read: false,
    });
    await employeeNotif.save();
    console.log("Employee notification created:", employeeNotif._id);

    res.json({ message: "Task status updated successfully", task });
  } catch (error) {
    console.error("Update task status error:", error);
    res.status(500).json({ message: "Error updating task status", error: error.message });
  }
};

export const getTaskNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      userId: req.user.id, 
      type: "task" 
    })
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

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id, 
      { read: true }, 
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Mark notification error:", error);
    res.status(500).json({ message: "Error marking notification as read", error: error.message });
  }
};