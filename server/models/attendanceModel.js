import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    checkInLocation: { lat: Number, lng: Number, accuracy: Number },
    checkOutLocation: { lat: Number, lng: Number, accuracy: Number },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    status: {
      type: String,
      enum: [
        "Present",
        "Absent",
        "Late",
        "Half Day",
        "Late Login",
        "Early Checkout",
        "Incomplete",
      ],
      default: "Present",
    },
    totalHours: { type: Number, default: 0 },
    login: { type: String },
    logout: { type: String },
  },
  
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
