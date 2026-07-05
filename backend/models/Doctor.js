import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorCategory", required: true },
    phone: String,
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    availabilityStatus: {
      type: String,
      enum: ["available", "busy", "on_leave"],
      default: "available",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
