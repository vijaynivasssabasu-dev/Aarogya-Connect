import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["created", "success", "failed", "refunded"], default: "created" },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
