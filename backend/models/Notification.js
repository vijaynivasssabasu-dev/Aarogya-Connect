import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userRole: { type: String, enum: ["patient", "doctor", "receptionist", "admin"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["appointment", "payment", "medical_record", "system", "reminder", "ai_call"], default: "system" },
    isRead: { type: Boolean, default: false },
    link: String,
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
