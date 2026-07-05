import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 }, // TTL index: auto-deletes after 5 minutes (300 seconds)
  }
);

export default mongoose.model("OTP", otpSchema);
