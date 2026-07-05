import mongoose from "mongoose";

const receptionistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
    phone: String,
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Receptionist", receptionistSchema);
