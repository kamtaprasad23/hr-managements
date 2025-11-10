import Chat from "../models/chatModel.js";

export default function chatSocket(io) {
  let onlineUsers = []; // Track online users

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);
    console.log("🧠 Auth data from frontend:", socket.handshake.auth);

    // ✅ Identify user from handshake
    const { userId } = socket.handshake.auth;
    if (userId && !onlineUsers.includes(userId)) {
      onlineUsers.push(userId);
      io.emit("onlineUsers", onlineUsers);
    }

    // ✅ Join/leave room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`📥 Joined room: ${roomId}`);
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`📤 Left room: ${roomId}`);
    });

    // ✅ Send message
    socket.on("sendMessage", async (data) => {
      try {
        const { senderId, receiverId, message, room, type = "text" } = data;
        if (!message || !senderId || !receiverId || !room) return;

        const newMessage = await Chat.create({
          senderId,
          receiverId,
          message,
          type,
          room,
          isDelivered: false, // single tick
          isRead: false,      // double tick
        });

        io.to(room).emit("receiveMessage", newMessage);
        console.log(`💬 [${room}] ${senderId} → ${receiverId}: ${message}`);
      } catch (err) {
        console.error("❌ Socket sendMessage error:", err);
      }
    });

    // ✅ Load chat history
    socket.on("loadMessages", async ({ user1, user2 }) => {
      try {
        const messages = await Chat.find({
          $or: [
            { senderId: user1, receiverId: user2 },
            { senderId: user2, receiverId: user1 },
          ],
        }).sort({ createdAt: 1 });
        socket.emit("chatHistory", messages);
      } catch (err) {
        console.error("❌ loadMessages error:", err);
      }
    });

    // ✅ Confirm message delivered (single tick)
    socket.on("confirmDelivered", async ({ messageId, room }) => {
      console.log("📩 confirmDelivered:", { messageId, room });
      try {
        const msg = await Chat.findById(messageId);
        if (msg && !msg.isDelivered) {
          msg.isDelivered = true;
          msg.deliveredAt = new Date();
          await msg.save();

          io.to(room).emit("messageDelivered", {
            messageId,
            deliveredAt: msg.deliveredAt,
          });
        }
      } catch (err) {
        console.error("❌ Error confirming delivery:", err);
      }
    });

    // ✅ Confirm message read (double tick)
    socket.on("confirmRead", async ({ messageIds = [], room }) => {
      console.log("📘 confirmRead:", { messageIds, room });
      try {
        if (!Array.isArray(messageIds) || messageIds.length === 0) return;

        await Chat.updateMany(
          { _id: { $in: messageIds } },
          { $set: { isRead: true, readAt: new Date() } }
        );

        io.to(room).emit("messageRead", {
          messageIds,
          readAt: new Date(),
        });
      } catch (err) {
        console.error("❌ Error confirming read:", err);
      }
    });

    // ✅ Disconnect
    socket.on("disconnect", (reason) => {
      console.log("🔴 User disconnected:", socket.id, reason);
      if (userId) {
        onlineUsers = onlineUsers.filter((id) => id !== userId);
        io.emit("onlineUsers", onlineUsers);
      }
    });
  });
}
