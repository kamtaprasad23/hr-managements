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
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.deleteOne();
    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
