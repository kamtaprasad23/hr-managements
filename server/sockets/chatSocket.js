// 
import Chat from "../models/chatModel.js";

export default function chatSocket(io) {
  let onlineUsers = []; // Track online users

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    // ✅ Identify user from handshake (or token)
    const { userId } = socket.handshake.auth;
    if (userId && !onlineUsers.includes(userId)) {
      onlineUsers.push(userId);
      io.emit("onlineUsers", onlineUsers); // notify all clients
    }

    // ✅ Join a room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`📥 User joined room: ${roomId}`);
    });

    // ✅ Leave a room
    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`📤 User left room: ${roomId}`);
    });

    // ✅ Send a message
    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, message, room, type = "text" } = data;
      if (!message || !senderId || !receiverId || !room) return;

      try {
        const newMessage = new Chat({ senderId, receiverId, message, type, room });
        await newMessage.save();

        const savedMessage = await Chat.findById(newMessage._id).lean();
        savedMessage.createdAt = savedMessage.createdAt || new Date();

        io.to(room).emit("receiveMessage", savedMessage);
        console.log(`💬 Message sent in ${room}: ${message}`);
      } catch (err) {
        console.error("❌ Error saving message:", err);
      }
    });

    // ✅ Load chat history
    socket.on("loadMessages", async ({ user1, user2 }) => {
      if (!user1 || !user2) return;
      try {
        const messages = await Chat.find({
          $or: [
            { senderId: user1, receiverId: user2 },
            { senderId: user2, receiverId: user1 },
          ],
        }).sort({ createdAt: 1 });
        socket.emit("chatHistory", messages);
      } catch (err) {
        console.error("❌ Error loading chat history:", err);
      }
    });

    // ✅ Disconnect
    socket.on("disconnect", (reason) => {
      console.log("🔴 User disconnected:", socket.id, reason);
      if (userId) {
        onlineUsers = onlineUsers.filter((id) => id !== userId);
        io.emit("onlineUsers", onlineUsers); // update clients
      }
    });
  });
}
