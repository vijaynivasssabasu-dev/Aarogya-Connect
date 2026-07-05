import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: String,
    phone: String,
  },
  { timestamps: true }
);

export default mongoose.model("Hospital", hospitalSchema);
