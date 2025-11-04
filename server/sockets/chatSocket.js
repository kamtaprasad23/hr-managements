import Chat from "../models/chatModel.js";

export default function chatSocket(io) {
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    // ✅ Join chat room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`📥 Joined room: ${roomId}`);
    });

    // ✅ Handle sending messages
    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, message, room } = data;

      try {
        // Save message to MongoDB (room is optional)
        const newMessage = new Chat({ senderId, receiverId, message, room });
        await newMessage.save();

        // Fetch again to include timestamps
        let savedMessage = await Chat.findById(newMessage._id).lean();

        // ✅ Fallback: ensure createdAt always exists
        if (!savedMessage.createdAt) {
          savedMessage.createdAt = new Date();
        }

        // Send message only to that specific room
        io.to(room).emit("receiveMessage", savedMessage);

        console.log(
          `💬 Message saved & sent in ${room}: ${message} at ${savedMessage.createdAt}`
        );
      } catch (err) {
        console.error("❌ Error saving message:", err);
      }
    });

    // ✅ Load chat history (always sorted)
    socket.on("loadMessages", async ({ user1, user2 }) => {
      try {
        const messages = await Chat.find({
          $or: [
            { senderId: user1, receiverId: user2 },
            { senderId: user2, receiverId: user1 },
          ],
        }).sort({ createdAt: 1 }); // ascending

        socket.emit("chatHistory", messages);
      } catch (err) {
        console.error("❌ Error loading chat history:", err);
      }
    });

    // ✅ Leave room
    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`📤 Left room: ${roomId}`);
    });

    // ✅ Disconnect cleanup
    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });
}
