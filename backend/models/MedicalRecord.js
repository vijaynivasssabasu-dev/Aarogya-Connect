import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    diagnosis: { type: String, required: true }, // e.g. "Acute Bronchitis" or "MRI Brain Scan"
    symptoms: [String],
    prescription: [{ medicine: String, dosage: String, duration: String, notes: String }],
    notes: String, // Findings/Notes
    attachments: [String],
    vitalSigns: {
      bloodPressure: String, heartRate: Number, temperature: Number, weight: Number, oxygenSaturation: Number,
    },
    followUpDate: Date,
    uploadedBy: { type: String, enum: ["doctor", "receptionist"], default: "doctor" },
    reportType: { type: String, enum: ["Prescription", "Scan", "Lab Test"], default: "Prescription" },
  },
  { timestamps: true }
);

medicalRecordSchema.index({ patient: 1, createdAt: -1 });
medicalRecordSchema.index({ doctor: 1, createdAt: -1 });

export default mongoose.model("MedicalRecord", medicalRecordSchema);
