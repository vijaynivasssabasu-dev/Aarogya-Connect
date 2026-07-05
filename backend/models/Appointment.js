import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
    slotDate: { type: String, required: true }, // "2026-07-10"
    slotTime: { type: String, required: true }, // "17:00"
    status: {
      type: String,
      enum: ["pending_payment", "booked", "completed", "missed", "cancelled", "rescheduled"],
      default: "pending_payment",
    },
    isEmergency: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null }, // set when patient actually shows up
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    noShowCallTriggered: { type: Boolean, default: false }, // prevents duplicate calls
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
