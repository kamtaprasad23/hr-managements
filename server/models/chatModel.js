import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true } // ✅ correct spelling
);

// ✅ Index for faster chat lookup and sorting
chatSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });

export default mongoose.model("Chat", chatSchema);
