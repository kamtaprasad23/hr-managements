import Notification from "../models/notificationModel.js";

// ===================== GET NOTIFICATIONS =====================
export const getNotifications = async (req, res) => {
  try {
    // Fetch all notifications for the logged-in user (read and unread)
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
};

// ===================== CREATE NOTIFICATION =====================
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, userId } = req.body;

    if (!title || !message || !type) {
      return res.status(400).json({ message: "Title, message, and type are required" });
    }

    // If userId is provided, only that user will get notification
    // Otherwise, default to the logged-in user
    const recipients = userId ? [userId] : [req.user.id];

    const notifications = recipients.map(id => ({
      title,
      message,
      type,
      userId: id,
    }));

    const created = await Notification.insertMany(notifications);
    res.status(201).json({ message: "Notification(s) created successfully", notifications: created });
  } catch (error) {
    res.status(500).json({ message: "Failed to create notification", error: error.message });
  }
};

// ===================== MARK NOTIFICATIONS AS READ =====================
export const markAllAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (notificationId) {
      // Mark a single notification as read
      const notif = await Notification.findOneAndUpdate(
        { _id: notificationId, userId: req.user.id },
        { $set: { read: true } },
        { new: true }
      );
      if (!notif) return res.status(404).json({ message: "Notification not found or unauthorized" });
    } else {
      // Mark all notifications of logged-in user as read
      await Notification.updateMany({ userId: req.user.id }, { $set: { read: true } });
    }

    res.status(200).json({ message: "Notification(s) marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notifications", error: error.message });
  }
};

// ===================== DELETE NOTIFICATION =====================
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found or unauthorized" });
    }

    await notification.deleteOne();
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
