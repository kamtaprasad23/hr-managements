import Notification from "../models/notificationModel.js";

export const getNotifications = async (req, res) => {
  try {
    // Fetch all notifications for the logged-in user (read and unread)
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const newNote = new Notification({ title, message, type });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: "Failed to create notification", error });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    // This can now handle marking a single notification as read
    const { notificationId } = req.body;
    if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, { $set: { read: true } });
    } else {
      await Notification.updateMany({ userId: req.user.id }, { $set: { read: true } });
    }
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notifications", error });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: "Failed to delete notification", error });
  }
};