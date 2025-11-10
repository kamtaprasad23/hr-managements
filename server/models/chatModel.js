import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["text", "image", "file"], default: "text" },
    room: { type: String, required: true }, // socket room tracking
    fileInfo: {
      url: String,
      originalname: String,
      mimetype: String,
      size: Number,
    },
    isDelivered: { type: Boolean, default: false }, // single tick
    deliveredAt: { type: Date },
    isRead: { type: Boolean, default: false },      // double tick
    readAt: { type: Date },
  },
  { timestamps: true }
);

// index for faster queries
chatSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });

export default mongoose.model("Chat", chatSchema);
