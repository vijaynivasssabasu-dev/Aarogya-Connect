import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dob: Date,
    gender: String,
    phone: { type: String, required: true, unique: true }, // used for AI call + login
    email: String,
    passwordHash: String,
    bloodGroup: String,
    address: String,
    preferredLanguage: { type: String, default: null }, // remembered after first IVR call
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);
