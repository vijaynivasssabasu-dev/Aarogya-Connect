import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: String,
    isSuperAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
